<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view
      network="localhost" 
      storeAddress="0x153c299219D31111f1237C86180e9962e49a33D2"
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
