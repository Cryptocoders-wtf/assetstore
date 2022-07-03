import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "../components/Layout.vue";
import Blank from "../components/Blank.vue";
import NotFound from "../components/NotFound.vue";

import Local from "../views/Local.vue";
import Home from "../views/Home.vue";
import Mint from "../views/Mint.vue";
import LocalMint from "../views/LocalMint.vue";
import Account from "../views/Account.vue";
import About from "../views/About.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "home",
    component: Home,
  },
  {
    path: "",
    component: Mint,
  },
  {
    path: "local",
    component: Local,
  },
  {
    path: "local_mint",
    component: LocalMint,
  },
  {
    path: "about",
    component: About,
  },
  {
    path: "account",
    component: Account,
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
