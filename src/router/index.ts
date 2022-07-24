import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "../components/Layout.vue";
import Blank from "../components/Blank.vue";
import NotFound from "../components/NotFound.vue";

import Home from "../views/Home.vue";
import Mint from "../views/Mint.vue";
import MintKamon from "../views/MintKamon.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "material",
    component: Mint,
  },
  {
    path: "kamon",
    component: MintKamon,
  },
  {
    path: ":path1(group)?/:group?/:path2(category)?/:category?",
    component: Home,
  },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/:lang(en|ja)",
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
