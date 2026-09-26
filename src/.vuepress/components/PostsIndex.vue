<script setup lang="ts">
import type { ThemePostsItem } from 'vuepress-theme-plume/shared';
import { computed, nextTick, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRoute, useRouter, withBase } from 'vuepress/client';
import { useLocalePostList } from 'vuepress-theme-plume/composables';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import { postSummaries } from '../data/post-summaries.js';
import { categoryOf, isPinned, pageNumber, sortPosts, summaryOf } from '../utils/posts-index.js';

const posts = useLocalePostList();
const route = useRoute();
const router = useRouter();
const panel = ref<HTMLElement>();
const failedCovers = ref(new Set<string>());
// The static page contains page one; apply URL filters after hydration.
const hydrated = ref(false);
onMounted(() => { hydrated.value = true; });
const allPosts = computed(() => sortPosts(posts.value));
const categories = computed(() => [...new Set(allPosts.value.map(categoryOf))]
  .sort((a, b) => ['前端', '算法', '项目', '杂谈', '面试准备'].indexOf(a)
    - ['前端', '算法', '项目', '杂谈', '面试准备'].indexOf(b)));
const category = computed(() => hydrated.value && typeof route.query.category === 'string'
  && categories.value.includes(route.query.category) ? route.query.category : '');
const filteredPosts = computed(() => allPosts.value.filter(post => !category.value || categoryOf(post) === category.value));
const perPage = 10;
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / perPage)));
const currentPage = computed(() => pageNumber(hydrated.value ? route.query.p : undefined, totalPages.value));
const visiblePosts = computed(() => filteredPosts.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage));
const pageRange = computed(() => [...new Set([1, currentPage.value - 1, currentPage.value, currentPage.value + 1, totalPages.value])]
  .filter(page => page >= 1 && page <= totalPages.value).sort((a, b) => a - b));

function coverOf(post: ThemePostsItem): string {
  if (failedCovers.value.has(post.path)) return '';
  const cover = post.cover || (post.path.endsWith('/添加交互.html') || decodeURIComponent(post.path).endsWith('/添加交互.html')
    ? '/assets/images/posts-react-cover.png' : '');
  return cover && !/^(?:https?:)?\/\//.test(cover) ? withBase(cover) : cover;
}

function hideBrokenCover(path: string) {
  failedCovers.value = new Set([...failedCovers.value, path]);
}

function dateOf(post: ThemePostsItem): string {
  return post.createTime?.split(/[T\s]/)[0].replaceAll('/', '-') || '';
}

function readingTime(post: ThemePostsItem): string {
  const minutes = post.readingTime?.minutes;
  return minutes != null && minutes < 1 ? '小于 1 分钟' : `${Math.round(minutes || 1)} 分钟`;
}

function tagOf(post: ThemePostsItem): string {
  return post.tags?.[0] || post.categoryList?.at(-1)?.name || '学习记录';
}

async function selectCategory(value: string) {
  await router.push({ path: route.path, query: { ...route.query, category: value || undefined, p: undefined } });
}

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  await router.push({ path: route.path, query: { ...route.query, p: page > 1 ? String(page) : undefined } });
  await nextTick();
  panel.value?.scrollIntoView({ block: 'start', behavior: 'instant' });
  panel.value?.focus({ preventScroll: true });
}
</script>

