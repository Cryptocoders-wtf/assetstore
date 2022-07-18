<template>
  <span class="ml-16 font-londrina font-yusei">
    <span v-if="hasMetaMask">
      <span v-if="account">
        <button
          type="button"
          v-if="isBusy"
          class="inline-block px-6 py-2.5 text-gray-500 leading-tight rounded shadow-md"
          disabled
        >
          <img
            class="animate-spin h-3 w-8 absolute"
            src="@/assets/red160px.png"
          />
          <span class="ml-10">{{ $t("message.processing") }}</span>
        </button>
        <button
          v-else
          @click="signIn"
          class="inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          {{ $t("menu.connected") }}
        </button>
      </span>
      <span v-else>
        <button
          type="button"
          v-if="isBusy"
          class="inline-block px-6 py-2.5 text-gray-500 leading-tight rounded shadow-md"
          disabled
        >
          <img
            class="animate-spin h-3 w-8 absolute"
            src="@/assets/red160px.png"
          />
          <span class="ml-10">{{ $t("message.processing") }}</span>
        </button>
        <button
          v-else
          @click="connect"
          class="inline-block px-6 py-2.5 bg-green-500 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          {{ $t("menu.connect") }}
        </button>
      </span>
    </span>
    <span v-else>
      <button
        disabled
        class="inline-block px-6 py-2.5 bg-gray-400 text-white leading-tight rounded shadow-md"
      >
        {{ $t("menu.nometamask") }}
      </button>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { requestAccount } from "../utils/MetaMask";

export default defineComponent({
  setup() {
    const store = useStore();
    const account = computed(() => store.state.account);
    const isSignedIn = computed(() => store.getters.isSignedIn);
    const isBusy = ref("");
    const connect = async () => {
      isBusy.value = "Connecting Metamask...";
      try {
        await requestAccount(); // ethereum.on('accountsChanged') in App.vue will handle the result
      } catch (e) {
        console.log(e);
      }
      isBusy.value = "";
      console.log("*****", store.state.account);
      // signIn();
    };
    const hasMetaMask = computed(() => {
      return store.getters.hasMetaMask;
    });

    return {
      hasMetaMask,
      account,
      isSignedIn,
      isBusy,
      connect,
    };
  },
});
</script>
