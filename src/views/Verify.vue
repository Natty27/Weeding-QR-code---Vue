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
      <span class="badge" :class="ticketTypeClass">{{ ticketType }} PASS</span>
      <h1>ChiNet Link Launch Pass</h1>

      <!-- the pass itself: the same code the gate scanner reads -->
      <div class="qr-frame">
        <img v-if="qrImage" class="qr" :src="qrImage" alt="Your guest pass QR code" />
        <div v-else class="qr-loading"><div class="spinner"></div></div>
      </div>

      <p class="name">{{ guestName }}</p>
      <p class="org" v-if="guestOrg">{{ guestOrg }}</p>
      <p class="status valid">VALID FOR ENTRY</p>

      <button class="download" type="button" :disabled="!qrImage" @click="downloadQr">
        <AppIcon name="download" :size="16" />
        Save my pass
      </button>

      <p class="notice">
        <AppIcon name="info" :size="14" />
        {{ saveHint }}
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
import QRCode from "qrcode";
import { FRONTEND_BASE_URL } from "../config";

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

const qrImage = ref("");

/** iOS Safari ignores the download attribute, so it gets different wording */
const canDownload =
  typeof document !== "undefined" && "download" in document.createElement("a");

const saveHint = computed(() =>
  canDownload
    ? "Save this code or keep this page open, and show it to staff at the gate."
    : "Press and hold the code to save it to your photos, then show it at the gate.",
);

/**
 * The pass is the same URL the printed QR carries, so a saved screenshot and
 * a printed card scan identically at the gate.
 */
const buildQr = async () => {
  if (!token.value) return;

  try {
    qrImage.value = await QRCode.toDataURL(
      `${FRONTEND_BASE_URL}/guests/verify/${token.value}`,
      {
        width: 640,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#0F172A", light: "#FFFFFF" },
      },
    );
  } catch {
    qrImage.value = "";
  }
};

const passFileName = computed(() => {
  const who = (guestName.value || "guest")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

  return `ChiNet-Launch-Pass-${who}.png`;
});

const downloadQr = async () => {
  if (!qrImage.value) return;

  // a blob URL is what mobile browsers handle best for saving an image
  const blob = await (await fetch(qrImage.value)).blob();
  const url = URL.createObjectURL(blob);

  if (canDownload) {
    const link = document.createElement("a");

    link.href = url;
    link.download = passFileName.value;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    // iOS: open the image so the guest can press and hold to save it
    window.open(url, "_blank");
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

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

  if (passValid.value && registered.value) buildQr();
};

/** The attendee just submitted the information page — show them their pass */
const onRegistered = (data) => {
  registered.value = true;
  passValid.value = true;
  guestName.value = data?.guest?.name || guestName.value;
  guestDetails.value = data?.guest || guestDetails.value;
  ticketType.value = data?.guest?.ticketType || ticketType.value;
  message.value = "Pass Valid For Gate Check-In";
  buildQr();
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
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 2.4vh, 20px) 16px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: radial-gradient(circle at 50% 20%, #1E1B4B 0%, #090D16 80%);
}

.card {
  text-align: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: clamp(20px, 3.4vh, 34px) 22px;
  border-radius: 22px;
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

/* --- the QR pass --- */
.qr-frame {
  display: grid;
  place-items: center;
  width: min(200px, 52vw);
  height: min(200px, 52vw);
  margin: 0 auto 14px;
  padding: 9px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(4, 6, 16, 0.45);
}

.qr {
  display: block;
  width: 100%;
  height: 100%;
  /* keep the modules crisp instead of blurring them when scaled */
  image-rendering: pixelated;
}

.qr-loading {
  display: grid;
  place-items: center;
}

.download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 11px;
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.download:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.28);
  transform: translateY(-1px);
}

.download:disabled {
  opacity: 0.5;
  cursor: wait;
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
