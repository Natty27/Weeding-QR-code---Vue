import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App)
  .use(router) // 👈 THIS LINE FIXES EVERYTHING
  .mount("#app");
