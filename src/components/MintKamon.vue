<template>
  <div>
    <div v-if='lang==="ja"'>
      <p class="mb-2">これは、フル・オンチェーンNFTの表現力をより高めるために、
        ブロック・チェーン上にさまざまなベクトル画像をアップロードし、
        人類の共有アセットとして活用しようという「On-Chain Asset Store」プロジェクトの一環です。</p>
      <p class="mb-2">大量のベクトル画像をチェーン上にアップロードするには多くの「ガス代」が必要ですが、
        それをNFTをミントする方に少しつづ負担していただく「クラウドミンティング」
        という手法をみなさんにお願いしています。</p>
    </div>
    <div v-else>
      <p class="mb-2">This is a part of "On-Chain Asset Store" project, 
        which is an effort to make variety of vector assets available on
        blockchains.</p>
      <p class="mb-2">We are using the "crowd-minting", where each minter
        pays a small amount of gas fees to upload vector images to blockchains,
        and receives NFTs as rewards.</p>
    </div>
    <div>
      <div v-if="availableAssets == null">
        <p v-if='lang==="ja"'>読み込み中です...</p>
        <p v-else>Loading...</p>
      </div>
      <div v-else-if="availableAssets.length == 0">
        <p v-if='lang==="ja"'>今回の発行分（{{ totalCount }}個）に関しては、クラウドミンティングが完了いたししました。ご協力、ありがとうございます。
        さらにアイコンを追加する予定なので、少々お待ちください。</p>
        <p v-else>Thanks to all the minters, the initial release of {{ totalCount }} icons were sold out.
          We are going to add more icons soon. Please stay tuned!</p>
      </div>
      <div v-else>
        <p v-if='lang==="ja"' class="mb-2">下に表示されている家紋の一つをクリックし、
          下に表示されるミントボタンを押して下さい。</p>
        <p v-else class="mb-2">Please select one of Kamons below and the follow the instruction
          displayed below those icons.</p>
        <span v-for="asset in availableAssets" v-bind:key="asset.name">
          <img @click="() => {onSelect(asset)}" :src="asset.image" 
              class="cursor-pointer w-10 inline-block rounded-xl" />
        </span>
      </div>
    </div>
    <div v-if="selection && !selection.asset.registered" class="border shadow-md mt-2 rounded-xl pl-2 pr-2">
      <p class="mt-2"><b>{{ selection.asset.name }}</b></p>
      <div v-if="selection.isLoading">
        <img :src="selection.asset.image" class="w-16 inline-block rounded-xl m-2" />
        <p v-if='lang==="ja"' class="mb-40">ミントの準備中...</p>
        <p v-else class="mb-40">Preparing to mint...</p>
      </div>
      <div v-else>
        <img v-for="image in selection.images" :key="image"
          :src="image" class="w-16 inline-block rounded-xl m-2" />
        <div v-if="messageRef" class="mb-2">
          <div v-if="messageRef == 'message.minting'">
            <p v-if='lang==="ja"'>処理中です...</p>
            <p v-else>Processing...</p>
          </div>
          <div v-else-if="messageRef == 'message.minted'">
            <p v-if='lang==="ja"'>クラウドミンティングにご協力ありがとうございます。ブロックチェーンへの反映には少し時間がかかります。
            順調に反映されれば、このメッセージは自動的に消滅します。</p>
            <p v-else>Thank you for participating in this crowd-minting effort.
              When the blockchain is updated, this message will dissapear automatically.
            </p>
          </div>
          <div v-else>
            <p v-if='lang==="ja"'>以下のエラーメッセージを受け取りました。</p>
            <p v-else>We have received the following error message.</p>
            <p class="text-red-400">{{ messageRef }}</p>
            <p v-if='lang==="ja"'>再度、アイコンの選択からやり直してください。</p>
            <p v-else>Please try again from the selection of an icon.</p>
          </div>
        </div>
        <span v-else>
          <div v-if="tokenGate=='invalidNetwork'">
            <p v-if='lang==="ja"'>ネットワークを切り替えて下さい。</p>
            <p v-else>Please switch the network.</p>
            <button @click="switchToValidNetwork"
                  class="mb-2 inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out">Switch Network</button>
          </div>
          <div v-else-if="tokenGate=='noAccount'">
            <p v-if='lang==="ja"' class="mb-2">Metamaskと接続してください。<Connect /></p>
            <p v-else class="mb-2">Please connect with Metamask.<Connect /></p>
          </div>
          <span v-else>
            <div class="mb-4">
              <label v-if='lang==="ja"' class="block text-gray-700 text-sm mb-1" for="username">
                Asset Storeに刻み込む名前。
                <span v-if="validName">最大32バイト。</span>
                <span v-else class="text-red-600">最大32バイト。</span>
              </label>
              <label v-else class="block text-gray-700 text-sm mb-1" for="username">
                Name to be permanently stored to the Asset Store.
                <span v-if="validName">Maximum 32 bytes.</span>
                <span v-else class="text-red-600">Maximum 32 bytes.</span>
              </label>
              <input v-model.trim="minterName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="username" type="text" 
              :placeholder='lang==="ja" ? "お名前（オプション、Twitter名推奨）" : "Name (such as Twitter Id, optional)"'>
              <span v-if="validName">
                <button @click="mint" 
                  class="mt-2 inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out">Mint</button>

              </span>
              <span v-else>
                <button @click="mint" disabled 
                  class="mt-2 inline-block px-6 py-2.5 bg-gray-400 text-gray-200 leading-tight rounded shadow-md ">Mint</button>
              </span>
            </div>
            <div v-if='lang==="ja"'>
              <p class="mb-2">フリーミントですが、ガス代が0.03〜0.23ETH程度かかります（混雑状況によって大きく変動）。</p>
              <p class="mb-2">クラウドミンティングにご協力していただいた方には、
              「プライマリーNFT」と呼ばれる
              あなたがクラウドミンティングに協力した証のNFT１つと、
              転売用の「ボーナスNFT」を２つ、合計３つのNFTを発行します。</p>
            </div>
            <div v-else>
              <p class="mb-2">This is a free mint, but you need to pay the gas fee, 
                which is typically 0.03〜0.23ETH.</p>
              <p class="mb-2">If you participate in this crowd-minting effort, 
                you will receive not only the primary NFT (which is the proof that
                you are one of minters), but also two additional bonus NFTs.</p>
            </div>
          </span>
        </span>
      </div>
    </div>
  
    <div v-if="tokens.length > 0">
      <div class="mt-4 mb-4">
        <p v-if='lang==="ja"' class="font-bold">ミント済みの家紋NFT</p>
        <p v-else class="font-bold">List of crowd-minted Kamon NFTs</p>
      </div>
      <span v-for="token in tokens" :key="token.tokenId">
        <a :href="`${OpenSeaPath}/${token.tokenId}`" class="cursor-pointer" target="_blank">
          <img :src="token.image" class="w-14 inline-block rounded-xl" />
        </a>
      </span>
    </div>
    <div class="mt-2">
      <p><a :href="EtherscanStore" class="underline" target="_blank">AssetStore Etherscan</a></p>
      <p><a :href="EtherscanToken" class="underline" target="_blank">KamonToken Etherscan</a></p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from 'vue-router';