<template>
  <div class="posts-landscape">
    <div class="posts-scenery" aria-hidden="true">
      <img :src="withBase('/images/day-cycle/02-morning.png')" alt="" fetchpriority="high" width="1882" height="836">
    </div>
    <main ref="panel" class="posts-panel" tabindex="-1" aria-labelledby="posts-title">
      <header class="posts-heading">
        <h1 id="posts-title">博文</h1>
        <p>个人开发的学习与记录</p>
        <div class="posts-filters" role="group" aria-label="按分类筛选文章">
          <button type="button" :aria-pressed="!category" @click="selectCategory('')">全部</button>
          <button v-for="item in categories" :key="item" type="button" :aria-pressed="category === item" @click="selectCategory(item)">{{ item }}</button>
        </div>
      </header>

      <p class="posts-sr-only" role="status">{{ category || '全部文章' }}，共 {{ filteredPosts.length }} 篇，第 {{ currentPage }} / {{ totalPages }} 页。</p>
      <div v-if="visiblePosts.length" class="posts-list">
        <article v-for="(post, index) in visiblePosts" :key="post.path" class="posts-row" :class="{ 'has-cover': coverOf(post) }">
          <div class="posts-copy">
            <h2>
              <RouterLink :to="post.path">{{ post.title }}</RouterLink>
              <span v-if="isPinned(post)" class="posts-pinned"><VPIcon name="ph:push-pin" />置顶</span>
            </h2>
            <p class="posts-summary">{{ summaryOf(post, postSummaries) }}</p>
            <div class="posts-meta">
              <RouterLink class="posts-tag" :to="{ path: '/posts/tags/', query: { tag: post.tags?.[0] } }" v-if="post.tags?.length">{{ tagOf(post) }}</RouterLink>
              <span v-else class="posts-tag">{{ tagOf(post) }}</span>
              <time v-if="dateOf(post)" :datetime="dateOf(post)"><VPIcon name="ph:calendar-blank" />{{ dateOf(post) }}</time>
              <span class="posts-duration"><VPIcon name="ph:clock" />{{ readingTime(post) }}</span>
              <RouterLink class="posts-read" :to="post.path" :aria-label="`阅读全文：${post.title}`">阅读全文<VPIcon name="ph:arrow-right" /></RouterLink>
            </div>
          </div>
          <RouterLink v-if="coverOf(post)" :to="post.path" class="posts-cover" :aria-label="`阅读：${post.title}`" tabindex="-1" aria-hidden="true">
            <img :src="coverOf(post)" alt="" width="260" height="144" :loading="index < 2 ? 'eager' : 'lazy'" decoding="async" @error="hideBrokenCover(post.path)">
          </RouterLink>
        </article>
      </div>
      <p v-else class="posts-empty">这个分类还没有文章，试试其他分类。</p>

      <nav v-if="totalPages > 1" class="posts-pagination" aria-label="文章分页">
        <button type="button" aria-label="上一页" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><VPIcon name="ph:caret-left" /></button>
        <template v-for="(page, index) in pageRange" :key="page">
          <span v-if="index > 0 && page - pageRange[index - 1] > 1" class="posts-ellipsis">…</span>
          <button type="button" :aria-label="`第 ${page} 页`" :aria-current="page === currentPage ? 'page' : undefined" @click="changePage(page)">{{ page }}</button>
        </template>
        <button type="button" aria-label="下一页" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"><VPIcon name="ph:caret-right" /></button>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.posts-landscape { position: relative; isolation: isolate; min-height: calc(100vh - var(--vp-nav-height)); padding: 54px 24px 56px; color: #eff2f5; --posts-muted: #e0e5ea; --posts-accent: #79beff; }
