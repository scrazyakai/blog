<script setup lang="ts">
import { withBase } from 'vuepress/client';
import { technologyStack as stack } from '../data/tech-stack';
const exploring = [['React', 'react.svg'], ['LLM', 'llm.png'], ['PostgreSQL', 'postgresql.svg']];
</script>

<template>
  <section class="tech-stack" aria-label="技术栈与正在探索">
    <div class="tech-row">
      <h3>技术栈</h3>
      <div class="tech-window" tabindex="0" aria-label="技术栈，悬停或聚焦暂停滚动">
        <div class="tech-track">
          <ul v-for="copy in 2" :key="copy" :aria-hidden="copy === 2 ? true : undefined">
            <li v-for="[name, icon] in stack" :key="name">
              <img :src="withBase(`/icons/${icon}.svg`)" alt="" width="34" height="34">
              <span>{{ name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="tech-row explore-row">
      <h3>正在探索</h3>
      <ul class="exploring">
        <li v-for="[name, icon] in exploring" :key="name" :title="name === 'LLM' ? '大模型应用' : name">
          <span class="explore-icon"><img :class="{ 'llm-icon': name === 'LLM' }" :src="withBase(`/icons/${icon}`)" alt="" width="30" height="30"></span>
          <span :aria-label="name === 'LLM' ? 'LLM（大模型应用）' : undefined">{{ name }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.tech-stack { min-width: 0; border-top: 1px solid rgb(255 255 255 / 15%); }
.tech-row { display: flex; align-items: center; gap: 18px; min-width: 0; padding: 22px 0; }
h3 { flex: 0 0 64px; margin: 0; color: #fff; font-size: 14px; font-weight: 600; white-space: nowrap; }
.tech-window { min-width: 0; flex: 1; overflow: hidden; mask-image: linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent); }
.tech-track { display: flex; width: max-content; animation: tech-scroll 32s linear infinite; }
ul { display: flex; list-style: none; padding: 0; margin: 0; }
.tech-track ul { flex-shrink: 0; gap: 24px; padding-right: 24px; }
.tech-track li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 56px; font-size: 11px; white-space: nowrap; }
img { display: block; object-fit: contain; }
.tech-window:hover .tech-track, .tech-window:focus-within .tech-track { animation-play-state: paused; }
:focus-visible { outline: 2px solid #85bdff; outline-offset: 3px; }
.explore-row { border-top: 1px solid rgb(255 255 255 / 12%); padding-bottom: 0; }
.exploring { flex: 1; min-width: 0; justify-content: flex-start; gap: 24px; }
.exploring li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 56px; font-size: 11px; white-space: nowrap; }
.explore-icon { position: relative; display: grid; place-items: center; width: 30px; height: 30px; overflow: hidden; flex-shrink: 0; }
.llm-icon { position: absolute; left: 50%; top: 50%; width: 60px; height: 60px; max-width: none; transform: translate(-50%, -50%); }
@keyframes tech-scroll { to { transform: translateX(-50%); } }
@media (max-width: 600px) {
  .tech-row { gap: 10px; }
  h3 { flex-basis: 56px; font-size: 12px; }
  .exploring { gap: 7px; }
  .exploring li { min-width: 50px; gap: 5px; font-size: 10px; }
  .explore-icon { width: 26px; height: 26px; }
  .explore-icon img:not(.llm-icon) { width: 26px; height: 26px; }
  .llm-icon { width: 52px; height: 52px; transform: translate(-50%, -50%); }
}
@media (prefers-reduced-motion: reduce) {
  .tech-track { animation: none; }
  .tech-track ul[aria-hidden="true"] { display: none; }
  .tech-window { overflow-x: auto; }
}
</style>
