<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view :addresses="addresses" title="Kamon Symbols by Hakko Daiodo">
      <KamonMessage />
    </mint-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";
import MintView from "@/components/MintKamon.vue";
import KamonMessage from "@/components/KamonMessage.vue";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView,
    KamonMessage,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network)!;
    addresses.tokenAddress = addresses.kamonAddress;
    return {
      addresses,
    };
  },
});
</script>
