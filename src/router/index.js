import { createRouter, createWebHistory } from "vue-router";
import Admin from "@/views/Admin.vue";
import Verify from "@/views/Verify.vue";
import Information from "@/views/Information.vue";

const routes = [
  {
    path: "/",
    name: "Admin",
    component: Admin,
  },
  {
    path: "/admin",
    name: "AdminPage",
    component: Admin,
  },
  {
    path: "/guests/verify/:token",
    name: "VerifyGuest",
    component: Verify,
  },
  {
    path: "/verify/:token",
    name: "Verify",
    component: Verify,
  },
  {
    path: "/information",
    name: "Information",
    component: Information,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
