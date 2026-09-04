<template>
  <div class="page">
    <!-- ambient background -->
    <div class="bg-arc" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>
    <div class="bg-dots" aria-hidden="true"></div>

    <div class="shell">
      <section class="screen">
        <header class="brand">
          <ChinetMark class="brand-mark" :height="30" />
          <h2 class="brand-name">{{ EVENT.brand }}</h2>
        </header>

        <div class="pill">{{ EVENT.badge }}</div>

        <h1 class="title">
          Welcome to the<br />
          ChiNet <span>Launch</span>
        </h1>

        <p class="tagline">{{ EVENT.tagline }}</p>

        <div class="facts">
          <div class="fact">
            <span class="fact-icon"><AppIcon name="calendar" :size="15" /></span>
            <div class="fact-text">
              <strong>{{ EVENT.dayShort }}</strong>
              <span>{{ EVENT.year }}</span>
            </div>
          </div>

          <div class="fact">
            <span class="fact-icon"><AppIcon name="clock" :size="15" /></span>
            <div class="fact-text">
              <strong>{{ EVENT.time }}</strong>
            </div>
          </div>

          <button
            class="fact fact-link"
            type="button"
            title="Open the venue in Google Maps"
            @click="openMap"
          >
            <span class="fact-icon"><AppIcon name="pin" :size="15" /></span>
            <div class="fact-text">
              <strong>{{ EVENT.venue }}</strong>
              <span>{{ EVENT.city }}</span>
            </div>
          </button>
        </div>

        <!-- No scanned pass and not staff: nothing to issue a pass against -->
        <div v-if="!canIssuePass" class="locked">
          <h3>Scan your pass to register</h3>
          <p>Your details are collected from the QR code on your {{ EVENT.brand }} pass.</p>
          <router-link class="staff-link" to="/login">Event staff sign-in</router-link>
        </div>

        <div v-else-if="done" class="form-card">
          <div class="done">
            <span class="done-icon">
              <AppIcon name="check" :size="24" :stroke-width="2.4" />
            </span>
            <h3>You're on the guest list</h3>
            <p>
              Thanks {{ form.name.split(" ")[0] }} — your pass is reserved. Keep this QR
              code with you for the gate.
            </p>
          </div>
        </div>

        <form v-else class="form-card" novalidate @submit.prevent="submit">
          <h3 class="form-title">Reserve your guest pass</h3>

          <div class="field">
            <label for="guest-name">Full name</label>
            <div class="input-wrap" :class="{ invalid: errors.name }">
              <span class="input-icon"><AppIcon name="user" :size="14" /></span>
              <input
                id="guest-name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Enter your full name"
                @input="errors.name = ''"
              />
            </div>
          </div>

          <div class="field">
            <label for="guest-phone">Phone number</label>
            <div class="input-wrap" :class="{ invalid: errors.phone }">
              <span class="input-icon"><AppIcon name="phone" :size="14" /></span>
              <input
                id="guest-phone"
                v-model="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="Enter your phone number"
                @input="errors.phone = ''"
              />
            </div>
          </div>

          <div class="field">
            <label>I'm joining as</label>
            <div class="roles" :class="{ invalid: errors.role }">
              <button
                v-for="role in ROLES"
                :key="role.value"
                type="button"
                class="role"
                :class="{ active: form.role === role.value }"
                :aria-pressed="form.role === role.value"
                @click="pickRole(role.value)"
              >
                <span v-if="form.role === role.value" class="role-check">
                  <AppIcon name="check" :size="8" :stroke-width="3.6" />
                </span>
                <AppIcon :name="role.icon" :size="19" />
                <span class="role-label">{{ role.value }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <label for="guest-company">
              Company / Organization <span class="optional">(optional)</span>
            </label>
            <div class="input-wrap">
              <span class="input-icon"><AppIcon name="building" :size="14" /></span>
              <input
                id="guest-company"
                v-model="form.company"
                type="text"
                autocomplete="organization"
                placeholder="Enter your company"
              />
            </div>
          </div>

          <!--
            One shared message line, always rendered so a validation error
            cannot grow the page past the viewport.
          -->
          <p class="notice" :class="{ empty: !notice }">{{ notice || "&nbsp;" }}</p>

          <button class="submit" type="submit" :disabled="submitting">
            <span v-if="submitting" class="spinner"></span>
            <AppIcon v-else name="ticket" :size="17" />
            {{ submitting ? "Reserving your pass…" : "Confirm & Get My Pass" }}
          </button>
        </form>

        <footer class="foot">© {{ EVENT.year }} {{ EVENT.brand }}. All rights reserved.</footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { isStaff } from "../services/auth";
import { EVENT } from "../event";
import AppIcon from "@/components/AppIcon.vue";
import ChinetMark from "@/components/ChinetMark.vue";

const props = defineProps({
  /** Token of the printed pass the attendee just scanned, when embedded in the pass flow */
  token: { type: String, default: "" },
  /** Anything already known about the guest, used to prefill the form */
  guest: { type: Object, default: null },
});

const emit = defineEmits(["registered"]);

const route = useRoute();
const router = useRouter();

const ROLES = [
  { value: "Carrier", icon: "truck" },
  { value: "Shipper", icon: "package" },
  { value: "Broker", icon: "handshake" },
  { value: "Government Official", icon: "landmark" },
  { value: "Other", icon: "dots" },
];

/** Pass token: from the parent (scan flow), the route, or ?token= */
const passToken = computed(
  () => props.token || route.params.token || route.query.token || "",
);

/**
 * A pass can only be issued against a scanned QR code, or by signed-in staff
 * registering someone who turned up without a printed pass.
 */
const canIssuePass = computed(() => !!passToken.value || isStaff());

const form = reactive({ name: "", phone: "", role: "", company: "" });
const errors = reactive({ name: "", phone: "", role: "" });
const error = ref("");
const submitting = ref(false);
const done = ref(false);

/**
 * The page has no room to grow, so validation and server errors share one
 * line instead of adding a message under each field.
 */
const notice = computed(
  () => error.value || errors.name || errors.phone || errors.role || "",
);

watch(
  () => props.guest,
  (guest) => {
    if (!guest) return;
    // Only prefill real details, never the generated "Attendee #12" placeholder
    if (guest.name && !/^Attendee #/.test(guest.name)) form.name = guest.name;
    if (guest.phone) form.phone = guest.phone;
    if (guest.role) form.role = guest.role;
    if (guest.company) form.company = guest.company;
  },
  { immediate: true },
);

const pickRole = (value) => {
  form.role = value;
  errors.role = "";
};

const openMap = () => window.open(EVENT.mapUrl, "_blank", "noopener");

const validate = () => {
  errors.name = form.name.trim().length < 2 ? "Please enter your full name" : "";
  errors.phone = /^[+\d][\d\s()-]{5,}$/.test(form.phone.trim())
    ? ""
    : "Please enter a valid phone number";
  errors.role = form.role ? "" : "Choose what you're joining as";

  return !errors.name && !errors.phone && !errors.role;
};

const submit = async () => {
  error.value = "";
  if (!validate()) return;

  submitting.value = true;

  try {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      company: form.company.trim(),
    };

    const url = passToken.value
      ? `/guests/register/${passToken.value}`
      : "/guests/register";

    const res = await api.post(url, payload);

    done.value = true;

    if (passToken.value) {
      // The pass view takes over and shows the QR pass
      emit("registered", res.data);
    } else if (res.data?.token) {
      router.push(`/guests/verify/${res.data.token}`);
    }
  } catch (e) {
    if (e.response?.status === 401 && !passToken.value) {
      error.value = "Staff sign-in has expired. Sign in again to issue a pass.";
    } else {
      error.value =
        e.response?.data?.message ||
        "We couldn't reserve your pass. Check your connection and try again.";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/*
 * Everything lives on one screen: invitation and form together, sized to the
 * viewport so a guest never scrolls. The page still *allows* scrolling rather
 * than clipping, because the phone keyboard shrinks the viewport and
 * overflow:hidden would put the field being typed in out of reach.
 */
.page {
  position: relative;
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(10px, 1.8vh, 22px) 14px;
  overflow-x: hidden;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(120% 70% at 50% -10%, var(--bg-top) 0%, transparent 60%),
    linear-gradient(180deg, #0b0f24 0%, #080b18 100%);
}

/* --- ambient background --- */
.bg-arc,
.bg-glow,
.bg-dots {
  position: fixed;
  pointer-events: none;
}

.bg-arc {
  top: -46vw;
  left: 50%;
  width: 132vw;
  height: 132vw;
  max-width: 900px;
  max-height: 900px;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 1px solid rgb(var(--tint-rgb) / 0.25);
}

.bg-glow {
  top: -140px;
  left: 50%;
  width: 460px;
  height: 460px;
  transform: translateX(-60%);
  background: radial-gradient(circle, rgb(var(--primary-rgb) / 0.42) 0%, transparent 65%);
  filter: blur(10px);
}

.bg-dots {
  top: 30px;
  right: -20px;
  width: 170px;
  height: 300px;
  opacity: 0.45;
  background-image: radial-gradient(rgba(148, 163, 255, 0.28) 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: linear-gradient(to left, #000, transparent);
  -webkit-mask-image: linear-gradient(to left, #000, transparent);
}

.shell {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 440px;
  margin: auto;
}

.screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(7px, 1.3vh, 15px);
  width: 100%;
  text-align: center;
}

/* --- brand --- */
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.brand-mark {
  color: #f8fafc;
}

.brand-name {
  margin: 0;
  font-family: "Outfit", "Inter", sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: #f1f5f9;
}

/* --- hero --- */
.pill {
  align-self: center;
  padding: 5px 13px;
  border-radius: 999px;
  border: 1px solid rgb(var(--tint-rgb) / 0.40);
  background: rgb(var(--tint-rgb) / 0.16);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary-pale);
}

.title {
  margin: 0;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: clamp(23px, 7.4vw, 36px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: #f8fafc;
}

.title span {
  color: var(--primary-text);
}

.tagline {
  max-width: 40ch;
  margin: 0 auto;
  font-size: 12px;
  line-height: 1.4;
  color: #94a3b8;
}

/* --- event facts --- */
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-radius: 13px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 24, 45, 0.6);
  overflow: hidden;
}

.fact {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 7px;
  text-align: left;
  border: none;
  background: none;
  font: inherit;
}

.fact + .fact {
  border-left: 1px solid rgba(255, 255, 255, 0.07);
}

.fact-link {
  cursor: pointer;
}

.fact-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 25px;
  height: 25px;
  border-radius: 8px;
  background: rgb(var(--tint-rgb) / 0.18);
  color: var(--primary-soft);
}

.fact-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.fact-text strong {
  font-size: 10px;
  font-weight: 600;
  color: #e2e8f0;
}

.fact-text span {
  font-size: 10px;
  color: #8a93a8;
}

/* --- locked notice --- */
.locked {
  padding: 14px 16px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 19, 38, 0.7);
}

.locked h3 {
  margin: 0 0 6px;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 17px;
  color: #f8fafc;
}

.locked p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #94a3b8;
}

.staff-link {
  display: inline-block;
  margin-top: 11px;
  font-size: 11px;
  color: #6b7a99;
  text-decoration: none;
}

.staff-link:hover {
  color: var(--primary-soft);
}

/* --- form --- */
.form-card {
  padding: 13px 13px 14px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 19, 38, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 44px rgba(4, 6, 16, 0.5);
  text-align: left;
}

.form-title {
  margin: 0 0 clamp(8px, 1.4vh, 13px);
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
}

.field {
  margin-bottom: clamp(7px, 1.2vh, 11px);
}

.field label {
  display: block;
  margin-bottom: 4px;
  font-size: 10.5px;
  font-weight: 600;
  color: #cbd5e1;
}

.optional {
  font-weight: 500;
  color: #7c879e;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  display: grid;
  place-items: center;
  color: #6b7a99;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 9px 12px 9px 33px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(8, 12, 26, 0.7);
  color: #f1f5f9;
  font-family: inherit;
  /* 16px keeps iOS Safari from zooming in when the field is focused */
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap input::placeholder {
  font-size: 13px;
  color: #5f6b85;
}

.input-wrap input:focus {
  border-color: rgb(var(--tint-rgb) / 0.80);
  box-shadow: 0 0 0 3px rgb(var(--tint-rgb) / 0.17);
}

.input-wrap.invalid input {
  border-color: rgba(248, 113, 113, 0.6);
}

/* --- role picker --- */
.roles {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.role {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 2px 6px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 12, 26, 0.55);
  color: #94a3b8;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
}

.role:hover {
  border-color: rgb(var(--tint-rgb) / 0.46);
  color: #cbd5e1;
}

.role.active {
  border-color: var(--primary);
  background: rgb(var(--tint-rgb) / 0.16);
  color: #f8fafc;
  box-shadow: 0 0 0 3px rgb(var(--tint-rgb) / 0.14);
}

.role-label {
  font-size: 9px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  /* room for a two-word role so every tile keeps the same height */
  min-height: 2.3em;
}

.role-check {
  position: absolute;
  top: -4px;
  right: -4px;
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #0d1326;
  background: var(--primary);
  color: #fff;
}

.roles.invalid .role {
  border-color: rgba(248, 113, 113, 0.35);
}

/* --- shared message line + submit --- */
.notice {
  min-height: 1.35em;
  margin: 0 0 7px;
  font-size: 10.5px;
  line-height: 1.35;
  color: #f87171;
  text-align: center;
}

.notice.empty {
  visibility: hidden;
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  color: #fff;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgb(var(--primary-rgb) / 0.45);
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
  width: 14px;
  height: 14px;
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

.foot {
  font-size: 9.5px;
  color: #5a6478;
}

/* --- success state --- */
.done {
  padding: 6px 4px;
  text-align: center;
}

.done-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #34d399;
}

.done h3 {
  margin: 0 0 7px;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 18px;
  color: #f8fafc;
}

.done p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}

/*
 * Short screens shed the decorative lines rather than start scrolling.
 * Below roughly 620px of viewport height the form itself no longer fits, and
 * scrolling is the honest outcome - clipping the fields would be worse.
 */
@media (max-height: 730px) {
  .tagline {
    display: none;
  }

  .foot {
    display: none;
  }
}

@media (max-height: 690px) {
  .screen {
    gap: clamp(5px, 0.9vh, 11px);
  }

  .title {
    font-size: clamp(21px, 6.5vw, 30px);
    line-height: 1.06;
  }

  .field {
    margin-bottom: clamp(6px, 1vh, 9px);
  }

  .form-title {
    margin-bottom: 9px;
    font-size: 16px;
  }
}

@media (max-height: 660px) {
  .pill {
    padding: 4px 11px;
    font-size: 9px;
  }

  .fact {
    padding: 6px;
  }

  .fact-icon {
    width: 23px;
    height: 23px;
  }

  .form-card {
    padding: 11px 12px 12px;
  }
}

/* --- very narrow phones --- */
@media (max-width: 322px) {
  .facts {
    grid-template-columns: 1fr;
  }

  .fact + .fact {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .roles {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
