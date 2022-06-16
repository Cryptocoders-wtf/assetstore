<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">We, <a href="https://www.singularitysociety.org/" class="underline">Singularity Society</a>, 
        have decided to create Pride Squiggle, a fully on-chain, 
        auto-generated NFT collection to celebrate Pride Month 2022.</p>
      <div class="mb-4">
        <img class="w-24 inline-block mr-2" src="@/assets/squiggle0.svg" />
        <img class="w-24 inline-block mr-2" src="@/assets/squiggle1.svg" />
        <img class="w-24 inline-block mr-2" src="@/assets/squiggle2.svg" />
        <img class="w-24 inline-block mr-2" src="@/assets/squiggle3.svg" />
      </div>
      <p class="mb-4">We are releasing {{ $n(limit) }} NFTs to the LGBT commumity and supporters for free (you need to pay a gas fee).</p>
      <p class="mb-4">All the royality from the secondary sales on OpenSee will be directly donated to a chosen charity organization, 
        who supports LGBT and human rights.</p>
      <p class="mb-4">This work was inspired by <a href="https://opensea.io/collection/nouns" class="underline">Nouns</a>
       and <a href="https://opensea.io/collection/chromie-squiggle-by-snowfro" class="underline">Chroie Squiggle</a>
       and all artworks are available as cc0. Just like Nouns, one in twenty NFTs will be distributed to the developer, 
       <a href="https://twitter.com/nounsfes" class="underline">Nounsfes ⌐◨-◨</a>.</p>
    </div>
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ $t("message."+tokenGate) }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ $t("message."+tokenGate) }}</p>
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
          <img :src="imageURL" class="mt-4 w-48"/>
        </div>
        <div>
          <img v-for="image in images" :src="image" class="w-24 inline-block mr-1 mt-1" v-bind:key="image"/>
        </div>
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
  address: "0xa0DD69F6A7623763Dc8F259687301e391C6aa386"
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
    const store = useStore();
    const tokenBalance = ref(0);
    const justMinted = ref(false);
    const limit = ref(0);
    const currentToken = ref(0);
    const imageURL = ref("");
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

    const fetchBalance = async () => {
      if (!networkContext.value) return;
      let contract = networkContext.value.contract;
      let result = await contract.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = result[0].toNumber();

      if (tokenBalance.value > 0) {
        result = await contract.functions.tokenOfOwnerByIndex(account.value, 0);
        const tokenId = result[0].toNumber();
        result = await contract.functions.generateSVG(tokenId);
        imageURL.value = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64'); 
      }

      result = await contract.functions.limit();
      limit.value = result[0].toNumber();
      result = await contract.functions.getCurrentToken();
      currentToken.value = result[0].toNumber();
      console.log("**fetchBakabce", tokenBalance.value, limit.value, currentToken.value);
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
      account,
      mint, justMinted,
      limit, currentToken,
      tokenGate,
      tokenBalance, imageURL, images,
      switchToValidNetwork
    }
  }
});
</script>
