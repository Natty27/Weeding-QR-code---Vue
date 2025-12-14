<template>
  <h1 v-if="loading">Verifying...</h1>
  <h1 v-if="success" style="color: green">Welcome {{ name }}</h1>
  <h1 v-if="error" style="color: red">{{ error }} by {{ error2 }}</h1>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import { useRoute } from "vue-router";

const route = useRoute();
const loading = ref(true);
const success = ref(false);
const error = ref("");
const error2 = ref("");
const name = ref("");

onMounted(async () => {
  try {
    const res = await api.get(`/guests/verify/${route.params.token}`);
    if (res.data.success) {
      success.value = true;
      name.value = res.data.name;
    } else {
      error.value = res.data.message;
      error2.value = res.data.name;
    }
  } catch {
    error.value = "Server error";
  }
  loading.value = false;
});
</script>
