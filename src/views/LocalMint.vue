<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost" 
      :expectedNetwork="expectedNetwork"
     storeAddress="0x942ED2fa862887Dc698682cc6a86355324F0f01e"
     tokenAddress="0x8D81A3DCd17030cD5F23Ac7370e4Efb10D2b3cA4"
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
    const expectedNetwork = ChainIds.Localhost;
    return {
      expectedNetwork
    }
  }
});
</script>
