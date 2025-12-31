<template>
  <div class="page">
    <div class="card">
      <!-- LEFT CONTENT -->
      <div class="content">
        <h1 class="title">Bruk <span>&</span> Tsion</h1>

        <!-- LINE 1 -->
        <div class="line"></div>

        <p class="subtitle">
          We warmly invite you to celebrate<br />
          our wedding day.
        </p>

        <!-- LINE 2 -->
        <div class="line"></div>

        <div class="details">
          <p><strong>ዕለት</strong> | ቀዳም ጥሪ 2 ፡ 2018 ዓ/ም</p>
          <p><strong>ሰዓት</strong> | 10:00</p>
          <p><strong>ቦታ</strong> | ሓወልቲ ሰማዕታት መቐለ</p>
        </div>

        <div class="actions">
          <button class="map-btn" @click="openMap">
            <img :src="mapsIcon" alt="Map Icon" class="map-icon" />
            View on map
          </button>
        </div>
      </div>

      <!-- RIGHT IMAGE -->
      <div class="image-wrapper">
        <img :src="weddingImage" alt="Wedding Couple" />
      </div>
    </div>
  </div>
</template>

<script setup>
import weddingImage from "@/assets/weeding.jpeg";
import mapsIcon from "@/assets/Google_Maps_icon_(2020).svg";

const openMap = () => {
  window.open(
    "https://www.google.com/maps/place/%E1%88%93%E1%8B%88%E1%88%8D%E1%89%B2+%E1%88%B0%E1%88%9B%E1%8A%A5%E1%89%B3%E1%89%B5+%E1%88%98%E1%89%90%E1%88%88+%7C+Martyrs'+Memorial+Monument+MeKele/@13.4904418,39.4593472,116m/data=!3m1!1e3!4m6!3m5!1s0x166afd13e7764125:0x4666973fabc46cd7!8m2!3d13.4904554!4d39.4593215!16s%2Fg%2F11g5zz2mp6?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
    "_blank"
  );
};
</script>

<style scoped>
/* ================= FONTS ================= */
@font-face {
  font-family: "LinotypeAperto";
  src: url("../assets/Font/linotypeaperto-bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: "Poppins";
  src: url("../assets/Font/Poppins-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
}

/* ================= PAGE ================= */
.page {
  min-height: 100vh;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-image: url(~@/assets/pattern.svg);
  background-repeat: repeat;
  background-size: auto;
  background-position: center;
}

/* ================= CARD ================= */
.card {
  width: 100%;
  max-width: 1500px;
  min-height: 780px;
  padding: 80px 96px;
  border-radius: 56px;
  background: linear-gradient(
    to bottom,
    #f6eedc 0%,
    #efe3cd 50%,
    rgba(255, 255, 255, 0.7) 100%
  );
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 72px;
  box-sizing: border-box;
}

/* ================= CONTENT ================= */
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: "Poppins", sans-serif;
}

/* ===== TITLE ===== */
.title {
  font-family: "LinotypeAperto", serif;
  font-size: 60px;
  font-weight: 700;
  margin: 0;
  color: #000;
}
.title span {
  color: #b59a63;
  margin: 0 8px;
}

/* ===== LINES ===== */
.line {
  width: 380px;
  height: 1px;
  background: #d3b88a;
  margin: 22px 0 30px;
}

/* ===== SUBTITLE ===== */
.subtitle {
  font-size: 20px;
  line-height: 1.6;
  color: #000;
}

/* ===== DETAILS ===== */
.details {
  margin-top: 6px;
}
.details p {
  font-size: 20px;
  margin: 10px 0;
}
.details strong {
  font-weight: 600;
}

/* ===== ACTIONS ===== */
.actions {
  margin-top: 42px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-btn {
  padding: 18px 56px;
  border-radius: 999px;
  border: none;
  background: #b59a63;
  color: #fff;
  font-size: 18px;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: background-color 0.3s ease;
}

.map-btn:hover {
  background: #a0895a;
}

.map-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  /* Removed the filter property to keep original colors */
}

/* ================= IMAGE ================= */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-wrapper img {
  max-height: 620px;
  width: auto;
  max-width: 100%;
  border-radius: 36px;
  object-fit: cover;
}

/* ================= MOBILE ================= */
@media (max-width: 900px) {
  .page {
    padding: 16px;
  }
  .card {
    grid-template-columns: 1fr;
    padding: 40px 28px;
    gap: 36px;
  }
  .image-wrapper {
    order: -1;
  }
  .image-wrapper img {
    max-height: 340px;
  }
  .content {
    align-items: center;
    text-align: center;
  }
  .line {
    width: 220px;
  }
  .title {
    font-size: 30px;
  }
  .subtitle,
  .details p {
    font-size: 16px;
  }
  .actions {
    justify-content: center;
  }
  .map-btn {
    padding: 16px 40px;
    font-size: 16px;
  }
  .map-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
