<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x58fC3ba05dd623D6C2C901e4BBb34eDDaC01A8BE"
      tokenAddress="0xe09c4E0261FA7e860C6f2E6D8a4DBBffed573934"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintView.vue";
import { ChainIds } from "../utils/MetaMask";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    return {
      expectedNetwork
    }
  }
});
</script>
