<template>
  <div class="lg:flex mt-10">
    <div class="flex flex-1 flex-col lg:w-1/2 w-full pb-4 px-4">
      <div class="mt-4 font-londrina text-4xl">
        {{ $t("message.notFoundMessage") }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({});
</script>
