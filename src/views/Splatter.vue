<template>
  <div>
    <img :src="image" />
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
export default defineComponent({
  setup() {
    const svg =
        '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n' +
          '<path d="M 256 512 C 256 370 370 256 512 256 C 654 256 768 370 768 512 C 768 654 654 768 512 768 C 370 768 256 654 256 512 " />' +
        '</svg>\n';
    const image = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
    return {
      image
    };
  },
});
</script>