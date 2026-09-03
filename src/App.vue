<template>
  <nav v-if="showNav" class="top-nav">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        🚀 App Launch Platform
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-item">⚡ QR Pass Generator</router-link>
        <router-link to="/information" class="nav-item">ℹ️ Event Info</router-link>
      </div>
    </div>
  </nav>
  <router-view />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

/**
 * The guest-facing pages (scanned pass + information page) are full-screen
 * phone layouts, so the staff navigation only shows on the admin screens.
 */
const showNav = computed(() => ["Admin", "AdminPage"].includes(route.name));
</script>

<style>
.top-nav {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #F8FAFC;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-item {
  color: #94A3B8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  color: #F8FAFC;
  background: rgba(99, 102, 241, 0.2);
}
</style>
