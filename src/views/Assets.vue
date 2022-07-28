<template>
  <div class="mx-auto max-w-xl p-2 text-left">
    <store-view :addresses="addresses" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";
import StoreView from "@/components/StoreView.vue";

export default defineComponent({
  name: "HomePage",
  components: {
    StoreView,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network);
    return {
      addresses,
    };
  },
});
</script>
