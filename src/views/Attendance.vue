<template>
  <div class="page">
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="shell">
      <header class="brand">
        <ChinetMark class="brand-mark" :height="30" />
        <h2 class="brand-name">{{ EVENT.brand }}</h2>
      </header>

      <p class="label">Guests arrived</p>

      <p class="count" :class="{ bump }">{{ attended }}</p>

      <div class="bar" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <div class="bar-fill" :style="{ width: percent + '%' }"></div>
      </div>

      <div class="stats">
        <div class="stat">
          <strong>{{ total }}</strong>
          <span>Passes issued</span>
        </div>
        <div class="stat">
          <strong>{{ pending }}</strong>
          <span>Yet to arrive</span>
        </div>
        <div class="stat">
          <strong>{{ percent }}%</strong>
          <span>Checked in</span>
        </div>
      </div>

      <footer class="foot">
        <span class="dot" :class="{ stale: !!error }"></span>
        <span v-if="error">{{ error }} — showing the last count</span>
        <span v-else-if="updatedAt">Updated {{ updatedAt }} · refreshes every {{ REFRESH_SECONDS }}s</span>
        <span v-else>Connecting…</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import api from "../services/api";
import { EVENT } from "../event";
import ChinetMark from "@/components/ChinetMark.vue";

const REFRESH_SECONDS = 5;

const attended = ref(0);
const total = ref(0);
const pending = ref(0);
const updatedAt = ref("");
const error = ref("");
const bump = ref(false);

let timer = null;
let wakeLock = null;

const percent = computed(() =>
  total.value > 0 ? Math.round((attended.value / total.value) * 100) : 0,
);

const load = async () => {
  try {
    const { data } = await api.get("/guests/attendance");

    // a change is worth a flash, so a glance at the screen catches it
    if (data.attended !== attended.value) {
      bump.value = true;
      setTimeout(() => (bump.value = false), 600);
    }

    attended.value = data.attended ?? 0;
    total.value = data.total ?? 0;
    pending.value = data.pending ?? 0;
    updatedAt.value = new Date().toLocaleTimeString();
    error.value = "";
  } catch {
    // keep the last good numbers on screen rather than blanking the display
    error.value = "Cannot reach the server";
  }
};

onMounted(async () => {
  load();
  timer = setInterval(load, REFRESH_SECONDS * 1000);

  // stops a venue display dimming mid-event, where supported
  try {
    wakeLock = await navigator.wakeLock?.request("screen");
  } catch {
    /* not supported, or the tab is not visible */
  }
});

onBeforeUnmount(() => {
  clearInterval(timer);
  wakeLock?.release?.().catch(() => {});
});
</script>

<style scoped>
.page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  padding: clamp(16px, 4vh, 40px) 20px;
  font-family: "Inter", "Noto Sans Ethiopic", system-ui, -apple-system, sans-serif;
  background:
    radial-gradient(120% 70% at 50% -10%, var(--bg-top) 0%, transparent 60%),
    linear-gradient(180deg, #0b0f24 0%, var(--bg-deep) 100%);
}

.bg-glow {
  position: absolute;
  top: -180px;
  left: 50%;
  width: 640px;
  height: 640px;
  max-width: 120vw;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgb(var(--primary-rgb) / 0.4) 0%, transparent 65%);
  pointer-events: none;
}

.shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: clamp(16px, 4vh, 40px);
}

.brand-mark {
  color: #f8fafc;
}

.brand-name {
  margin: 0;
  font-family: "Outfit", "Inter", sans-serif;
  font-size: clamp(13px, 1.6vw, 18px);
  font-weight: 700;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: #f1f5f9;
}

.label {
  margin: 0;
  font-size: clamp(12px, 1.6vw, 17px);
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--primary-soft);
}

.count {
  margin: clamp(4px, 1vh, 12px) 0;
  font-family: "Outfit", "Inter", sans-serif;
  font-size: clamp(96px, 26vw, 260px);
  font-weight: 800;
  line-height: 1;
  color: #f8fafc;
  /* digits keep their width, so the number does not jitter as it counts up */
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 60px rgb(var(--primary-rgb) / 0.55);
  transition: transform 0.3s ease, color 0.3s ease;
}

.count.bump {
  transform: scale(1.06);
  color: #fff;
}

.bar {
  height: 10px;
  margin: clamp(10px, 2.4vh, 26px) auto 0;
  border-radius: 999px;
  background: rgb(var(--tint-rgb) / 0.16);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary), #7d7dff);
  box-shadow: 0 0 18px rgb(var(--primary-rgb) / 0.6);
  transition: width 0.6s ease;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(8px, 1.5vw, 18px);
  margin-top: clamp(18px, 4vh, 42px);
}

.stat {
  padding: clamp(12px, 2vh, 22px) 10px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 24, 45, 0.6);
}

.stat strong {
  display: block;
  font-family: "Outfit", "Inter", sans-serif;
  font-size: clamp(22px, 4vw, 44px);
  font-weight: 700;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
}

.stat span {
  font-size: clamp(10px, 1.2vw, 13px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a93a8;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: clamp(16px, 3vh, 32px);
  font-size: clamp(10px, 1.1vw, 13px);
  color: #6b7a99;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
  animation: pulse 2s ease-in-out infinite;
}

.dot.stale {
  background: #f87171;
  box-shadow: 0 0 10px #f87171;
}

@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
