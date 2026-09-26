<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vuepress/client';
import { usePostsData } from 'vuepress-theme-plume/composables';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import { backendStack } from '../data/tech-stack';

const posts = usePostsData();
const latestPosts = computed(() => [...(posts.value['/posts/'] ?? [])]
  .filter(post => !post.draft)
  .sort((a, b) => b.createTime.localeCompare(a.createTime))
  .slice(0, 3));
const focus = [
  { title: '后端开发', stack: backendStack.map(([name]) => name).join(' / '), icon: 'ph:hard-drives' },
  { title: '前端探索', stack: 'React', icon: 'ph:code' },
  { title: 'AI 应用', stack: '从接口接入到实际应用', icon: 'ph:brain' },
];
</script>

<template>
  <div class="about-landscape">
    <img class="about-background" :src="withBase('/assets/images/about-mountains.webp')" alt="" aria-hidden="true" width="1536" height="1024">
    <main class="about-profile">
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-intro">
          <p class="eyebrow">关于我</p>
          <h1 id="about-title">你好，我是 <span>Recursion</span></h1>
          <p class="about-role">一个喜欢折腾技术的开发者。</p>
          <p class="about-motto">心安之处即桃源。</p>
          <p class="about-copy">这里记录我在全栈开发、后端开发和 AI 应用开发过程中的学习与实践，<br class="wide-break">希望这些文字，能对同样在路上的你有所帮助。</p>
          <div class="about-actions">
            <a class="about-button primary" :href="withBase('/posts/')"><VPIcon name="ph:book-open" size="24" />阅读博文<VPIcon name="ph:arrow-right" size="22" /></a>
            <a class="about-button" href="https://github.com/scrazyakai" target="_blank" rel="noopener noreferrer"><VPIcon name="simple-icons:github" size="24" />GitHub</a>
          </div>
        </div>
        <figure class="about-identity">
          <img class="about-portrait" :src="withBase('/lxh_71.gif')" alt="Recursion 的动态黑猫头像" width="280" height="280">
          <figcaption>技术之路 · 行而不辍</figcaption>
        </figure>
      </section>
      <div class="about-details">
        <section class="about-focus" aria-labelledby="focus-title">
          <h2 id="focus-title">技术专注</h2>
          <p class="section-description">专注于我感兴趣的技术领域，在实践中学习，在项目中成长。</p>
          <ul class="focus-list">
            <li v-for="item in focus" :key="item.title">
              <span class="about-icon" aria-hidden="true"><VPIcon :name="item.icon" size="32" /></span>
              <div><h3>{{ item.title }}</h3><p>{{ item.stack }}</p></div>
            </li>
          </ul>
        </section>
        <section class="about-recent" aria-labelledby="recent-title">
          <h2 id="recent-title">最近的学习记录</h2>
          <p class="section-description">持续学习，持续记录，把学到的，变成做出来的。</p>
          <ul v-if="latestPosts.length" class="recent-list">
            <li v-for="post in latestPosts" :key="post.path">
              <a :href="withBase(post.path)">
                <span class="about-icon" aria-hidden="true"><VPIcon name="ph:file-text" size="29" /></span>
                <h3>{{ post.title }}</h3>
                <span class="post-arrow" aria-hidden="true"><VPIcon name="ph:arrow-right" size="22" /></span>
              </a>
            </li>
          </ul>
          <p v-else class="section-description">学习记录正在整理中。</p>
        </section>
      </div>
      <p class="about-signoff">保持热爱 · 继续探索</p>
    </main>
  </div>
</template>

