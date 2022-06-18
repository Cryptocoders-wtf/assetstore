<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">We, <a href="https://www.singularitysociety.org/" class="underline">Singularity Society</a>, 
        have decided to create <a href="https://opensea.io/collection/pride-squiggle-2022" class="underline">Pride Squiggle NFTs</a>, a fully on-chain, 
        generated NFT collection to celebrate Pride Month 2022.</p>
      <div class="mb-4">
        <a href="https://opensea.io/collection/pride-squiggle-2022">        
          <img class="w-24 inline-block mr-2 rounded-xl" src="@/assets/squiggle0.svg" />
          <img class="w-24 inline-block mr-2 rounded-xl" src="@/assets/squiggle1.svg" />
          <img class="w-24 inline-block mr-2 rounded-xl" src="@/assets/squiggle2.svg" />
          <img class="w-24 inline-block mr-2 rounded-xl" src="@/assets/squiggle3.svg" />
          <img class="w-24 inline-block mr-2 rounded-xl" src="@/assets/squiggle4.svg" />
        </a>
      </div>
      <p class="mb-4">We are releasing {{ $n(limit) }} NFTs to the LGBT commumity and supporters for free.</p>
      <p class="mb-4">All the royality from the secondary sales on OpenSee will be directly donated to 
        <a href="https://outrightinternational.org" class="underline">OutRight Action International</a>.
      </p>
      <img src="@/assets/outright.png" class="w-48 bg-slate-800 mb-4" />
      <p class="mb-4">This work was inspired by <a href="https://opensea.io/collection/nouns" class="underline">Nouns</a>
       and <a href="https://opensea.io/collection/chromie-squiggle-by-snowfro" class="underline">Chromie Squiggle</a>
       and, all artworks are available as cc0. Just like Nouns, one in twenty NFTs will be distributed to the developer, 
       <a href="https://twitter.com/nounsfes" class="underline">Nounsfes ⌐◨-◨</a>.</p>
    </div>
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ $t("message."+tokenGate) }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ $t("message."+tokenGate, {networkName}) }}</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
    <div v-else>
      <div>
        <b>Total Count:</b> {{ $n(limit) }}
      </div>
      <div v-if="currentToken < limit">
        <b>Next Token:</b> #{{ currentToken }}
      </div>
      <div v-else>
        Sold Out!
      </div>
      <div v-if="tokenBalance == 0" class="mt-4">
        <div v-if="justMinted">
          <p>Thank you for minting. Please wait a little bit...</p>
        </div>
        <div v-else>
          <div v-if="currentToken < limit">
            <p><button @click="mint" class="inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out">MINT</button> (free, but you need to pay a gas fee).</p>
          </div>
          <div v-else>
            Thank you for the interest, but it is sold out unfortunately.
          </div>
        </div>
      </div>
      <div v-else class="mt-4">
        <div>
          <p>Thank you for being a member of Pride Squiggle community.</p>
          <a :href="'https://opensea.io/assets/ethereum/0x433697232e3b55ec39050cb7a5678a3b1347eec4/' + tokenId">
            <img :src="imageURL" class="mt-4 w-48 rounded-xl"/>
          </a>
        </div>
      </div>
      <div class="mt-4">
        <img v-for="image in images" :src="image" class="w-24 inline-block mr-1 mt-1 rounded" v-bind:key="image"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const PrideSquiggle = {
  wabi: require("../abis/PrideSquiggle.json"), // wrapped abi
  address: "0xBD875B4379E638CeDb69c171A43040E5295236ab"
};

const shorten = (address: string) => {
  return address.substring(0,6) + "..." + address.substring(38);
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const networkName = "Rinkeby Testnet";
    const providerViewOnly = new ethers.providers.AlchemyProvider("rinkeby");
    const store = useStore();
    const tokenBalance = ref(0);
    const justMinted = ref(false);
    const limit = ref(0);
    const currentToken = ref(0);
    const imageURL = ref("");
    const tokenId = ref(0);
    const images = ref([] as Array<string>);

    let prevProvider:ethers.providers.Web3Provider | null = null;
    const networkContext = computed(() => {
      if (prevProvider) {
        console.log("Calling removeAllListners()");
        prevProvider.removeAllListeners();
        prevProvider = null;
      }

      if (store.state.account && store.state.chainId == expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(PrideSquiggle.address, PrideSquiggle.wabi.abi, signer);
        const mintFilter = contract.filters.NounBought();
        provider.on(mintFilter, (log, event) => {
          console.log("**** got mint event", log, event);
          justMinted.value = false;
          fetchBalance();
        });
        prevProvider = provider;
        if (window.location.href == "http://localhost:8080/") {
          fetchImages(contract);
        }

        return { provider, signer, contract };
      }
      return null;
    });

    const fetchImages = async(contract: any) => {
        // debug only
        let i = 0;
        for (i = 0; i < 100; i++) {
          const result = await contract.functions.generateSVG(i);
          images.value[i] = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64'); 
        }
    };

    const fetchLimit = async(contract:any) => {
      let result = await contract.functions.limit();
      limit.value = result[0].toNumber();
      result = await contract.functions.getCurrentToken();
      currentToken.value = result[0].toNumber();
      console.log("**fetchLimit", limit.value, currentToken.value);
    };

    const fetchBalance = async () => {
      if (!networkContext.value) return;
      let contract = networkContext.value.contract;
      let result = await contract.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = result[0].toNumber();

      if (tokenBalance.value > 0) {
        result = await contract.functions.tokenOfOwnerByIndex(account.value, 0);
        tokenId.value = result[0].toNumber();
        result = await contract.functions.generateSVG(tokenId.value);
        imageURL.value = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64'); 
      }

      await fetchLimit(contract);
    };

    const mint = async () => {
      if (!networkContext.value) return;
      await networkContext.value.contract.functions.mint();
      justMinted.value = true;
    };
    const tokenGate = computed(()=>{
      if (!store.state.account) {
        return "noAccount"
      }
      if (store.state.chainId != expectedNetwork) {
        return "invalidNetwork"
      }
      fetchBalance();
      return "valid";      
    });
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }
    const account = computed(()=>{
      if (store.state.account) {
        return store.state.account.toLowerCase();
      }
      return null;
    });    
    return {
      account, networkName,
      mint, justMinted,
      limit, currentToken,
      tokenGate,
      tokenBalance, imageURL, images, tokenId,
      switchToValidNetwork
    }
  }
});
</script>
