<template>
  <div>
    <div v-if="availableAssets == null">
      <p>{{ $t("message.loading") }}</p>
    </div>
    <div v-else-if="availableAssets.length == 0">
      <p>
        {{ $tc("assetPanel.thanks", { totalCount: loadedAssets.length }) }}
      </p>
    </div>
    <div v-else>
      <p class="mb-2">
        {{ $t("assetPanel.mint") }}
      </p>
      <slot />
      <span v-for="asset in availableAssets" v-bind:key="asset.name">
        <img
          @click="$emit('onSelect', asset)"
          :src="asset.image"
          class="inline-block w-16 cursor-pointer rounded-xl"
        />
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["availableAssets", "loadedAssets"],
});
</script>