import { useI18n } from "vue-i18n";
import { ethers } from "ethers";
import { loadedAssets } from "../resources/kamon";
import { switchNetwork } from "../utils/MetaMask";
//import { getSystemErrorName } from "util";
import Connect from "@/components/Connect.vue";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};
const KamonToken = {
  wabi: require("../abis/KamonToken.json"), // wrapped abi
};

export default defineComponent({
  name: "MintView",
  components: {
    Connect
  },
  props: [
    "network",
    "storeAddress",
    "tokenAddress",
    "expectedNetwork"
  ],
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    const store = useStore();
    const route = useRoute();
    const affiliateId = (typeof route.query.ref == "string") ? parseInt(route.query.ref) || 0 : 0; 
    console.log("***", affiliateId);

    const EtherscanBase = (props.network == "rinkeby") ?
           "https://rinkeby.etherscan.io/address" : "https://etherscan.io/address";
    const OpenSeaBase = (props.network == "rinkeby") ?
          "https://testnets.opensea.io/assets/rinkeby" : "https://opensea.io/assets/ethereum";
    const EtherscanStore = `${EtherscanBase}/${props.storeAddress}`;
    const EtherscanToken = `${EtherscanBase}/${props.tokenAddress}`;
    const OpenSeaPath = `${OpenSeaBase}/${props.tokenAddress}`;
    const assetIndex = loadedAssets.reduce((prev:any, asset:any)=>{
      prev[asset.asset.name] = asset;
      return prev;
    }, {});
    const availableAssets = ref(null as Array<any> | null);
    const messageRef = ref(null as string | null);
    const encoder = new TextEncoder();
    const minterName = ref("");
    const validName = computed(() => {
      const length = encoder.encode(minterName.value).length;
      return length <= 32;
    });

    console.log("* expectedNetwork", props.expectedNetwork);
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = ;
    const provider = (props.network == "localhost") ?
      new ethers.providers.JsonRpcProvider() : new ethers.providers.AlchemyProvider(props.network);

    let prevProvider:ethers.providers.Web3Provider | null = null;
    const networkContext = computed(() => {
      if (store.state.account && store.state.chainId == props.expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(props.tokenAddress, KamonToken.wabi.abi, signer);

        return { provider, signer, contract };
      }
      return null;
    });
   const tokenGate = computed(()=>{
      if (!store.state.account) {
        return "noAccount"
      }
      if (store.state.chainId != props.expectedNetwork) {
        return "invalidNetwork"
      }
      return "valid";      
    });

    const switchToValidNetwork = async () => {
      await switchNetwork(props.expectedNetwork);
    }

    const assetStoreRO = new ethers.Contract(props.storeAddress, AssetStore.wabi.abi, provider);
    const tokenRO = new ethers.Contract(props.tokenAddress, KamonToken.wabi.abi, provider);
    const tokens = ref([] as Array<any>);
    const tokensPerAsset = ref(0);

    const selection = ref(null as any);
    const onSelect = async (asset: any) => {
      //console.log(asset);
      messageRef.value = null;
      if (selection.value && selection.value.asset.name == asset.name) {
        selection.value = null;
        return;
      }
      selection.value = {
        isLoading: true,
        asset
      };
      const promices = Array(tokensPerAsset.value-1).fill("").map((_, index) => {
        return tokenRO.functions.generateSVG(asset.svgPart, index, "item");
      });
      const images = (await Promise.all(promices)).map(result => {
        return 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64');
      });
      selection.value = { images, asset };
    }
    const mint = async() => {
      //console.log("*** mint", selection.value.asset.asset);
      if (!networkContext.value) {
        console.error("Mint: we are not supposed to come here");
        return;
      }
      const asset = selection.value.asset.asset;
      try {
        const result = await assetStoreRO.functions.getAssetIdWithName(
          asset.group, asset.category, asset.name
        );
        // Double-check if it's already minted
        if (result[0].toNumber() > 0) {
          selection.value = null;
          return;
        }
      } catch(e) {
        // this is success        
      }

      asset.soulbound = await networkContext.value.signer.getAddress();
      //console.log(asset.soulbound);
      try {
        messageRef.value = "message.minting";
        asset.minter = minterName.value;
        asset.group = ""; // gas saving
        console.log("*** minting", asset);
        const tx = await networkContext.value.contract.mintWithAsset(asset, affiliateId);
        const result = await tx.wait();
        console.log("mint:gasUsed", result.gasUsed.toNumber());
        messageRef.value = "message.minted";
      } catch(e: any) {
        console.log(e);
        messageRef.value = e.message;
      }
    }

    provider.once("block", () => {
      tokenRO.on(tokenRO.filters.Transfer(), async (from, to, tokenId) => {
        if (tokenId.toNumber() % 4 == 0 && tokenId.toNumber() >= tokens.value.length * 4) {
          console.log("*** event.Transfer calling fetchToken")
          fetchTokens();
        }
      });
    });
    
    const fetchTokens = async () => {
      if (tokensPerAsset.value == 0) {
        const result = await tokenRO.functions.tokensPerAsset();
        tokensPerAsset.value = result[0].toNumber();
      }

      const resultSupply = await tokenRO.functions.totalSupply();
      const count = resultSupply[0].toNumber() / tokensPerAsset.value;
      const promises2 = Array(count).fill({}).map(async (_, index) => {
        if (tokens.value[index]) {
          return index; // we already have it
        }

        if (index >= 0) {
          const result = await tokenRO.functions.assetIdOfToken((index) * tokensPerAsset.value);
          const assetId = result[0].toNumber();
          const attr = await assetStoreRO.functions.getAttributes(assetId);
          const name = attr[0][2];

          const asset = assetIndex[name];
          if (asset) {
            asset.registered = true;
            // Hack: Even though the name is not unique enough, this is sufficient.
            if (selection.value && name == selection.value.asset.name) {
              selection.value = null;
            }
          }
        }
        return index;        
      });
      await Promise.all(promises2);
      availableAssets.value = loadedAssets.filter((asset:any) => {
        return !asset.registered;
      });

      const promises = Array(count).fill({}).map(async (_, index) => {
        if (tokens.value[index]) {
          return tokens.value[index]; // we already have it
        }

        const result = await tokenRO.functions.assetIdOfToken(index * tokensPerAsset.value);
        const assetId = result[0].toNumber();
        const svgPart = await assetStoreRO.functions.generateSVGPart(assetId, "item");
        const svg = await tokenRO.functions.generateSVG(svgPart[0], 0, "item")
        const image = 'data:image/svg+xml;base64,' + Buffer.from(svg[0]).toString('base64');
        return { image, tokenId: index * tokensPerAsset.value }
      });
      tokens.value = await Promise.all(promises);
    };
    fetchTokens();
    
    return {
      lang,
      availableAssets, totalCount: loadedAssets.length,
      onSelect, selection, tokenGate, switchToValidNetwork, mint, 
      messageRef, minterName, validName,
      EtherscanStore, EtherscanToken, OpenSeaPath, tokens
    }
  }
});
</script>
