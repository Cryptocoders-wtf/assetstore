<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view :addresses="addresses" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import StoreView from "@/components/StoreView.vue";
import { getAddresses } from "@/utils/networks";

export default defineComponent({
  name: "HomePage",
  components: {
    StoreView
  },
  setup() {
    const route = useRoute();
    const network = (typeof route.query.network == "string") ? route.query.network : "mainnet";
    const addresses = getAddresses(network);
    return {
      addresses      
    };
  },
});
</script>
