<template>
  <div>
    <div>
      <p class="mb-2">これは、フル・オンチェーンNFTの表現力をより高めるために、
        ブロック・チェーン上にさざまななベクトル画像をアップロードし、
        人類の共有アセットとして活用しようという「On-Chain Asset Store」プロジェクトの一環です。</p>
      <p class="mb-2">大量のベクトル画像をチェーン上にアップロードするには多くの「ガス代」が必要ですが、
        それをNFTをミントする方に少しつづ負担していただく「クラウドミンティング」
        という手法をみなさんにお願いしています。</p>
      <p class="mb-2">下に表示されているGoogle Material Iconの一つをクリックし、
        リストの下に表示されるミントボタンを押して下さい。</p>
    </div>
    <div>
      <span v-for="asset in actionAssetsRef" v-bind:key="asset.name">
        <span v-if="!asset.registered">
        <img @click="() => {onSelect(asset)}" :src="asset.image" class="w-16 inline-block rounded-xl" />
        </span>
      </span>
    </div>
    <div>
      <span v-for="asset in socialAssetsRef" v-bind:key="asset.name">
        <span v-if="!asset.registered">
        <img @click="() => {onSelect(asset)}" :src="asset.image" class="w-16 inline-block rounded-xl" />
        </span>
      </span>
    </div>
    <div v-if="selection && !selection.registered" class="border-solid border-slate-400 border-2 rounded-xl pl-2 pr-2">
      <img :src="selection.asset.image" class="w-24 inline-block rounded-xl" />
      <div v-if="messageRef">
        <p v-if="messageRef == 'message.minted'">
          クラウドミンティングにご協力ありがとうございます。ブロックチェーンへの反映には少し時間がかかります。
          順調に反映されれば、このメッセージは自動的に消滅します。
        </p>
        <p v-else>
          <p>以下のエラーメッセージを受け取りました。</p>
          <p class="text-red-400">{{ messageRef }}</p>
          <p>再度、アイコンの選択からやり直してください。</p>
        </p>
      </div>
      <span v-else>
        <div v-if="tokenGate=='invalidNetwork'">
          <button @click="switchToValidNetwork">Switch Network</button>
        </div>
        <div v-else-if="tokenGate=='noAccount'">
          Please connect Metamask.
        </div>
        <span v-else>
          <button  @click="mint" class="inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out">Mint</button>
          <p class="mb-2">フリーミントですが、ガス代が0.02〜0.05ETH程度かかります（混雑状況によって大きく変動）。</p>
          <p class="mb-2">クラウドミンティングにご協力していただいた方には、
          「ソウルバウンドNFT」と呼ばれる
          あなたのウォレット・アドレスと名前が永久に刻まれたNFT１つと、
          転売用の「ボーナスNFT」を２つ、合計３つのNFTを発行します。</p>
        </span>
      </span>
    </div>
  
    <div class="mt-4 mb-4">
      <p class="font-bold">【既にミント済みのMaterial Icon】</p>
    </div>
    <span v-for="group in groups" v-bind:key="group">
      <span v-for="category in allCategories[group]" v-bind:key="category">
        <span v-if="allAssets[group] && allAssets[group][category]">
          <span v-for="assetId in allAssets[group][category]" v-bind:key="assetId">
            <span v-if="assets[assetId]">
              <img :src="assets[assetId].svg" class="w-16 inline-block rounded-xl" />
            </span>
            <span v-else>
            ...
            </span>
          </span>
        </span>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { actionAssets, socialAssets } from "../resources/materials";
import { switchNetwork } from "../utils/MetaMask";
import { getSystemErrorName } from "util";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};
const MaterialToken = {
  wabi: require("../abis/MaterialToken.json"), // wrapped abi
};

