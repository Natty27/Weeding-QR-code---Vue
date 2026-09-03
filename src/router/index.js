import { createRouter, createWebHistory } from "vue-router";
import Admin from "@/views/Admin.vue";
import Verify from "@/views/Verify.vue";
import Information from "@/views/Information.vue";
import Login from "@/views/Login.vue";
import { isStaff } from "@/services/auth";

const routes = [
  {
    path: "/",
    name: "Admin",
    component: Admin,
    meta: { requiresStaff: true },
  },
  {
    path: "/admin",
    name: "AdminPage",
    component: Admin,
    meta: { requiresStaff: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
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

/**
 * Keeps the pass manager behind the staff password. This only hides the screen -
 * the real enforcement is the guard on the API, since anyone can edit their own
 * browser storage.
 */
router.beforeEach((to) => {
  if (to.meta.requiresStaff && !isStaff()) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  if (to.name === "Login" && isStaff()) {
    return { name: "AdminPage" };
  }

  return true;
});

export default router;
