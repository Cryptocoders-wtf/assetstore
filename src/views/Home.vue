<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="localhost" 
      storeAddress="0x1D8D70AD07C8E7E442AD78E4AC0A16f958Eba7F0"
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