export default defineComponent({
  name: "MintView",
  props: [
    "network",
    "storeAddress",
    "tokenAddress",
    "expectedNetwork"
  ],
  setup(props) {
    const store = useStore();
    const actionAssetsRef = ref(actionAssets);
    const socialAssetsRef = ref(socialAssets);
    const messageRef = ref(null as string | null);
    console.log("* expectedNetwork", props.expectedNetwork);
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = ;
    const provider = (props.network == "localhost") ?
      new ethers.providers.JsonRpcProvider() : new ethers.providers.AlchemyProvider("rinkeby");

    let prevProvider:ethers.providers.Web3Provider | null = null;
    const networkContext = computed(() => {
      if (store.state.account && store.state.chainId == props.expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(props.tokenAddress, MaterialToken.wabi.abi, signer);

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

    const contractRO = new ethers.Contract(props.storeAddress, AssetStore.wabi.abi, provider);
    const groups = ref([] as string[]);
    const allCategories = ref({} as {[group:string]:string[]});
    const allAssets = ref({} as {[group:string]:{[category:string]:string[]}});
    const assets = ref({} as {[assetId: string]: {[propId:string]:string}});

    const selection = ref(null as any);
    const onSelect = async (asset: any) => {
      console.log(asset);
      messageRef.value = null;
      selection.value = {
        asset
      }
    }
    const mint = async() => {
      console.log("*** mint", selection.value.asset.asset);
      if (!networkContext.value) {
        console.error("Mint: we are not supposed to come here");
        return;
      }
      const asset = selection.value.asset.asset;
      let result = await contractRO.functions.getAssetIdWithName(
        asset.group, asset.category, asset.name
      );
      // Double-check if it's already minted
      if (result[0].toNumber() > 0) {
        selection.value = null;
        return;
      }

      asset.soulbound = await networkContext.value.signer.getAddress();
      //console.log(asset.soulbound);
      try {
        const tx = await networkContext.value.contract.mintWithAsset(asset, 0);
        result = await tx.wait();
        console.log("mint:gasUsed", result.gasUsed.toNumber());
        messageRef.value = "message.minted";
      } catch(e) {
        console.log(e);
        messageRef.value = e.message;
      }
    }

    provider.once("block", () => {
      contractRO.on(contractRO.filters.GroupAdded(), (group) => {
        console.log("**** got GroupAdded event", group);
        fetchGroups(group);
      });
      contractRO.on(contractRO.filters.CategoryAdded(), (group, category) => {
        console.log("**** got CategoryAdded event", group, category);
        fetchCategories(group, category);
      });
      contractRO.on(contractRO.filters.AssetRegistered(), async (from, assetId) => {
        console.log("**** got AssetRegistered event", from, assetId.toNumber());
        const attr = (await contractRO.functions.getAttributes(assetId))[0];
        console.log(attr);
        const group = attr[0];
        const category = attr[1];
        fetchAssets(group, category);
      });
    });
    
    const markAsset = (assets: any, name:string) => {
      assets.forEach((element:any) => {
        if (element.asset.name == name) {
          console.log("match", name);
          element.registered = true;
          // Hack: Even though the name is not unique enough, this is sufficient.
          if (selection.value && name == selection.value.asset.name) {
            selection.value = null;
          }
        }
      });
      return assets.map((item:any)=>{return item});
    };

    const fetchAsset = async (assetId:string) => {
      if (!assets.value[assetId]) {
        const result = await contractRO.functions.generateSVG(assetId);
        const svg = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64');
        const value = Object.assign({}, assets.value);
        value[assetId] = { svg };
        assets.value = value;

        const assetInfo = await contractRO.functions.getAttributes(assetId);
        const category = assetInfo[0][1];
        const name = assetInfo[0][2];
        if (category == "UI Actions") {
          actionAssetsRef.value = markAsset(actionAssetsRef.value, name);
        } else if (category == "Social") {
          socialAssetsRef.value = markAsset(socialAssetsRef.value, name);
        }
      }
    };

    const fetchAssets = async(group:string, category:string) => {
      const result = await contractRO.functions.getAssetCountInCategory(group, category);
      console.log("fetchAssets called", group, category, result[0]);
      const assetCount = result[0];
      const promises = Array(assetCount).fill("").map(async (_,index) => {
        let result = await contractRO.functions.getAssetIdInCategory(group, category, index);
        const assetId = result[0].toNumber();
        fetchAsset(assetId);
        return assetId;
      });
      const assets:string[] = await Promise.all(promises);
      const value = Object.assign({}, allAssets.value) as  {[group:string]:{[category:string]:string[]}};
      if (!value[group]) {
        value[group] = {};
      }
      value[group][category] = assets;
      allAssets.value = value;   
    };

    const fetchCategories = async(group:string, category: string | null) => {
      console.log("fetchCategories called", group);

      const result = await contractRO.functions.getCategoryCount(group);
      const categoryCount = result[0];
      const promises = Array(categoryCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getCategoryNameAtIndex(group, index);
        if (!category || category == result[0]) {
          fetchAssets(group, result[0]);
        }
        return result[0];
      });
      const categories:string[] = await Promise.all(promises);

      console.log("updating categories", group, categories);
      const value = Object.assign({}, allCategories.value) as {[group:string]:string[]};
      value[group] = categories;
      allCategories.value = value;
    };

    const fetchGroups = async (group: string | null) => {
      const result = await contractRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getGroupNameAtIndex(index);
        if (!group || group == result[0]) {
          fetchCategories(result[0], null);
        }
        return result[0];
      });
      groups.value = await Promise.all(promises);
    };
    fetchGroups(null);

    return {
      groups, allCategories, allAssets, assets, actionAssetsRef, socialAssetsRef,
      onSelect, selection, tokenGate, switchToValidNetwork, mint, 
      messageRef
    }
  }
});
</script>
