<template>
  <div class="page">
    <!-- HERO -->
    <header class="hero">
      <h1>Wedding Invitation</h1>
      <p>Create elegant QR invitations for your guests</p>

      <!-- PRIMARY ACTION -->
      <div class="hero-actions">
        <button class="download-all primary" @click="downloadZip">
          Download All QR Codes (ZIP)
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="overlay">
      <div class="loader-heart"></div>
    </div>

    <!-- GENERATION SECTION -->
    <section class="actions">
      <!-- BULK -->
      <section class="form-card bulk">
        <h2>Bulk Generate Invitations</h2>

        <div class="input-group">
          <input
            type="number"
            v-model.number="bulkCount"
            placeholder="Number of QR codes (e.g. 3000)"
          />
          <button @click="bulkGenerate" :disabled="isCreating">
            <span v-if="!isCreating">Generate Bulk</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </section>

      <!-- SINGLE -->
      <section class="form-card">
        <h2>Add Guest</h2>

        <div class="input-group">
          <input
            v-model="name"
            placeholder="Guest name (optional)"
            @keyup.enter="addGuest"
          />
          <button @click="addGuest" :disabled="isCreating">
            <span v-if="!isCreating">Generate QR</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </section>
    </section>

    <!-- SECONDARY ACTION -->
    <div class="secondary-actions">
      <button class="download-all" @click="downloadAll">
        Download Individually
      </button>
    </div>

    <!-- QR GRID -->
    <transition-group name="fade-up" tag="section" class="grid">
      <div v-for="g in guests" :key="g._id" class="guest-card">
        <div class="qr-wrapper">
          <canvas :ref="(el) => drawQR(el, g.token)" />
        </div>

        <p class="guest-name">
          {{ g.name || `Invitation #${g.sequence}` }}
        </p>

        <span class="token">#{{ g.token.slice(0, 8) }}</span>
      </div>
    </transition-group>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import QRCode from "qrcode";

// 🔥 CONFIG (CHANGE ONLY HERE IF IP CHANGES)
const BACKEND_BASE_URL = "http://196.190.251.148:1234";

const isCreating = ref(false);
const isLoading = ref(false);

const name = ref("");
const guests = ref([]);
const bulkCount = ref(3000);

const bulkGenerate = async () => {
  if (!bulkCount.value || bulkCount.value < 1) return;

  isCreating.value = true;
  await api.post("/guests/bulk", { count: bulkCount.value });
  await load();
  isCreating.value = false;
};

const addGuest = async () => {
  if (isCreating.value) return;

  isCreating.value = true;
  await api.post("/guests", { name: name.value || null });
  name.value = "";
  await load();
  isCreating.value = false;
};

const load = async () => {
  isLoading.value = true;
  const res = await api.get("/guests");
  guests.value = res.data.reverse();
  isLoading.value = false;
};

// ✅ ZIP DOWNLOAD (BACKEND)
const downloadZip = () => {
  window.location.href = `${BACKEND_BASE_URL}/guests/download/zip`;
};

// ❌ Optional legacy individual download
const downloadAll = async () => {
  for (let i = 0; i < guests.value.length; i++) {
    const g = guests.value[i];

    const dataUrl = await QRCode.toDataURL(
      `${BACKEND_BASE_URL}/guests/verify/${g.token}`,
      { width: 500, margin: 2 }
    );

    const link = document.createElement("a");
    const number = String(g.sequence || i + 1).padStart(3, "0");
    link.href = dataUrl;
    link.download = `${number}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await new Promise((r) => setTimeout(r, 80));
  }
};

// 🔥 QR POINTS DIRECTLY TO BACKEND
const drawQR = (canvas, token) => {
  if (!canvas) return;

  QRCode.toCanvas(canvas, `${BACKEND_BASE_URL}/guests/verify/${token}`, {
    width: 160,
    margin: 1,
    color: {
      dark: "#8b5e3c",
      light: "#ffffff",
    },
  });
};

onMounted(load);
</script>

<style scoped>
/* 🌸 Wedding Theme Colors */
.page {
  --rose: #f7c6d0;
  --gold: #c9a24d;
  --soft: #fffaf8;
  --dark: #3b2f2f;

  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7, #fff);
  padding: 40px 20px;
  font-family: "Playfair Display", serif;
  color: var(--dark);
}

/* Page */
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7, #fff);
  padding: 40px 20px;
  font-family: "Playfair Display", serif;
  color: var(--dark);
}

/* Hero */
.hero {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeDown 1s ease;
}

.hero h1 {
  font-size: 42px;
  margin-bottom: 6px;
  color: var(--gold);
}

.hero p {
  font-size: 16px;
  opacity: 0.8;
}

/* Form */
.form-card {
  max-width: 420px;
  margin: 0 auto 40px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  animation: fadeUp 1s ease;
}

.form-card h2 {
  text-align: center;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #eee;
  font-size: 14px;
}

.input-group button {
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--gold), #e7c97a);
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.input-group button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(201, 162, 77, 0.4);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* Guest Card */
.guest-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.guest-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
}

/* QR */
.qr-wrapper {
  padding: 14px;
  border-radius: 18px;
  background: var(--soft);
  display: inline-block;
  margin-bottom: 12px;
  animation: popIn 0.6s ease;
}

.guest-name {
  font-weight: bold;
  margin-top: 6px;
}

.token {
  font-size: 11px;
  opacity: 0.5;
}

/* Animations */
.fade-up-enter-active {
  transition: all 0.6s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.download-all {
  margin: 20px auto;
  display: block;
  padding: 14px 28px;
  border-radius: 30px;
  background: linear-gradient(135deg, #c9a24d, #e7c97a);
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(201, 162, 77, 0.4);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 250, 248, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loader-heart {
  width: 40px;
  height: 40px;
  background: var(--gold);
  position: relative;
  transform: rotate(45deg);
  animation: pulse 1.2s infinite;
}

.loader-heart::before,
.loader-heart::after {
  content: "";
  width: 40px;
  height: 40px;
  background: var(--gold);
  border-radius: 50%;
  position: absolute;
}

.loader-heart::before {
  left: -20px;
}

.loader-heart::after {
  top: -20px;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
}
</style>
