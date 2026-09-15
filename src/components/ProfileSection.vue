<template>
  <section class="section profile-section" aria-labelledby="profile-title">
    <div class="profile-grid">
      <div class="profile-about">
        <h2 id="profile-title" class="section-title">À propos</h2>
        <div class="about-bio" v-html="bio"></div>
        <div v-if="location" class="location-card">
          <span class="location-label">Localisation</span>
          <strong class="location-value">{{ location }}</strong>
          <iframe
            v-if="locationMapUrl"
            class="location-map"
            :src="locationMapUrl"
            title="Carte de localisation"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <a
            v-if="locationMapUrl"
            class="location-map-link"
            :href="locationMapUrl"
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir la carte
          </a>
        </div>
      </div>
      <div class="profile-teaching">
        <h3 class="teaching-title">Formation</h3>
        <p class="teaching-intro">J'enseigne aussi, pour transmettre et clarifier.</p>
        <div v-if="teachingItems && teachingItems.length" class="teaching-list">
          <div v-for="item in teachingItems" :key="item.name" class="teaching-item">
            <span class="teaching-name">{{ item.name }}</span>
            <span v-if="item.topics && item.topics.length" class="teaching-topics">
              {{ item.topics.join(", ") }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TeachingItem {
  name: string;
  topics?: string[];
}

interface Props {
  bio: string;
  location?: string;
  locationMapUrl?: string;
  teachingItems?: TeachingItem[];
}

defineProps<Props>();
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(40px, 6vw, 80px);
  max-width: 1200px;
}

.profile-about {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-about .section-title {
  margin-bottom: -10px;
}

.about-bio {
  font-size: clamp(18px, 2.5vw, 21px);
  line-height: 1.4;
  color: var(--text);
  margin: 0;
}

.location-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 18px 20px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: 6px 6px 0 var(--line);
}

.location-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
}

.location-value {
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1;
  text-transform: uppercase;
  color: var(--text);
}

.location-map {
  width: 100%;
  height: 190px;
  border: 2px solid var(--line);
  margin-top: 6px;
}

.location-map-link {
  align-self: flex-start;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  text-underline-offset: 4px;
}

.location-map-link:hover {
  color: var(--text);
}

.profile-teaching {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(24px, 4vw, 40px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.teaching-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 32px);
  line-height: 0.95;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.teaching-intro {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.teaching-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.teaching-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid var(--soft);
}

.teaching-item:last-child {
  border-bottom: none;
}

.teaching-name {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
}

.teaching-topics {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

@media (max-width: 960px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .profile-teaching {
    box-shadow: 6px 6px 0 var(--line);
  }
}
</style>
