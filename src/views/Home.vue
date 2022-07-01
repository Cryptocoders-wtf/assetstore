<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="rinkeby" 
      storeAddress="0x3Aea980E9F0b6D7e4067A0F3854a0cEfC5F5A957"
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
