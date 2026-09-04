<template>
  <div class="page">
    <div class="bg-glow" aria-hidden="true"></div>

    <form class="card" novalidate @submit.prevent="submit">
      <ChinetMark class="mark" :height="34" />
      <h1>Staff sign-in</h1>
      <p class="sub">The pass manager is for ChiNet Link event staff.</p>

      <label for="staff-key">Staff password</label>
      <div class="input-wrap">
        <span class="input-icon"><AppIcon name="lock" :size="16" /></span>
        <input
          id="staff-key"
          ref="field"
          v-model="key"
          type="password"
          autocomplete="current-password"
          placeholder="Enter the staff password"
          @input="error = ''"
        />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <!-- which backend this page signs in to: the two environments have
           different passwords, so it matters which one answered -->
      <p class="target">Signing in to {{ apiHost }}</p>

      <button class="submit" type="submit" :disabled="busy">
        <span v-if="busy" class="spinner"></span>
        {{ busy ? "Checking…" : "Sign in" }}
      </button>

      <router-link class="back" to="/information">View the event page instead</router-link>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { BACKEND_BASE_URL } from "../config";
import { setStaffKey } from "../services/auth";
import AppIcon from "@/components/AppIcon.vue";
import ChinetMark from "@/components/ChinetMark.vue";

const route = useRoute();
const router = useRouter();

const field = ref(null);
const key = ref("");
const error = ref("");
const busy = ref(false);

/** Host of the API this page talks to, shown so the environment is never a guess */
const apiHost = BACKEND_BASE_URL.replace(/^https?:\/\//, "");

onMounted(() => field.value?.focus());

const submit = async () => {
  if (!key.value) {
    error.value = "Enter the staff password";
    return;
  }

  busy.value = true;
  error.value = "";

  try {
    await api.post("/auth/login", { key: key.value });

    setStaffKey(key.value);
    router.replace(route.query.redirect || "/admin");
  } catch (e) {
    if (!e.response) {
      error.value = `Could not reach the API at ${apiHost}. Check your connection and try again.`;
    } else if (e.response.status === 503) {
      // no ADMIN_KEY on whichever API answered - name it, since the wrong
      // environment answering is the usual cause
      error.value = `${e.response.data?.message || "Staff sign-in is not configured"} — the API that answered was ${apiHost}.`;
    } else {
      error.value = e.response.data?.message || "Sign-in failed. Please try again.";
    }
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  padding: 24px 18px;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background:
    radial-gradient(120% 70% at 50% -10%, #1b1a4d 0%, transparent 60%),
    linear-gradient(180deg, #0b0f24 0%, #080b18 100%);
}

.bg-glow {
  position: absolute;
  top: -160px;
  left: 50%;
  width: 420px;
  height: 420px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 65%);
  pointer-events: none;
}

.card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  padding: 30px 24px 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 19, 38, 0.8);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 50px rgba(4, 6, 16, 0.5);
  text-align: left;
}

.mark {
  margin: 0 auto 18px;
  color: #f8fafc;
}

h1 {
  margin: 0 0 5px;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
}

.sub {
  margin: 0 0 22px;
  font-size: 12px;
  color: #8a93a8;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 7px;
  font-size: 11.5px;
  font-weight: 600;
  color: #cbd5e1;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #6b7a99;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 13px 14px 13px 40px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(8, 12, 26, 0.7);
  color: #f1f5f9;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input::placeholder {
  color: #5f6b85;
}

input:focus {
  border-color: rgba(99, 102, 241, 0.7);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.1);
  font-size: 12.5px;
  color: #fca5a5;
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  margin-top: 18px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.35);
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}

.submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.submit:disabled {
  opacity: 0.7;
  cursor: progress;
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.target {
  margin: 12px 0 0;
  font-size: 10.5px;
  color: #5a6478;
  text-align: center;
  word-break: break-all;
}

.back {
  display: block;
  margin-top: 16px;
  font-size: 11.5px;
  color: #6b7a99;
  text-align: center;
  text-decoration: none;
}

.back:hover {
  color: #a5b4fc;
}
</style>
