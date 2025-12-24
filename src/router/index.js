import { createRouter, createWebHistory } from "vue-router";
import Information from "@/views/Information.vue";

const routes = [
  {
    path: "/information",
    name: "Information",
    component: Information,
  },
  // Catch-all redirect
  {
    path: "/:pathMatch(.*)*", // matches anything
    redirect: "/information",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
