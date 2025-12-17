import { createRouter, createWebHistory } from "vue-router";
import Admin from "../views/Admin.vue";
import Verify from "../views/Verify.vue";
import Common from "../views/Common.vue";
import Information from "../views/Information.vue";

const routes = [
  {
    path: "/",
    name: "admin",
    component: Admin,
  },
  {
    path: "/common",
    name: "common",
    component: Common,
  },
  {
    path: "/verify/:token",
    name: "verify",
    component: Verify,
  },

  {
    path: "/Information",
    name: "information",
    component: Information,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
