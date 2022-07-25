import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Layout from "../components/Layout.vue";
import Blank from "../components/Blank.vue";
import NotFound from "../components/NotFound.vue";

import Assets from "../views/Assets.vue";
import Materials from "../views/Materials.vue";
import Kamons from "../views/Kamons.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "",
    component: Assets,
  },
  {
    path: "material",
    component: Materials,
  },
  {
    path: "kamon",
    component: Kamons,
  },
  {
    path: "group/:group?/:path(category)?/:category?",
    component: Assets,
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
    component: Layout,
    children: [
      {
        path: "",
        component: NotFound,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
