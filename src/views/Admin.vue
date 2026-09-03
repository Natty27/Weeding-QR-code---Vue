<template>
  <div class="page">
    <!-- HERO -->
    <header class="hero">
      <div class="brand-badge">🚀 OFFICIAL APP LAUNCH EVENT</div>
      <h1>Launch Event Pass Manager</h1>
      <p>Generate, manage & track VIP event access QR passes</p>

      <!-- STATS BAR -->
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-label">Total Passes</span>
          <span class="stat-value">{{ guests.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Revoked / Claimed</span>
          <span class="stat-value success">{{ checkedInCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pending Access</span>
          <span class="stat-value warning">{{ guests.length - checkedInCount }}</span>
        </div>
      </div>

      <!-- PRIMARY ACTION -->
      <div class="hero-actions">
        <button class="download-all primary" @click="downloadZip">
          ⚡ Download All Access Passes (ZIP)
        </button>
        <button class="btn-secondary" @click="resetAll">
          🔄 Reset All Check-Ins
        </button>
        <button class="btn-secondary" @click="signOut">
          Sign out
        </button>
      </div>

      <p v-if="authError" class="auth-error">{{ authError }}</p>
    </header>

    <div v-if="isLoading" class="overlay">
      <div class="loader-spinner"></div>
    </div>

    <!-- GENERATION SECTION -->
    <section class="actions-grid">
      <!-- BULK -->
      <section class="form-card">
        <h2>Bulk Pass Generator</h2>
        <p class="card-subtitle">Generate batch QR access passes</p>

        <div class="form-group">
          <label>Ticket Category</label>
          <select v-model="bulkTicketType" class="select-input">
            <option value="Standard">Standard Pass</option>
            <option value="VIP">VIP Pass</option>
            <option value="Media/Press">Media & Press</option>
            <option value="Speaker">Keynote Speaker</option>
            <option value="Team">Launch Team</option>
          </select>
        </div>

        <div class="input-group">
          <input
            type="number"
            v-model.number="bulkCount"
            placeholder="Quantity (e.g. 500)"
          />
          <button @click="bulkGenerate" :disabled="isCreating" class="btn-action">
            <span v-if="!isCreating">Generate Batch</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </section>

      <!-- SINGLE -->
      <section class="form-card">
        <h2>Single Access Pass</h2>
        <p class="card-subtitle">Create a personalized attendee pass</p>

        <div class="form-group">
          <label>Attendee Name (Optional)</label>
          <input
            v-model="name"
            placeholder="e.g. Sarah Connor"
            @keyup.enter="addGuest"
            class="text-input"
          />
        </div>

        <div class="form-group">
          <label>Ticket Category</label>
          <select v-model="singleTicketType" class="select-input">
            <option value="Standard">Standard Pass</option>
            <option value="VIP">VIP Pass</option>
            <option value="Media/Press">Media & Press</option>
            <option value="Speaker">Keynote Speaker</option>
            <option value="Team">Launch Team</option>
          </select>
        </div>

        <button @click="addGuest" :disabled="isCreating" class="btn-action full-width">
          <span v-if="!isCreating">+ Create Pass</span>
          <span v-else class="spinner"></span>
        </button>
      </section>
    </section>

    <!-- QR GRID HEADER -->
    <div class="section-header">
      <h2>Issued Event Passes ({{ guests.length }})</h2>
    </div>

    <!-- QR GRID -->
    <transition-group name="fade-up" tag="section" class="grid">
      <div v-for="g in guests" :key="g._id" class="guest-card" :class="{ 'used': g.used }">
        <div class="card-top">
          <span class="badge" :class="getBadgeClass(g.ticketType)">
            {{ g.ticketType || 'Standard' }}
          </span>
          <span class="status-indicator" :class="g.used ? 'used' : 'valid'">
            {{ g.used ? 'REVOKED (CLAIMED)' : 'VALID' }}
          </span>
        </div>

        <div class="qr-wrapper">
          <canvas :ref="(el) => drawQR(el, g.token)" />
        </div>

        <p class="guest-name">
          {{ g.name || `Attendee #${g.sequence}` }}
        </p>

        <div class="card-footer">
          <span class="token">#{{ g.token ? g.token.slice(0, 8) : 'ACCESS' }}</span>
          <button v-if="g.used" class="btn-reset-mini" @click="resetGuest(g._id)">Reset</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import QRCode from "qrcode";
import { clearStaffKey } from "../services/auth";

import { FRONTEND_BASE_URL } from "../config";

const router = useRouter();

const isCreating = ref(false);
const isLoading = ref(false);
const authError = ref("");

/** A 401 means the stored staff key is gone or wrong: sign back in */
const handleError = (e) => {
  if (e.response?.status === 401 || e.response?.status === 503) {
    clearStaffKey();
    router.replace({ name: "Login", query: { redirect: "/admin" } });
    return;
  }

  authError.value = e.response?.data?.message || "Something went wrong. Please try again.";
};

const signOut = () => {
  clearStaffKey();
  router.replace({ name: "Login" });
};

const name = ref("");
const singleTicketType = ref("Standard");
const bulkTicketType = ref("Standard");
const bulkCount = ref(100);
const guests = ref([]);

const checkedInCount = computed(() => {
  return guests.value.filter((g) => g.used).length;
});

const getBadgeClass = (type) => {
  switch (type) {
    case 'VIP': return 'badge-vip';
    case 'Media/Press': return 'badge-press';
    case 'Speaker': return 'badge-speaker';
    case 'Team': return 'badge-team';
    default: return 'badge-standard';
  }
};

const bulkGenerate = async () => {
  if (!bulkCount.value || bulkCount.value < 1) return;

  isCreating.value = true;
  try {
    await api.post("/guests/bulk", { count: bulkCount.value, ticketType: bulkTicketType.value });
    await load();
  } catch (e) {
    handleError(e);
  } finally {
    isCreating.value = false;
  }
};

const addGuest = async () => {
  if (isCreating.value) return;

  isCreating.value = true;
  try {
    await api.post("/guests", { name: name.value || null, ticketType: singleTicketType.value });
    name.value = "";
    await load();
  } catch (e) {
    handleError(e);
  } finally {
    isCreating.value = false;
  }
};

const load = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/guests");
    guests.value = res.data.reverse();
    authError.value = "";
  } catch (e) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
};

const resetGuest = async (id) => {
  try {
    await api.post(`/guests/reset/${id}`);
    await load();
  } catch (e) {
    handleError(e);
  }
};

const resetAll = async () => {
  if (!confirm("Are you sure you want to reset all attendee check-in statuses?")) return;
  try {
    await api.post("/guests/reset-all");
    await load();
  } catch (e) {
    handleError(e);
  }
};

/**
 * Fetched rather than navigated to, because a plain browser navigation cannot
 * carry the staff key header the download route now requires.
 */
const downloadZip = async () => {
  try {
    const res = await api.get("/guests/download/zip", { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = "chinet_launch_access_passes.zip";
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    handleError(e);
  }
};

const drawQR = (canvas, token) => {
  if (!canvas) return;

  QRCode.toCanvas(canvas, `${FRONTEND_BASE_URL}/guests/verify/${token}`, {
    width: 150,
    margin: 1,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });
};

onMounted(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px 24px;
  max-width: 1280px;
  margin: 0 auto;
  color: #F8FAFC;
}

.brand-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #818CF8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 38px;
  font-weight: 800;
  background: linear-gradient(135deg, #FFFFFF, #818CF8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.hero p {
  font-size: 16px;
  color: #94A3B8;
  margin-bottom: 24px;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 28px;
  border-radius: 16px;
  min-width: 160px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: #F8FAFC;
}

.stat-value.success { color: #34D399; }
.stat-value.warning { color: #FBBF24; }

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.download-all.primary {
  padding: 14px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}

.download-all.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.5);
}

.btn-secondary {
  padding: 14px 24px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #CBD5E1;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: rgba(51, 65, 85, 0.8);
}

.auth-error {
  max-width: 520px;
  margin: 16px auto 0;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.1);
  font-size: 13px;
  color: #FCA5A5;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.form-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.form-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #CBD5E1;
  margin-bottom: 6px;
  font-weight: 600;
}

.select-input, .text-input, .input-group input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #F8FAFC;
  font-size: 14px;
  outline: none;
}

.select-input:focus, .text-input:focus, .input-group input:focus {
  border-color: #6366F1;
}

.input-group {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 12px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-action.full-width {
  width: 100%;
  padding: 14px;
}

.section-header {
  margin-bottom: 20px;
  text-align: left;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.guest-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}

.guest-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
}

.guest-card.used {
  opacity: 0.75;
  border-color: rgba(239, 68, 68, 0.3);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.badge-vip { background: rgba(245, 158, 11, 0.2); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.4); }
.badge-press { background: rgba(236, 72, 153, 0.2); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.4); }
.badge-speaker { background: rgba(168, 85, 247, 0.2); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.4); }
.badge-team { background: rgba(14, 165, 233, 0.2); color: #38BDF8; border: 1px solid rgba(14, 165, 233, 0.4); }
.badge-standard { background: rgba(99, 102, 241, 0.2); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.4); }

.status-indicator {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.status-indicator.valid { color: #34D399; }
.status-indicator.used { color: #F87171; }

.qr-wrapper {
  background: white;
  padding: 10px;
  border-radius: 14px;
  display: inline-block;
  margin-bottom: 12px;
}

.guest-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 6px;
  color: #F8FAFC;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.token {
  font-size: 11px;
  color: #64748B;
  font-family: monospace;
}

.btn-reset-mini {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #F87171;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loader-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
