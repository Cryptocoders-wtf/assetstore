<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x9E6C03CffCB92c60B137076526fd079212882968"
      tokenAddress="0x7a711cbFb665ce4ACc0d86a9511130d6958a09D1"
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
