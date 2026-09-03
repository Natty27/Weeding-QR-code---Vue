<template>
  <!-- FIRST SCAN: collect the attendee's details before issuing the pass -->
  <Information
    v-if="needsRegistration"
    :token="token"
    :guest="guestDetails"
    @registered="onRegistered"
  />

  <div v-else class="verify-page">
    <div v-if="loading" class="card loader-card">
      <div class="spinner"></div>
      <p>Loading Pass Preview…</p>
    </div>

    <!-- VALID UNCLAIMED PASS (PREVIEW) -->
    <div v-else-if="success && passValid" class="card success">
      <div class="icon icon-valid"><AppIcon name="ticket" :size="28" /></div>
      <span class="badge" :class="ticketTypeClass">{{ ticketType }} PASS</span>
      <h1>ChiNet Link Launch Pass</h1>
      <p class="name">{{ guestName }}</p>
      <p class="org" v-if="guestOrg">{{ guestOrg }}</p>
      <p class="status valid">VALID FOR ENTRY</p>
      <p class="notice">
        <AppIcon name="info" :size="14" />
        Present this QR pass to event staff at the venue gate for check-in.
      </p>
    </div>

    <!-- CLAIMED / ALREADY CHECKED IN PASS -->
    <div v-else-if="success && !passValid" class="card claimed">
      <div class="icon icon-claimed"><AppIcon name="check" :size="26" :stroke-width="2.4" /></div>
      <span class="badge" :class="ticketTypeClass">{{ ticketType }} PASS</span>
      <h1>Check-In Complete</h1>
      <p class="name">{{ guestName }}</p>
      <p class="org" v-if="guestOrg">{{ guestOrg }}</p>
      <p class="status claimed">CHECKED IN AT GATE</p>
      <p class="used-time" v-if="usedAt">
        Checked in on {{ new Date(usedAt).toLocaleString() }}
      </p>
    </div>

    <!-- INVALID PASS -->
    <div v-else class="card error">
      <div class="icon icon-error"><AppIcon name="alert" :size="26" /></div>
      <h1>Invalid Access Pass</h1>
      <p class="error-msg">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";
import Information from "./Information.vue";
import AppIcon from "@/components/AppIcon.vue";

const route = useRoute();

const token = computed(() => String(route.params.token || ""));

const loading = ref(true);
const success = ref(false);
const passValid = ref(true);
const registered = ref(true);
const guestName = ref("");
const guestDetails = ref(null);
const ticketType = ref("Standard");
const usedAt = ref(null);
const message = ref("");

/** A valid pass nobody has filled in yet gets the information page instead */
const needsRegistration = computed(
  () => !loading.value && success.value && passValid.value && !registered.value,
);

const guestOrg = computed(() => {
  const { company, role } = guestDetails.value || {};
  return [company, role].filter(Boolean).join(" · ");
});

const ticketTypeClass = computed(() => {
  switch (ticketType.value) {
    case 'VIP': return 'badge-vip';
    case 'Media/Press': return 'badge-press';
    case 'Speaker': return 'badge-speaker';
    case 'Team': return 'badge-team';
    default: return 'badge-standard';
  }
});

const applyPass = (data) => {
  success.value = data.success !== false;
  passValid.value = data.valid !== false;
  registered.value = data.registered ?? data.guest?.registered ?? true;
  guestName.value = data.name || data.guest?.name || "Event Attendee";
  guestDetails.value = data.guest || null;
  ticketType.value = data.ticketType || data.guest?.ticketType || "Standard";
  usedAt.value = data.usedAt || data.guest?.usedAt || null;
  message.value = data.message || "";
};

/** The attendee just submitted the information page — show them their pass */
const onRegistered = (data) => {
  registered.value = true;
  passValid.value = true;
  guestName.value = data?.guest?.name || guestName.value;
  guestDetails.value = data?.guest || guestDetails.value;
  ticketType.value = data?.guest?.ticketType || ticketType.value;
  message.value = "Pass Valid For Gate Check-In";
};

onMounted(async () => {
  try {
    const res = await api.get(`/guests/verify/${token.value}`);
    applyPass(res.data);
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
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
}

.icon-valid {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #818cf8;
}

.icon-claimed {
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #34d399;
}

.icon-error {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.35);
  color: #f87171;
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

.org {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
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
  display: flex;
  align-items: flex-start;
  gap: 7px;
  text-align: left;
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
