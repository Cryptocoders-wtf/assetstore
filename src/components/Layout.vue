<template>
  <div class="layout">
    <div id="nav">
      <img class="mb-4" src="@/assets/banner.jpeg" />
      <router-link :to="localizedUrl('/')" class="text-2xl font-londrina">Top</router-link> |
      <router-link :to="localizedUrl('/nft')" class="text-2xl font-londrina">Token</router-link> |
      <!-- router-link :to="localizedUrl('/nouns')" class="text-2xl font-londrina">Nouns</router-link> | -->
      <router-link :to="localizedUrl('/about')" class="text-2xl font-londrina">About</router-link>
      <Languages class="mt-4" />
      <Connect />
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useStore } from "vuex";

import { auth } from "@/utils/firebase";
import { User } from "firebase/auth";

import { useI18nParam } from "@/i18n/utils";

import Languages from "@/components/Languages.vue";
import Connect from "@/components/Connect.vue";

interface UserData {
  user: User | null;
}

export default defineComponent({
  name: "AppLayout",
  components: {
    Languages,
    Connect
  },
  async setup() {
    const store = useStore();
    const user = reactive<UserData>({ user: null });
    useI18nParam();

    onMounted(() => {
      auth.onAuthStateChanged((fbuser) => {
        console.log("authStateChanged:");
        if (fbuser) {
          user.user = fbuser;
          store.commit("setUser", fbuser);
        } else {
          store.commit("setUser", null);
        }
      });
    });

    return {
      user,
    };
  },
});
</script>
