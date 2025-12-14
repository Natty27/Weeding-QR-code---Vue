<template>
  <div class="verify-page">
    <div v-if="loading" class="loader">Verifying invitation…</div>

    <div v-else-if="success" class="success">
      <h1>💍 Welcome</h1>
      <p class="name">{{ guestName }}</p>
      <p class="status">Invitation verified</p>
    </div>

    <div v-else class="error">
      <h1>❌ Invalid Invitation</h1>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";

const route = useRoute();

const loading = ref(true);
const success = ref(false);
const guestName = ref("");
const message = ref("");

onMounted(async () => {
  try {
    const token = route.params.token;

    const res = await api.post("http://196.190.251.148:1234/guests/verify", {
      token,
    });

    success.value = res.data.success;
    guestName.value = res.data.name || "Honored Guest";
    message.value = res.data.message || "";
  } catch (e) {
    success.value = false;
    message.value = "Verification failed";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5f7, #fff);
  font-family: "Playfair Display", serif;
}

.success,
.error {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.success h1 {
  color: #c9a24d;
}

.name {
  font-size: 22px;
  margin-top: 10px;
  font-weight: bold;
}

.status {
  margin-top: 6px;
  opacity: 0.8;
}

.error h1 {
  color: #d9534f;
}
</style>
