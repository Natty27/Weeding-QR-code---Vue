<template>
  <div class="page">
    <div class="card">
      <!-- TEXT -->
      <div class="content">
        <h1 class="title">Alexandra <span>&</span> Daniel</h1>

        <hr style="background-color: blueviolet" />

        <p class="subtitle">
          We warmly invite you to celebrate<br />
          our wedding day.
        </p>

        <div class="details">
          <p><strong>Date</strong> | July 12, 2025</p>
          <p><strong>Time</strong> | 4:00 PM</p>
          <p><strong>Location</strong> | Rosewood Gardens, Springfield</p>
        </div>

        <button class="map-btn">View on map</button>
      </div>

      <!-- IMAGE -->
      <div class="image-wrapper">
        <img :src="weddingImage" alt="Wedding Couple" />
      </div>
    </div>
  </div>
</template>

<script setup>
import weddingImage from "./../assets/wedding.jpg";
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

/* ===== Page ===== */
.page {
  min-height: 100vh;
  background: #ffffff;
  padding: 14px; /* small white margin */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Poppins", sans-serif;
}

/* ===== Card ===== */
.card {
  width: 100%;
  max-width: 1400px;
  min-height: 85vh;
  padding: 64px;
  border-radius: 46px;

  background: linear-gradient(135deg, #f6eedc 0%, #efe3cd 50%, #e8dac1 100%);

  display: grid;
  grid-template-columns: 1.2fr 0.8fr; /* TEXT LEFT, IMAGE RIGHT */
  gap: 48px;
  box-sizing: border-box;
}

/* ===== Content ===== */
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: 56px;
  font-weight: 600;
  margin: 0 0 20px;
}

.title span {
  color: #b59a63;
  margin: 0 6px;
}

.subtitle {
  font-size: 18px;
  line-height: 1.7;
  margin-bottom: 28px;
  color: #333;
}

.details p {
  margin: 8px 0;
  font-size: 18px;
}

.details strong {
  font-weight: 600;
}

/* ===== Button ===== */
.map-btn {
  margin-top: 34px;
  width: fit-content;
  background: #b59a63;
  color: #fff;
  border: none;
  padding: 16px 44px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
}

/* ===== Image ===== */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  width: 100%;
  max-width: 420px;
  border-radius: 34px;
  object-fit: cover;
}

/* ================================================= */
/* =================== MOBILE ====================== */
/* ================================================= */
@media (max-width: 900px) {
  .card {
    grid-template-columns: 1fr;
    padding: 32px 26px;
    min-height: auto;
  }

  /* 🔑 THIS IS THE IMPORTANT PART */
  .image-wrapper {
    order: -1; /* image moves to TOP */
  }

  .content {
    text-align: center;
    align-items: center;
  }

  .title {
    font-size: 28px;
  }

  .subtitle,
  .details p {
    font-size: 15px;
  }

  .image-wrapper img {
    max-width: 320px;
    margin-bottom: 22px;
  }
}
</style>
