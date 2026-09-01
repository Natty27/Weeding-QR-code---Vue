<template>
  <div class="page">
    <div class="card">
      <!-- LEFT CONTENT -->
      <div class="content">
        <div class="launch-badge">🚀 LAUNCH DAY ACCESS PASS</div>
        <h1 class="title">Product <span>&</span> App Launch</h1>

        <div class="line"></div>

        <p class="subtitle">
          Join us live for the official launch keynotes,<br />
          live product demos, and VIP networking party.
        </p>

        <div class="line"></div>

        <div class="details">
          <p><strong>Date</strong> | Saturday, Launch Day</p>
          <p><strong>Time</strong> | 10:00 AM UTC</p>
          <p><strong>Venue</strong> | Innovation Center Main Hall</p>
        </div>

        <div class="actions">
          <button class="map-btn" @click="openMap">
            <img :src="mapsIcon" alt="Map Icon" class="map-icon" />
            View Event Location
          </button>
        </div>
      </div>

      <!-- RIGHT IMAGE / BANNER -->
      <div class="image-wrapper">
        <div class="tech-graphic">
          <div class="glow-circle"></div>
          <div class="launch-card-graphic">
            <span class="pulse-icon">🚀</span>
            <h3>NEXT GEN APP</h3>
            <p>Official Launch Event Access</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import mapsIcon from "@/assets/Google_Maps_icon_(2020).svg";

const openMap = () => {
  window.open(
    "https://maps.google.com",
    "_blank"
  );
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #1E1B4B 0%, #090D16 80%);
}

.card {
  width: 100%;
  max-width: 1200px;
  padding: 60px;
  border-radius: 36px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.launch-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #818CF8;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.title {
  font-size: 48px;
  font-weight: 800;
  color: #F8FAFC;
  margin: 0;
}
.title span {
  color: #6366F1;
}

.line {
  width: 100%;
  max-width: 320px;
  height: 1px;
  background: rgba(99, 102, 241, 0.3);
  margin: 20px 0;
}

.subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: #CBD5E1;
}

.details p {
  font-size: 18px;
  margin: 10px 0;
  color: #F8FAFC;
}

.details strong {
  color: #818CF8;
}

.actions {
  margin-top: 32px;
}

.map-btn {
  padding: 16px 36px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.map-icon {
  width: 22px;
  height: 22px;
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-graphic {
  position: relative;
  width: 100%;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glow-circle {
  position: absolute;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseGlow 3s infinite alternate;
}

.launch-card-graphic {
  position: relative;
  z-index: 2;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  padding: 40px 30px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.pulse-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.launch-card-graphic h3 {
  font-size: 22px;
  font-weight: 800;
  color: #F8FAFC;
  margin-bottom: 6px;
}

.launch-card-graphic p {
  font-size: 13px;
  color: #94A3B8;
}

@keyframes pulseGlow {
  0% { transform: scale(0.9); opacity: 0.5; }
  100% { transform: scale(1.1); opacity: 1; }
}

@media (max-width: 900px) {
  .card {
    grid-template-columns: 1fr;
    padding: 32px 24px;
  }
}
</style>
