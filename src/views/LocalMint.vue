<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x26291175Fa0Ea3C8583fEdEB56805eA68289b105"
      tokenAddress="0x840748F7Fd3EA956E5f4c88001da5CC1ABCBc038"
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
