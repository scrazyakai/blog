<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vuepress/client";
import { isLinkHttp } from "vuepress/shared";
import { useData } from "vuepress-theme-plume/composables";
import { githubContributions } from "../data/github-contributions";

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
  github?: string;
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

const contributionLevels: Record<string, string> = {
  NONE: "level-0",
  FIRST_QUARTILE: "level-1",
  SECOND_QUARTILE: "level-2",
  THIRD_QUARTILE: "level-3",
  FOURTH_QUARTILE: "level-4",
};

const contributionLevel = (level: string) =>
  contributionLevels[level] ?? "level-0";

const dateLabel = (date: string, count: number) =>
  `${date}：${count} 次贡献`;
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

      <aside class="home-banner-profile__profile" aria-label="个人信息和 GitHub 贡献">
        <div class="home-banner-profile__identity">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Recursion 的头像">
          <div>
            <h2 v-if="profile.name">{{ profile.name }}</h2>
            <p v-if="profile.description">{{ profile.description }}</p>
            <a
              v-if="profile.github"
              class="home-banner-profile__github-link"
              :href="`https://github.com/${profile.github}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{{ profile.github }}
            </a>
          </div>
        </div>

        <div class="home-banner-profile__contributions">
          <div class="home-banner-profile__contributions-header">
            <strong>GitHub Contributions</strong>
            <span>{{ githubContributions.totalContributions }} 次贡献</span>
          </div>

          <div class="home-banner-profile__calendar" tabindex="0" aria-label="GitHub 年度贡献热力图">
            <div class="home-banner-profile__weeks">
              <div
                v-for="(week, weekIndex) in githubContributions.weeks"
                :key="weekIndex"
                class="home-banner-profile__week"
              >
                <span
                  v-for="day in week.contributionDays"
                  :key="day.date"
                  :class="['home-banner-profile__day', contributionLevel(day.contributionLevel)]"
                  :title="dateLabel(day.date, day.contributionCount)"
                />
              </div>
            </div>
          </div>

          <div class="home-banner-profile__legend">
            <span>{{ githubContributions.from }} — {{ githubContributions.to }}</span>
            <span class="home-banner-profile__legend-scale">
              少
              <i class="level-0" /><i class="level-1" /><i class="level-2" /><i class="level-3" /><i class="level-4" />
              多
            </span>
          </div>
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
  grid-template-columns: minmax(360px, 1fr) minmax(520px, 590px);
  gap: clamp(40px, 5vw, 80px);
  align-items: center;
  width: min(100% - 64px, 1280px);
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
  display: grid;
  gap: 28px;
  padding: 34px 36px 30px;
  background: rgb(12 17 27 / 52%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 22px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 20%);
  backdrop-filter: blur(10px);
}

.home-banner-profile__identity {
  display: flex;
  gap: 26px;
  align-items: center;
}

.home-banner-profile__profile img {
  width: 124px;
  height: 124px;
  object-fit: cover;
  border-radius: 10px;
}

.home-banner-profile__profile h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
}

.home-banner-profile__profile p {
  margin: 12px 0 0;
  font-size: 18px;
  color: rgb(255 255 255 / 68%);
}

.home-banner-profile__github-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 14px;
  color: rgb(255 255 255 / 58%);
  text-decoration: none;
}

.home-banner-profile__github-link:hover {
  color: #fff;
}

.home-banner-profile__contributions {
  min-width: 0;
  padding-top: 24px;
  border-top: 1px solid rgb(255 255 255 / 12%);
}

.home-banner-profile__contributions-header,
.home-banner-profile__legend {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.home-banner-profile__contributions-header {
  margin-bottom: 14px;
  font-size: 14px;
}

.home-banner-profile__contributions-header strong {
  color: rgb(255 255 255 / 90%);
}

.home-banner-profile__contributions-header span,
.home-banner-profile__legend {
  color: rgb(255 255 255 / 58%);
}

.home-banner-profile__calendar {
  max-width: 100%;
  padding-bottom: 5px;
  overflow-x: auto;
  scrollbar-color: rgb(255 255 255 / 24%) transparent;
  scrollbar-width: thin;
}

.home-banner-profile__weeks {
  display: flex;
  gap: 2px;
  width: max-content;
  min-width: 100%;
}

.home-banner-profile__week {
  display: grid;
  flex: 1 0 7px;
  grid-template-rows: repeat(7, 7px);
  gap: 3px;
}

.home-banner-profile__day,
.home-banner-profile__legend-scale i {
  display: block;
  background: rgb(255 255 255 / 10%);
  border-radius: 2px;
}

.home-banner-profile__day {
  width: 7px;
  height: 7px;
}

.home-banner-profile__day.level-1,
.home-banner-profile__legend-scale .level-1 { background: #0e4429; }
.home-banner-profile__day.level-2,
.home-banner-profile__legend-scale .level-2 { background: #006d32; }
.home-banner-profile__day.level-3,
.home-banner-profile__legend-scale .level-3 { background: #26a641; }
.home-banner-profile__day.level-4,
.home-banner-profile__legend-scale .level-4 { background: #39d353; }

.home-banner-profile__legend {
  margin-top: 10px;
  font-size: 11px;
}

.home-banner-profile__legend-scale {
  display: flex;
  gap: 4px;
  align-items: center;
}

.home-banner-profile__legend-scale i {
  width: 8px;
  height: 8px;
}

@media (max-width: 1099px) {
  .home-banner-profile__container {
    grid-template-columns: 1fr;
    gap: 44px;
    align-content: center;
    width: min(100% - 48px, 720px);
    padding: 56px 0;
  }

  .home-banner-profile__profile {
    width: min(100%, 590px);
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
    gap: 22px;
    padding: 24px 20px 22px;
  }

  .home-banner-profile__identity {
    gap: 18px;
  }

  .home-banner-profile__profile img {
    width: 86px;
    height: 86px;
  }

  .home-banner-profile__profile h2 {
    font-size: 21px;
  }

  .home-banner-profile__profile p {
    margin-top: 7px;
    font-size: 15px;
  }

  .home-banner-profile__contributions-header {
    align-items: flex-start;
  }

  .home-banner-profile__contributions-header span {
    font-size: 12px;
  }

  .home-banner-profile__week {
    flex-basis: 6px;
    grid-template-rows: repeat(7, 6px);
  }

  .home-banner-profile__weeks {
    gap: 3px;
  }

  .home-banner-profile__day {
    width: 6px;
    height: 6px;
  }
}
</style>
