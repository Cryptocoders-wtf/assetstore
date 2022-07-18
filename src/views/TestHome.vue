<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view network="rinkeby" :storeAddress="addresses.storeAddress" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import StoreView from "@/components/StoreView.vue";
import { addresses } from "../../../contract/cache/addresses_rinkeby";

export default defineComponent({
  name: "HomePage",
  components: {
    StoreView,
  },
  setup() {
    return {
      addresses,
    };
  },
});
</script>
