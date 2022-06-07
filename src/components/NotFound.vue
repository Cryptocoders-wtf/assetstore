<template>
  <div class="lg:flex mt-10">
    <div class="lg:w-1/2 w-full">
      <img class="w-96 m-auto" src="@/assets/banner.jpeg" />
    </div>
    <div class="flex flex-1 flex-col lg:w-1/2 w-full pb-4 px-4">
      <div class="mt-4 font-londrina text-4xl">
        {{ $t("notFoundMessage") }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({});
</script>
