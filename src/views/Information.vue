<template>
  <div class="page">
    <!-- ambient background -->
    <div class="bg-arc" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>
    <div class="bg-dots" aria-hidden="true"></div>

    <div class="shell">
      <Transition name="swap" mode="out-in">
        <!-- ===== SCREEN 1: the invitation ===== -->
        <section v-if="step === 'welcome'" key="welcome" class="screen">
          <header class="brand">
            <ChinetMark class="brand-mark" :height="34" />
            <h2 class="brand-name">ChiNet Link</h2>
          </header>

          <div class="pill">Launch Day · 19 September 2026</div>

          <h1 class="title">
            Welcome to the<br />
            ChiNet <span>Launch</span>
          </h1>

          <p class="tagline">You're invited to experience what's next in logistics.</p>

          <div class="facts">
            <div class="fact">
              <span class="fact-icon"><AppIcon name="calendar" :size="16" /></span>
              <div class="fact-text">
                <strong>Saturday, Sep 19</strong>
                <span>2026</span>
              </div>
            </div>

            <div class="fact">
              <span class="fact-icon"><AppIcon name="clock" :size="16" /></span>
              <div class="fact-text">
                <strong>5:00 PM</strong>
              </div>
            </div>

            <button
              class="fact fact-link"
              type="button"
              title="Open the venue in Google Maps"
              @click="openMap"
            >
              <span class="fact-icon"><AppIcon name="pin" :size="16" /></span>
              <div class="fact-text">
                <strong>Science Museum</strong>
                <span>Addis Ababa</span>
              </div>
            </button>
          </div>

          <!-- No scanned pass and not staff: nothing to issue a pass against -->
          <div v-if="!canIssuePass" class="locked">
            <h3>Scan your pass to register</h3>
            <p>Your details are collected from the QR code on your ChiNet Link pass.</p>
            <router-link class="staff-link" to="/login">Event staff sign-in</router-link>
          </div>

          <button v-else class="submit start" type="button" @click="step = 'form'">
            <AppIcon name="ticket" :size="18" />
            Reserve your guest pass
          </button>

          <ul class="perks">
            <li v-for="perk in PERKS" :key="perk.title">
              <AppIcon :name="perk.icon" :size="15" />
              {{ perk.title }}
            </li>
          </ul>

          <footer class="foot">© 2026 ChiNet Link. All rights reserved.</footer>
        </section>

        <!-- ===== SCREEN 2: the form ===== -->
        <section v-else key="form" class="screen">
          <div v-if="done" class="form-card">
            <div class="done">
              <span class="done-icon">
                <AppIcon name="check" :size="26" :stroke-width="2.4" />
              </span>
              <h3>You're on the guest list</h3>
              <p>
                Thanks {{ form.name.split(" ")[0] }} — your pass is reserved. Keep this
                QR code with you for the gate.
              </p>
            </div>
          </div>

          <form v-else class="form-card" novalidate @submit.prevent="submit">
            <div class="form-head">
              <button class="back" type="button" aria-label="Back" @click="step = 'welcome'">
                <AppIcon name="arrow-left" :size="17" />
              </button>
              <div>
                <h3>Reserve your guest pass</h3>
                <p>Tell us a little about you so we can prepare your access.</p>
              </div>
            </div>

            <div class="field">
              <label for="guest-name">Full name</label>
              <div class="input-wrap" :class="{ invalid: errors.name }">
                <span class="input-icon"><AppIcon name="user" :size="15" /></span>
                <input
                  id="guest-name"
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Enter your full name"
                  @input="errors.name = ''"
                />
              </div>
              <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
            </div>

            <div class="field">
              <label for="guest-phone">Phone number</label>
              <div class="input-wrap" :class="{ invalid: errors.phone }">
                <span class="input-icon"><AppIcon name="phone" :size="15" /></span>
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
              <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
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
                    <AppIcon name="check" :size="9" :stroke-width="3.4" />
                  </span>
                  <AppIcon :name="role.icon" :size="21" />
                  <span class="role-label">{{ role.value }}</span>
                </button>
              </div>
              <p v-if="errors.role" class="field-error">{{ errors.role }}</p>
            </div>

            <div class="field">
              <label for="guest-company">
                Company / Organization <span class="optional">(optional)</span>
              </label>
              <div class="input-wrap">
                <span class="input-icon"><AppIcon name="building" :size="15" /></span>
                <input
                  id="guest-company"
                  v-model="form.company"
                  type="text"
                  autocomplete="organization"
                  placeholder="Enter your company"
                />
              </div>
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>

            <button class="submit" type="submit" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              <AppIcon v-else name="ticket" :size="18" />
              {{ submitting ? "Reserving your pass…" : "Confirm & Get My Pass" }}
            </button>

            <p class="privacy">
              <AppIcon name="lock" :size="12" />
              Your information is used only for event registration.
            </p>
          </form>
        </section>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { isStaff } from "../services/auth";
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

const PERKS = [
  { icon: "shield", title: "Exclusive Access" },
  { icon: "star", title: "Product Demos" },
  { icon: "users", title: "VIP Networking" },
  { icon: "gift", title: "Priority Benefits" },
];

/** Ethiopian Science Museum, Addis Ababa (9.0214518, 38.7624086) */
const MAP_URL = "https://maps.app.goo.gl/1uPKfZMXKpbJU6yy7";

/** Which of the two viewport-sized screens is showing */
const step = ref("welcome");

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

