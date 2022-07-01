<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="localhost" 
      storeAddress="0x774372fB7c8D6e484dbc7AE9c0f7771F070C30Db"
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
