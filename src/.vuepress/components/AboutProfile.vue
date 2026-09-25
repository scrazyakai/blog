<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vuepress/client';
import { usePostsData, useData } from 'vuepress-theme-plume/composables';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';

const posts = usePostsData();
const { theme } = useData();
const latestPosts = computed(() => [...(posts.value['/posts/'] ?? [])]
  .filter(post => !post.draft)
  .sort((a, b) => b.createTime.localeCompare(a.createTime))
  .slice(0, 3));
const focus = [
  { title: '后端开发', stack: 'Java / Spring / Redis', text: '在实践中理解服务设计与工程化。' },
  { title: '前端探索', stack: 'React', text: '从组件到交互，探索更好的用户体验。' },
  { title: 'AI 应用', stack: '从接口接入到实际应用', text: '让 AI 成为解决实际问题的工具。' },
];
</script>

<template>
  <main class="about-profile">
    <section class="about-hero" aria-labelledby="about-title">
      <div class="about-intro">
        <p class="eyebrow">个人名片</p>
        <h1 id="about-title">你好，我是 <span>Recursion</span></h1>
        <p class="about-role">{{ theme.profile?.description?.replaceAll('/', ' / ') }}</p>
        <p class="about-motto">心安之处即桃源。</p>
        <p class="about-copy">你好，我是 Recursion，一个喜欢折腾技术的开发者。<br>这里记录我在全栈开发、后端开发和 AI 应用开发过程中的学习与实践，<br class="wide-break">希望这些文字，能对同样在路上的你有所帮助。</p>
        <div class="about-actions">
          <a class="about-button primary" :href="withBase('/posts/')"><VPIcon name="ph:book-open" size="22" />阅读博文<VPIcon name="ph:arrow-right" /></a>
          <a class="about-button" href="https://github.com/scrazyakai" target="_blank" rel="noopener noreferrer"><VPIcon name="simple-icons:github" size="22" />GitHub</a>
        </div>
      </div>
      <img class="about-portrait" :src="withBase('/lxh_71.gif')" alt="Recursion 的动态黑猫头像" width="300" height="300">
    </section>

    <div class="about-details">
      <section class="about-focus" aria-labelledby="focus-title">
        <h2 id="focus-title">技术专注</h2>
        <p class="section-description">专注于我感兴趣的技术领域，在实践中学习，在项目中成长。</p>
        <ul class="focus-list">
          <li v-for="(item, index) in focus" :key="item.title">
            <span class="focus-number">0{{ index + 1 }}</span>
            <div class="focus-name"><h3>{{ item.title }}</h3><p>{{ item.stack }}</p></div>
            <p class="focus-description">{{ item.text }}</p>
          </li>
        </ul>
      </section>
      <section class="about-recent" aria-labelledby="recent-title">
        <div class="section-heading"><h2 id="recent-title">最近的学习记录</h2><a :href="withBase('/posts/')">查看更多<VPIcon name="ph:arrow-right" /></a></div>
        <p class="section-description">持续学习，持续记录，把学到的，变成做出来的。</p>
        <ul v-if="latestPosts.length" class="recent-list">
          <li v-for="post in latestPosts" :key="post.path">
            <a :href="withBase(post.path)">
              <VPIcon class="post-icon" name="ph:file-text" size="28" color="var(--vp-c-brand-1)" />
              <div><h3>{{ post.title }}</h3><p>{{ post.categoryList?.map(category => category.name).join(' / ') || '学习记录' }}</p></div>
              <VPIcon class="post-arrow" name="ph:caret-right" />
            </a>
          </li>
        </ul>
        <p v-else class="section-description">学习记录正在整理中。</p>
      </section>
    </div>
    <p class="about-signoff">在技术的路上，记录 · 思考 · 前行</p>
  </main>
</template>