.posts-scenery { position: fixed; inset: var(--vp-nav-height) 0 0; z-index: -1; background: #1d2b39; pointer-events: none; }
.posts-scenery img { width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: .65; }
.posts-panel { max-width: 1184px; margin: 0 auto; padding: 28px 40px 18px; border: 1px solid rgb(226 235 243 / 44%); border-radius: 28px; background: rgb(22 29 35 / 52%); box-shadow: 0 1px 1px rgb(255 255 255 / 16%) inset, 0 12px 36px rgb(5 14 20 / 10%); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); scroll-margin-top: calc(var(--vp-nav-height) + 20px); }
.posts-panel h1, .posts-panel h2, .posts-panel p { margin: 0; }
.posts-heading { padding-bottom: 18px; border-bottom: 1px solid rgb(220 231 241 / 25%); }
.posts-heading h1 { font-size: 36px; font-weight: 650; line-height: 1.45; }
.posts-heading > p { margin-top: 2px; color: var(--posts-muted); font-size: 22px; line-height: 1.65; }
.posts-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.posts-filters button { padding: 8px 22px; min-height: 42px; border: 1px solid rgb(236 243 250 / 18%); border-radius: 24px; background: rgb(18 29 38 / 44%); font: inherit; font-size: 16px; font-weight: 550; color: #f1f4f8; cursor: pointer; transition: background .16s, border-color .16s; }
.posts-filters button:hover { border-color: rgb(154 203 247 / 70%); background: rgb(50 75 95 / 80%); }
.posts-filters button[aria-pressed="true"] { background: #60aaf5; border-color: #75b9fc; color: #10283f; }
.posts-row { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 36px; align-items: center; padding: 20px 0; border-bottom: 1px solid rgb(220 231 241 / 25%); }
.posts-row:last-child { border-bottom: 0; }
.posts-copy { min-width: 0; }
.posts-row h2 { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 30px; line-height: 1.4; font-weight: 650; letter-spacing: -.4px; }
.posts-row h2 a { color: inherit; overflow-wrap: anywhere; transition: color .16s; }
.posts-row h2 a:hover { color: var(--posts-accent); }
.posts-pinned { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; line-height: 1.8; color: #b7d3ed; font-weight: 500; letter-spacing: 0; }
.posts-summary { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: 8px !important; font-size: 18px; line-height: 1.5; color: var(--posts-muted); }
.posts-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 22px; margin-top: 10px; font-size: 15px; line-height: 1.8; color: var(--posts-muted); }
.posts-tag { padding: 0 12px; border: 1px solid rgb(120 178 232 / 28%); border-radius: 20px; background: rgb(108 164 218 / 19%); color: #91caff; font-weight: 600; max-width: 100%; overflow-wrap: anywhere; }
.posts-tag:hover { background: rgb(108 164 218 / 28%); }
.posts-meta time, .posts-duration, .posts-read { display: inline-flex; align-items: center; gap: 9px; white-space: nowrap; }
.posts-meta .vp-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
.posts-read { margin-left: auto; color: var(--posts-accent); font-weight: 600; font-size: 16px; }
.posts-read:hover { text-decoration: underline; text-underline-offset: 4px; }
.posts-cover { display: block; border-radius: 8px; overflow: hidden; height: 144px; border: 1px solid rgb(232 240 248 / 22%); }
.posts-cover img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .2s; }
.posts-cover:hover img { transform: scale(1.035); }
.posts-pagination { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 10px; padding: 26px 0 10px; }
.posts-pagination button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 1px solid rgb(220 231 241 / 25%); border-radius: 8px; background: rgb(31 45 57 / 60%); color: #ecf3fb; cursor: pointer; }
.posts-pagination button:hover:not(:disabled) { background: rgb(83 127 163 / 55%); }
.posts-pagination button[aria-current] { color: #10283f; background: #69b1ff; border-color: #69b1ff; }
.posts-pagination button:disabled { opacity: .4; cursor: default; }
.posts-pagination .vp-icon { font-size: 18px; }
.posts-ellipsis { padding: 0 2px; }
.posts-empty { padding: 48px 0; color: var(--posts-muted); }
.posts-panel :is(a, button):focus-visible { outline: 3px solid #99d0ff; outline-offset: 4px; }
.posts-panel:focus { outline: none; }
.posts-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
:global([data-theme="light"] .posts-landscape) { color: #182c40; --posts-muted: #3f5367; --posts-accent: #0868b7; }
:global([data-theme="light"] .posts-panel) { background: rgb(239 246 251 / 86%); border-color: rgb(255 255 255 / 78%); }
:global([data-theme="light"] .posts-scenery img) { opacity: .9; }
:global([data-theme="light"] .posts-heading), :global([data-theme="light"] .posts-row) { border-color: rgb(50 75 99 / 22%); }
:global([data-theme="light"] .posts-filters button) { background: rgb(225 234 243 / 76%); border-color: rgb(72 99 126 / 22%); color: #30465c; }
:global([data-theme="light"] .posts-filters button[aria-pressed="true"]), :global([data-theme="light"] .posts-pagination button[aria-current]) { background: #096dd9; color: #fff; border-color: #096dd9; }
:global([data-theme="light"] .posts-tag) { color: #0868b7; background: rgb(78 142 208 / 12%); border-color: rgb(58 123 191 / 25%); }
:global([data-theme="light"] .posts-pinned) { color: #4c6a88; }
:global([data-theme="light"] .posts-pagination button) { color: #30465c; background: #e1eaf3; border-color: #b7c9da; }
@media (max-width: 1100px) { .posts-panel { padding: 28px 30px 18px; } .posts-row { grid-template-columns: minmax(0, 1fr) 220px; gap: 28px; } .posts-row h2 { font-size: 27px; } .posts-cover { height: 132px; } .posts-meta { gap: 10px 16px; } .posts-read { flex-basis: 100%; margin-left: 0; } }
@media (max-width: 959px) { .posts-landscape { padding-top: calc(var(--vp-nav-height) + 24px); } }
@media (max-width: 760px) { .posts-landscape { padding-left: 16px; padding-right: 16px; } .posts-panel { padding: 24px; border-radius: 20px; } .posts-heading h1 { font-size: 30px; } .posts-heading > p { font-size: 18px; } .posts-row { grid-template-columns: 1fr; gap: 16px; padding: 24px 0; } .posts-row h2 { font-size: 25px; } .posts-summary { font-size: 16px; } .posts-cover { width: 100%; height: auto; aspect-ratio: 16 / 7; } .posts-meta { font-size: 13px; gap: 10px 14px; } .posts-read { flex-basis: auto; margin-left: auto; font-size: 14px; } .posts-filters { gap: 8px; } .posts-filters button { padding: 8px 16px; font-size: 14px; } }
@media (max-width: 440px) { .posts-panel { padding: 20px; } .posts-read { flex-basis: 100%; margin-left: 0; } .posts-meta time, .posts-duration { gap: 5px; } }
@media (prefers-reduced-motion: reduce) { .posts-cover img, .posts-row h2 a, .posts-filters button { transition: none; } }
</style>
