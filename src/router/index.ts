import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "../components/Layout.vue";
import Blank from "../components/Blank.vue";
import NotFound from "../components/NotFound.vue";

import Local from "../views/Local.vue";
import Home from "../views/Home.vue";
import Mint from "../views/Mint.vue";
import TestHome from "../views/TestHome.vue";
import TestMint from "../views/TestMint.vue";
import TestMintKamon from "../views/TestMintKamon.vue";
import LocalMint from "../views/LocalMint.vue";
import LocalMintKamon from "../views/LocalMintKamon.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "assets",
    component: Home,
  },
  {
    path: "",
    component: Mint,
  },
  {
    path: "test",
    component: TestHome,
  },
  {
    path: "test_mint",
    component: TestMint,
  },
  {
    path: "test_kamon",
    component: TestMintKamon,
  },
  {
    path: "local_asset",
    component: Local,
  },
  {
    path: "local_mint",
    component: LocalMint,
  },
  {
    path: "local_kamon",
    component: LocalMintKamon,
  },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/:lang",
        component: Blank,
        children: routeChildren,
      },
      {
        path: "",
        component: Blank,
        children: routeChildren,
      },
    ],
  },
  {
    path: "/:page(.*)",
    name: "NotFoundPage",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
