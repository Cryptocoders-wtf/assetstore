<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      storeAddress="0x5FD8C5267dE0e207D4B01f97a7D9ae638e6A38D7"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintView.vue";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView
  },
  setup() {
    return {
    }
  }
});
</script>
