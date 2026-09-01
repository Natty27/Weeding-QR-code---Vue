<template>
  <div class="verify-page">
    <div v-if="loading" class="card loader-card">
      <div class="spinner"></div>
      <p>Loading Pass Preview…</p>
    </div>

    <!-- VALID UNCLAIMED PASS (PREVIEW) -->
    <div v-else-if="success && passValid" class="card success">
      <div class="icon">🚀</div>
      <span class="badge" :class="ticketTypeClass">{{ ticketType }} PASS</span>
      <h1>App Launch Event Ticket</h1>
      <p class="name">{{ guestName }}</p>
      <p class="status valid">VALID FOR ENTRY</p>
      <p class="notice">
        ℹ️ Present this QR pass to event staff at the venue gate for check-in.
      </p>
    </div>

    <!-- CLAIMED / ALREADY CHECKED IN PASS -->
    <div v-else-if="success && !passValid" class="card claimed">
      <div class="icon">✅</div>
      <span class="badge" :class="ticketTypeClass">{{ ticketType }} PASS</span>
      <h1>Check-In Complete</h1>
      <p class="name">{{ guestName }}</p>
      <p class="status claimed">CHECKED IN AT GATE</p>
      <p class="used-time" v-if="usedAt">
        Checked in on {{ new Date(usedAt).toLocaleString() }}
      </p>
    </div>

    <!-- INVALID PASS -->
    <div v-else class="card error">
      <div class="icon">⛔</div>
      <h1>Invalid Access Pass</h1>
      <p class="error-msg">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";

const route = useRoute();

const loading = ref(true);
const success = ref(false);
const passValid = ref(true);
const guestName = ref("");
const ticketType = ref("Standard");
const usedAt = ref(null);
const message = ref("");

const ticketTypeClass = computed(() => {
  switch (ticketType.value) {
    case 'VIP': return 'badge-vip';
    case 'Media/Press': return 'badge-press';
    case 'Speaker': return 'badge-speaker';
    case 'Team': return 'badge-team';
    default: return 'badge-standard';
  }
});

onMounted(async () => {
  try {
    const token = route.params.token;

    const res = await api.get(`/guests/verify/${token}`);

    success.value = res.data.success;
    passValid.value = res.data.valid !== false;
    guestName.value = res.data.name || res.data.guest?.name || "Event Attendee";
    ticketType.value = res.data.ticketType || res.data.guest?.ticketType || "Standard";
    usedAt.value = res.data.usedAt || res.data.guest?.usedAt || null;
    message.value = res.data.message || "";
  } catch (e) {
    success.value = false;
    message.value = e.response?.data?.message || "Invalid or unrecognized pass";
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
  padding: 20px;
  background: radial-gradient(circle at 50% 20%, #1E1B4B 0%, #090D16 80%);
}

.card {
  text-align: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 28px;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  max-width: 420px;
  width: 100%;
}

.icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.badge-vip { background: rgba(245, 158, 11, 0.2); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.4); }
.badge-press { background: rgba(236, 72, 153, 0.2); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.4); }
.badge-speaker { background: rgba(168, 85, 247, 0.2); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.4); }
.badge-team { background: rgba(14, 165, 233, 0.2); color: #38BDF8; border: 1px solid rgba(14, 165, 233, 0.4); }
.badge-standard { background: rgba(99, 102, 241, 0.2); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.4); }

.card h1 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #F8FAFC;
}

.name {
  font-size: 20px;
  font-weight: 700;
  color: #818CF8;
  margin-bottom: 8px;
}

.status {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
}

.status.valid {
  background: rgba(52, 211, 153, 0.15);
  color: #34D399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.status.claimed {
  background: rgba(99, 102, 241, 0.15);
  color: #818CF8;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.notice {
  font-size: 13px;
  color: #94A3B8;
  line-height: 1.5;
}

.used-time {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.error-msg {
  color: #F87171;
  font-size: 14px;
  margin-top: 8px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366F1;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
