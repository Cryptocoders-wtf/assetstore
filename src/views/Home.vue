<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="rinkeby" 
      storeAddress="0x06bD9a73Ed54F11b1Ed3259763e15D705F2816a3"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import StoreView from "@/components/StoreView.vue";

export default defineComponent({
  name: "HomePage",
  components: {
    StoreView
  },
  setup() {
    return {
    }
  }
});
</script>
