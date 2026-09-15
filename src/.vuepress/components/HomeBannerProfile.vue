<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vuepress/client";
import { isLinkHttp } from "vuepress/shared";
import { useData } from "vuepress-theme-plume/composables";

interface Action {
  link: string;
  text: string;
  theme?: "brand" | "alt";
}

interface Hero {
  name: string;
  tagline?: string;
  text?: string;
  actions?: Action[];
}

interface Profile {
  avatar?: string;
  name?: string;
  description?: string;
}

const props = defineProps<{
  banner?: string;
  bannerMask?: number | { light?: number; dark?: number };
  hero: Hero;
  profile: Profile;
}>();

const { isDark } = useData();

const bannerUrl = computed(() => {
  if (!props.banner) return "";
  return isLinkHttp(props.banner) ? props.banner : withBase(props.banner);
});

const avatarUrl = computed(() => {
  if (!props.profile.avatar) return "";
  return isLinkHttp(props.profile.avatar)
    ? props.profile.avatar
    : withBase(props.profile.avatar);
});

const maskOpacity = computed(() => {
  if (typeof props.bannerMask === "number") return props.bannerMask;
  return isDark.value
    ? props.bannerMask?.dark ?? 0.5
    : props.bannerMask?.light ?? 0.2;
});
</script>

<template>
  <section
    class="home-banner-profile"
    :style="{ backgroundImage: `url(${bannerUrl})` }"
  >
    <div
      class="home-banner-profile__mask"
      :style="{ opacity: maskOpacity }"
    />

    <div class="home-banner-profile__container">
      <div class="home-banner-profile__hero">
        <h1>{{ hero.name }}</h1>

        <p v-if="hero.tagline" class="home-banner-profile__tagline">
          <span aria-hidden="true" />
          {{ hero.tagline }}
        </p>

        <p v-if="hero.text" class="home-banner-profile__text">
          {{ hero.text }}
        </p>

        <div v-if="hero.actions?.length" class="home-banner-profile__actions">
          <a
            v-for="action in hero.actions"
            :key="action.link"
            :href="withBase(action.link)"
            :class="['home-banner-profile__action', action.theme ?? 'brand']"
          >
            {{ action.text }}
          </a>
        </div>
      </div>

      <aside class="home-banner-profile__profile" aria-label="个人信息">
        <img v-if="avatarUrl" :src="avatarUrl" alt="Recursion 的头像">
        <div>
          <h2 v-if="profile.name">{{ profile.name }}</h2>
          <p v-if="profile.description">{{ profile.description }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.home-banner-profile {
  position: relative;
  min-height: calc(100vh - var(--vp-nav-height));
  overflow: hidden;
  color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.home-banner-profile__mask {
  position: absolute;
  inset: 0;
  background: #000;
}

.home-banner-profile__container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: clamp(48px, 8vw, 120px);
  align-items: center;
  width: min(100% - 64px, 1104px);
  min-height: calc(100vh - var(--vp-nav-height));
  padding: 64px 0;
  margin: 0 auto;
}

.home-banner-profile__hero h1 {
  margin: 0;
  font-size: clamp(72px, 7vw, 100px);
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.home-banner-profile__tagline {
  display: flex;
  gap: 16px;
  align-items: center;
  margin: 24px 0 0;
  font-size: clamp(24px, 2.2vw, 32px);
  font-weight: 500;
  color: rgb(255 255 255 / 72%);
}

.home-banner-profile__tagline span {
  width: 80px;
  border-top: 1px solid currentcolor;
}

.home-banner-profile__text {
  margin: 36px 0 0;
  font-size: 17px;
  font-weight: 500;
  color: rgb(255 255 255 / 92%);
}

.home-banner-profile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.home-banner-profile__action {
  padding: 10px 22px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.home-banner-profile__action:hover {
  color: #fff;
  transform: translateY(-1px);
}

.home-banner-profile__action.brand {
  background: var(--vp-c-brand-1);
}

.home-banner-profile__action.brand:hover {
  background: var(--vp-c-brand-2);
}

.home-banner-profile__action.alt {
  background: rgb(25 28 35 / 78%);
}

.home-banner-profile__action.alt:hover {
  background: rgb(25 28 35 / 92%);
}

.home-banner-profile__profile {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 28px;
  background: rgb(12 17 27 / 52%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 20%);
  backdrop-filter: blur(10px);
}

.home-banner-profile__profile img {
  width: 104px;
  height: 104px;
  object-fit: cover;
  border-radius: 10px;
}

.home-banner-profile__profile h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.home-banner-profile__profile p {
  margin: 12px 0 0;
  font-size: 17px;
  color: rgb(255 255 255 / 68%);
}

@media (max-width: 959px) {
  .home-banner-profile__container {
    grid-template-columns: 1fr;
    gap: 44px;
    align-content: center;
    width: min(100% - 48px, 720px);
    padding: 56px 0;
  }

  .home-banner-profile__profile {
    width: fit-content;
    max-width: 100%;
  }
}

@media (max-width: 479px) {
  .home-banner-profile__container {
    gap: 36px;
    width: calc(100% - 40px);
    padding: 48px 0 36px;
  }

  .home-banner-profile__hero h1 {
    font-size: 56px;
  }

  .home-banner-profile__tagline {
    gap: 12px;
    margin-top: 18px;
    font-size: 23px;
  }

  .home-banner-profile__tagline span {
    width: 56px;
  }

  .home-banner-profile__text {
    margin-top: 28px;
  }

  .home-banner-profile__profile {
    gap: 18px;
    padding: 20px;
  }

  .home-banner-profile__profile img {
    width: 76px;
    height: 76px;
  }

  .home-banner-profile__profile h2 {
    font-size: 21px;
  }

  .home-banner-profile__profile p {
    margin-top: 7px;
    font-size: 15px;
  }
}
</style>