const openMap = () => window.open(MAP_URL, "_blank", "noopener");

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
      error.value =
        "Staff sign-in has expired. Sign in again to issue a pass, or scan the guest's printed pass.";
    } else {
      error.value =
        e.response?.data?.message ||
        "We couldn't reserve your pass. Please check your connection and try again.";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/*
 * Both screens are sized to the viewport so a guest never has to scroll.
 * The page still *allows* scrolling rather than clipping: when the phone
 * keyboard opens it shrinks the viewport, and a hard overflow:hidden would
 * put the field being typed in out of reach.
 */
.page {
  position: relative;
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(12px, 2.5vh, 26px) 16px;
  overflow-x: hidden;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(120% 70% at 50% -10%, #1b1a4d 0%, transparent 60%),
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
  border: 1px solid rgba(129, 140, 248, 0.22);
}

.bg-glow {
  top: -140px;
  left: 50%;
  width: 460px;
  height: 460px;
  transform: translateX(-60%);
  background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 65%);
  filter: blur(10px);
}

.bg-dots {
  top: 40px;
  right: -20px;
  width: 180px;
  height: 320px;
  opacity: 0.5;
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
  max-width: 460px;
  margin: auto;
}

.screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(9px, 1.8vh, 18px);
  width: 100%;
  text-align: center;
}

/* screen swap */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateX(14px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

/* --- brand --- */
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.brand-mark {
  color: #f8fafc;
}

.brand-name {
  margin: 0;
  font-family: "Outfit", "Inter", sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: #f1f5f9;
}

/* --- hero --- */
.pill {
  align-self: center;
  padding: 6px 15px;
  border-radius: 999px;
  border: 1px solid rgba(129, 140, 248, 0.35);
  background: rgba(99, 102, 241, 0.14);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #c7d2fe;
}

.title {
  margin: 0;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: clamp(28px, 8.6vw, 42px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: #f8fafc;
}

.title span {
  color: #6366f1;
}

.tagline {
  max-width: 34ch;
  margin: 0 auto;
  font-size: clamp(12.5px, 3.5vw, 14px);
  line-height: 1.45;
  color: #94a3b8;
}

/* --- event facts --- */
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 24, 45, 0.6);
  overflow: hidden;
}

.fact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 11px 10px;
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
  width: 27px;
  height: 27px;
  border-radius: 9px;
  background: rgba(99, 102, 241, 0.16);
  color: #a5b4fc;
}

.fact-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.fact-text strong {
  font-size: 10.5px;
  font-weight: 600;
  color: #e2e8f0;
}

.fact-text span {
  font-size: 10.5px;
  color: #8a93a8;
}

/* --- start button / locked notice --- */
.start {
  margin-top: 2px;
}

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
  margin-top: 12px;
  font-size: 11px;
  color: #6b7a99;
  text-decoration: none;
}

.staff-link:hover {
  color: #a5b4fc;
}

/* --- perks strip --- */
.perks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.perks li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 1.25;
  color: #818cf8;
  text-align: center;
}

.foot {
  font-size: 10px;
  color: #5a6478;
}

/* --- form --- */
.form-card {
  padding: 18px 16px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 19, 38, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 50px rgba(4, 6, 16, 0.5);
  text-align: left;
}

.form-head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: clamp(12px, 2vh, 18px);
}

.back {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(99, 102, 241, 0.14);
  color: #a5b4fc;
  cursor: pointer;
}

.back:hover {
  background: rgba(99, 102, 241, 0.24);
}

.form-head h3 {
  margin: 0 0 2px;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.form-head p {
  margin: 0;
  font-size: 11px;
  line-height: 1.35;
  color: #8a93a8;
}

.field {
  margin-bottom: clamp(9px, 1.6vh, 14px);
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
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
  left: 13px;
  display: grid;
  place-items: center;
  color: #6b7a99;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 11px 13px 11px 36px;
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
  font-size: 14px;
  color: #5f6b85;
}

.input-wrap input:focus {
  border-color: rgba(99, 102, 241, 0.7);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.input-wrap.invalid input {
  border-color: rgba(248, 113, 113, 0.6);
}

.field-error {
  margin: 5px 0 0;
  font-size: 10.5px;
  color: #f87171;
}

/* --- role picker --- */
.roles {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.role {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 12, 26, 0.55);
  color: #94a3b8;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
}

.role:hover {
  border-color: rgba(129, 140, 248, 0.4);
  color: #cbd5e1;
}

.role.active {
  border-color: #5b5bf5;
  background: rgba(91, 91, 245, 0.14);
  color: #f8fafc;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.role-label {
  font-size: 9.5px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  /* room for a two-word role so every tile keeps the same height */
  min-height: 2.4em;
}

.role-check {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #0d1326;
  background: #5b5bf5;
  color: #fff;
}

.roles.invalid .role {
  border-color: rgba(248, 113, 113, 0.35);
}

/* --- submit --- */
.form-error {
  margin: 0 0 11px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.1);
  font-size: 12px;
  color: #fca5a5;
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
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

.privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 11px 0 0;
  font-size: 10px;
  color: #6b7a99;
}

/* --- success state --- */
.done {
  padding: 8px 4px;
  text-align: center;
}

.done-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #34d399;
}

.done h3 {
  margin: 0 0 8px;
  font-family: "Playfair Display", "Outfit", Georgia, serif;
  font-size: 19px;
  color: #f8fafc;
}

.done p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #94a3b8;
}

/* --- very narrow phones --- */
@media (max-width: 340px) {
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
