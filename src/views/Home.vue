<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="rinkeby" 
      storeAddress="0x9E6C03CffCB92c60B137076526fd079212882968"
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
