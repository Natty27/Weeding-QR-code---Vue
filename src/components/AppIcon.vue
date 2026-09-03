<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="shape"
  />
</template>

<script setup>
import { computed } from "vue";

/**
 * Small stroke-icon set used across the guest-facing pages.
 * Paths are drawn on a 24x24 grid so every icon lines up optically.
 */
const ICONS = {
  calendar:
    '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.5 2"/>',
  pin: '<path d="M20 10.5c0 5.5-8 11.5-8 11.5s-8-6-8-11.5a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10.5" r="2.8"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  phone:
    '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
  building:
    '<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-4h3v4"/>',
  truck:
    '<path d="M2.5 6.5h10.5v10.5H2.5z"/><path d="M13 9.8h3.6l2.9 3.2v4H13z"/><circle cx="7" cy="19" r="1.7"/><circle cx="16.4" cy="19" r="1.7"/><path d="M8.7 17h6"/>',
  package:
    '<path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z"/><path d="M3.5 7 12 11.2 20.5 7M12 21.2V11.2"/>',
  handshake:
    '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  landmark:
    '<path d="M3 9.5 12 4.5l9 5z"/><path d="M5.2 12v6.2M9.7 12v6.2M14.3 12v6.2M18.8 12v6.2"/><path d="M4 9.5h16M3.2 18.5h17.6"/><path d="M2.5 21h19"/>',
  dots:
    '<circle cx="12" cy="12" r="9"/><circle cx="8.4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15.6" cy="12" r="1" fill="currentColor" stroke="none"/>',
  shield:
    '<path d="M12 21.5s7.5-3.4 7.5-9.5V5.5L12 2.8 4.5 5.5V12c0 6.1 7.5 9.5 7.5 9.5Z"/><path d="m9 11.8 2.2 2.2 4.3-4.3"/>',
  star: '<path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  users:
    '<circle cx="9.5" cy="8.5" r="3.4"/><path d="M3 20.5a6.5 6.5 0 0 1 13 0"/><path d="M16.2 5.7a3.4 3.4 0 0 1 0 5.6M17.5 15.5a6.5 6.5 0 0 1 3.5 5"/>',
  gift: '<rect x="3" y="8.5" width="18" height="12" rx="2"/><path d="M3 13h18M12 8.5v12"/><path d="M12 8.5S10.6 4 8.2 4a2.3 2.3 0 0 0 0 4.5ZM12 8.5S13.4 4 15.8 4a2.3 2.3 0 0 1 0 4.5Z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  check: '<path d="m5 12.8 4.6 4.7L19 7"/>',
  alert:
    '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.3" r="1" fill="currentColor" stroke="none"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5V11"/><circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none"/>',
  ticket:
    '<path d="M3 9.5V6.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 6.5v3a2.5 2.5 0 0 0 0 5v3a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-3a2.5 2.5 0 0 0 0-5Z"/><path d="M9.5 5v14"/>',
};

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.7 },
});

const shape = computed(() => ICONS[props.name] || "");
</script>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