<style scoped>
.about-landscape {
  --about-text: #eff3f8;
  --about-muted: #c5d0de;
  --about-accent: #79bcff;
  --about-line: rgb(220 233 247 / 23%);
  --about-glass: rgb(22 35 46 / 65%);
  --about-icon: rgb(93 166 238 / 12%);
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - var(--vp-nav-height));
  padding: 48px 24px 60px;
  background: #152330;
  color: var(--about-text);
}
.about-background { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: .88; pointer-events: none; }
.about-profile { max-width: 1192px; margin: 0 auto; padding: 40px 54px 28px; border: 1px solid rgb(225 237 249 / 44%); border-radius: 28px; background: var(--about-glass); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); box-shadow: 0 12px 36px rgb(5 14 20 / 12%); }
.about-profile :is(h1,h2,h3,p) { margin: 0; }
.about-hero { display: grid; grid-template-columns: minmax(0,1fr) 286px; align-items: center; gap: 40px; padding-bottom: 32px; }
.eyebrow { color: var(--about-accent); font-size: 20px; line-height: 1.5; margin-bottom: 20px !important; }
.about-profile h1 { font-size: clamp(36px, 4.3vw, 64px); line-height: 1.25; font-weight: 700; letter-spacing: -1.5px; }
.about-profile h1 span { color: var(--about-accent); }
.about-role,.about-motto { color: var(--about-muted); font-size: 26px; line-height: 1.6; margin-top: 8px !important; }
.about-copy { margin-top: 22px !important; color: var(--about-muted); font-size: 18px; line-height: 1.75; }
.about-actions { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 26px; }
.about-button { display: inline-flex; align-items: center; justify-content: center; gap: 14px; min-height: 58px; padding: 12px 30px; border: 1px solid rgb(220 233 247 / 60%); border-radius: 9px; font-size: 18px; font-weight: 600; color: var(--about-text); transition: background-color .2s, border-color .2s; }
.about-button.primary { background: #65adf5; border-color: #75b9fc; color: #10283f; }
.about-button:hover { background: var(--about-icon); border-color: var(--about-accent); }
.about-button.primary:hover { background: #8cc6ff; }
.about-profile a:focus-visible { outline: 3px solid var(--about-accent); outline-offset: 5px; }
.about-identity { margin: 0; text-align: center; }
.about-portrait { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: contain; border: 3px solid rgb(179 209 236 / 36%); border-radius: 12px; background: #06090c; }
.about-identity figcaption { margin-top: 20px; color: var(--about-muted); font-size: 14px; letter-spacing: 4px; }
.about-details { border-top: 1px solid var(--about-line); padding-top: 34px; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 48px; }
.about-profile h2 { font-size: 29px; font-weight: 650; line-height: 1.5; }
.section-description { font-size: 15px; line-height: 1.8; color: var(--about-muted); margin-top: 6px !important; }
.about-profile ul { list-style: none; padding: 0; margin: 14px 0 0; }
.focus-list li { display: flex; align-items: center; gap: 22px; min-height: 80px; padding: 12px 0; border-bottom: 1px solid var(--about-line); }
.focus-list li:last-child,.recent-list li:last-child { border-bottom: 0; }
.about-icon { display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; flex-shrink: 0; border-radius: 11px; color: var(--about-accent); background: var(--about-icon); }
.about-profile h3 { font-size: 18px; font-weight: 550; line-height: 1.55; overflow-wrap: anywhere; }
.focus-list p { color: var(--about-muted); font-size: 15px; line-height: 1.7; overflow-wrap: anywhere; }
.about-recent { border-left: 1px solid var(--about-line); padding-left: 48px; min-width: 0; }
.recent-list li { border-bottom: 1px solid var(--about-line); }
.recent-list a { display: flex; align-items: center; gap: 22px; min-height: 80px; padding: 12px 0; color: var(--about-text); transition: color .2s; }
.recent-list a:hover { color: var(--about-accent); }
.post-arrow { display: inline-flex; margin-left: auto; color: var(--about-accent); flex-shrink: 0; }
.about-signoff { display: flex; align-items: center; justify-content: center; gap: 18px; color: var(--about-muted); font-size: 13px; letter-spacing: 4px; margin-top: 28px !important; }
.about-signoff::before,.about-signoff::after { content: ''; width: 56px; border-top: 1px solid var(--about-line); }
:global([data-theme="light"] .about-landscape) { --about-text: #10263b; --about-muted: #21394e; --about-accent: #064b91; --about-line: rgb(42 72 103 / 25%); --about-glass: rgb(237 246 255 / 62%); --about-icon: rgb(225 238 252 / 30%); background: #d5e3ec; }
:global([data-theme="light"] .about-profile) { border-color: rgb(255 255 255 / 78%); -webkit-backdrop-filter: blur(24px) saturate(115%); backdrop-filter: blur(24px) saturate(115%); }
:global([data-theme="light"] .about-background) { opacity: 1; }
:global([data-theme="light"] .about-button) { border-color: rgb(42 72 103 / 38%); }
@media (max-width: 1100px) {
  .about-profile { padding: 34px; }
  .about-hero { grid-template-columns: minmax(0,1fr) 220px; gap: 28px; }
  .about-profile h1 { font-size: 42px; }
  .about-role,.about-motto { font-size: 22px; }
  .about-details { gap: 28px; }
  .about-recent { padding-left: 28px; }
  .about-profile h2 { font-size: 25px; }
  .wide-break { display: none; }
}
@media (max-width: 700px) {
  .about-landscape { padding: 24px 16px 36px; }
  .about-profile { padding: 26px 22px; border-radius: 22px; }
  .about-hero { grid-template-columns: minmax(0,1fr); gap: 28px; }
  .about-profile h1 { font-size: 34px; letter-spacing: -1px; }
  .eyebrow { font-size: 16px; margin-bottom: 14px !important; }
  .about-role,.about-motto { font-size: 19px; }
  .about-copy { font-size: 16px; }
  .about-actions { gap: 12px; }
  .about-button { min-height: 48px; padding: 10px 15px; gap: 8px; font-size: 15px; }
  .about-identity { width: 170px; margin: 0 auto; }
  .about-identity figcaption { font-size: 12px; letter-spacing: 2px; margin-top: 12px; }
  .about-details { grid-template-columns: minmax(0,1fr); gap: 26px; padding-top: 26px; }
  .about-recent { border-left: 0; border-top: 1px solid var(--about-line); padding: 26px 0 0; }
  .about-profile h2 { font-size: 24px; }
  .about-profile h3 { font-size: 17px; }
  .focus-list li,.recent-list a { gap: 14px; }
  .about-icon { width: 46px; height: 46px; }
  .about-signoff { gap: 12px; font-size: 12px; letter-spacing: 2px; }
  .about-signoff::before,.about-signoff::after { width: 28px; }
}
@media (prefers-reduced-motion: reduce) { .about-button,.recent-list a { transition: none; } }
</style>