<style scoped>
.about-profile { max-width: 1440px; margin: 0 auto; padding: 40px 40px 0; color: var(--vp-c-text-1); }
.about-profile h1, .about-profile h2, .about-profile h3, .about-profile p { margin: 0; }
.about-hero { display: grid; grid-template-columns: 1.45fr 1fr; align-items: center; min-height: 440px; gap: 16px; padding: 10px 0 34px; }
.eyebrow { color: var(--vp-c-brand-1); font-size: 17px; letter-spacing: 2px; margin-bottom: 28px !important; }
.about-profile h1 { font-size: clamp(36px, 4.5vw, 67px); line-height: 1.25; font-weight: 700; letter-spacing: -1.5px; white-space: nowrap; }
.about-profile h1 span { color: var(--vp-c-brand-1); }
.about-role { font-size: clamp(16px, 1.65vw, 23px); color: var(--vp-c-text-2); margin-top: 22px !important; }
.about-motto { font-family: KaiTi, STKaiti, serif; font-size: 21px; letter-spacing: 3px; color: var(--vp-c-text-2); margin-top: 20px !important; }
.about-copy { margin-top: 28px !important; color: var(--vp-c-text-2); font-size: 17px; line-height: 1.9; }
.about-actions { display: flex; gap: 18px; margin-top: 26px; }
.about-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 13px 25px; border: 1px solid var(--vp-c-text-3); border-radius: 7px; font-size: 17px; font-weight: 600; transition: background-color .2s, transform .2s; }
.about-button .vp-icon { font-size: 22px; }
.about-button.primary { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: var(--vp-c-bg); }
.about-button:hover { background: var(--vp-c-brand-soft); transform: translateY(-2px); }
.about-button.primary:hover { background: var(--vp-c-brand-2); }
.about-profile a:focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 5px; }
.about-portrait { display: block; width: 100%; height: auto; max-height: 420px; object-fit: contain; border-radius: 20px; }
.about-details { border-top: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); padding: 34px 0 20px; display: grid; grid-template-columns: 1.35fr 1fr; gap: 42px; }
.about-profile h2 { font-size: 25px; font-weight: 650; line-height: 1.5; }
.section-description { font-size: 15px; line-height: 1.8; color: var(--vp-c-text-2); margin-top: 8px !important; }
.about-profile ul { list-style: none; padding: 0; margin: 16px 0 0; }
.focus-list li { display: grid; grid-template-columns: 60px 1fr 1.3fr; align-items: center; gap: 18px; min-height: 82px; border-bottom: 1px solid var(--vp-c-divider); }
.focus-list li:last-child, .recent-list li:last-child { border-bottom: 0; }
.focus-number { font-size: 33px; font-weight: 650; color: var(--vp-c-brand-1); }
.focus-name { border-left: 1px solid var(--vp-c-text-3); padding-left: 22px; }
.about-profile h3 { font-size: 17px; font-weight: 550; line-height: 1.5; }
.focus-name p, .recent-list p { color: var(--vp-c-text-2); font-size: 14px; line-height: 1.65; }
.focus-description { color: var(--vp-c-text-2); font-size: 14px; line-height: 1.7; }
.about-recent { border-left: 1px solid var(--vp-c-divider); padding-left: 42px; min-width: 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-heading > a { display: inline-flex; align-items: center; gap: 8px; color: var(--vp-c-brand-1); font-size: 14px; white-space: nowrap; }
.recent-list li { border-bottom: 1px solid var(--vp-c-divider); }
.recent-list a { display: flex; align-items: center; gap: 20px; min-height: 82px; padding: 12px 0; transition: color .2s; }
.recent-list a:hover { color: var(--vp-c-brand-1); }
.post-icon { font-size: 28px; color: var(--vp-c-brand-1); flex: none; }
.post-arrow { margin-left: auto; flex: none; }
.about-signoff { text-align: center; color: var(--vp-c-text-3); font-size: 14px; letter-spacing: 3px; padding: 25px 0; }
@media (max-width: 1000px) { .about-profile { padding: 24px 28px 0; } .about-profile h1 { font-size: 40px; white-space: normal; } .about-details { gap: 24px; grid-template-columns: 1fr 1fr; } .about-recent { padding-left: 24px; } .focus-list li { grid-template-columns: 44px 1fr; gap: 12px; } .focus-description { display: none; } .section-heading { align-items: flex-start; flex-direction: column; gap: 4px; } .about-copy { font-size: 16px; } .wide-break { display: none; } }
@media (max-width: 640px) { .about-profile { padding: 24px 22px 0; } .about-hero { grid-template-columns: 1fr; gap: 18px; padding-top: 0; } .about-profile h1 { font-size: 36px; } .eyebrow { margin-bottom: 18px !important; } .about-portrait { width: min(100%, 340px); margin: auto; } .about-role { line-height: 1.8; } .about-details { grid-template-columns: 1fr; gap: 30px; padding-top: 26px; } .about-recent { border-left: 0; border-top: 1px solid var(--vp-c-divider); padding: 26px 0 0; } .section-heading { flex-direction: row; align-items: center; } .about-profile h2 { font-size: 23px; } .about-button { padding: 12px 18px; font-size: 16px; } .about-signoff { letter-spacing: 1px; } }
@media (prefers-reduced-motion: reduce) { .about-button { transition: none; transform: none; } }
</style>
