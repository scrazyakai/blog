<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRoute, useRouter } from 'vuepress/client';
import { useLocalePostList } from 'vuepress-theme-plume/composables';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import LandscapeScene from './LandscapeScene.vue';
import DiscoveryPosts from './DiscoveryPosts.vue';
import { archiveGroups, categoryGroups, chronologicalPosts, postDate, tagGroups } from '../utils/post-discovery.js';

const props = defineProps<{ kind: string }>();
const route = useRoute();
const router = useRouter();
const source = useLocalePostList();
const ready = ref(false);
onMounted(() => { ready.value = true; });
const posts = computed(() => chronologicalPosts(source.value));
const groups = computed(() => categoryGroups(posts.value));
const roots = computed(() => groups.value.filter(group => group.depth === 0).sort((a, b) => {
  const order = ['前端', '算法', '项目', '杂谈', '面试准备'];
  return order.indexOf(a.name) - order.indexOf(b.name);
}));
const tags = computed(() => tagGroups(posts.value));
const months = computed(() => archiveGroups(posts.value));
const years = computed(() => [...new Set(months.value.map(month => month.year))]);
const queryValue = (key: string) => ready.value && typeof route.query[key] === 'string' ? route.query[key] as string : '';
const selectedCategory = computed(() => groups.value.find(group => group.id === queryValue('id')));
const selectedTag = computed(() => queryValue('tag'));
const tagSearch = ref('');
const matchingTags = computed(() => tags.value.filter(tag => tag.name.toLocaleLowerCase().includes(tagSearch.value.trim().toLocaleLowerCase())));
const taggedPosts = computed(() => selectedTag.value ? tags.value.find(tag => tag.name === selectedTag.value)?.posts || [] : posts.value.slice(0, 6));
const selectedYear = computed(() => years.value.includes(queryValue('year')) ? queryValue('year') : '');
const visibleMonths = computed(() => months.value.filter(month => !selectedYear.value || month.year === selectedYear.value));
const title = computed(() => props.kind === 'posts-categories' ? '分类' : props.kind === 'posts-tags' ? '标签' : '归档');
const subtitle = computed(() => props.kind === 'posts-categories' ? '沿着感兴趣的方向，慢慢深入。' : props.kind === 'posts-tags' ? '从一个关键词，找到相关的记录。' : '把学习与生活，留在时间里。');
function select(key: string, value: string) {
  return router.push({ path: route.path, query: { ...route.query, [key]: value || undefined } });
}
</script>

<template>
  <LandscapeScene>
    <main class="landscape-panel explorer-panel" aria-labelledby="explorer-title">
      <header class="landscape-heading">
        <div><h1 id="explorer-title">{{ title }}</h1><p>{{ subtitle }}</p></div>
        <span class="landscape-count">{{ posts.length }} 篇文章<span v-if="kind === 'posts-tags'"> · {{ tags.length }} 个标签</span></span>
      </header>
      <nav class="explorer-tabs" aria-label="博文浏览方式">
        <RouterLink to="/posts/">全部文章</RouterLink>
        <RouterLink to="/posts/categories/" :aria-current="kind === 'posts-categories' ? 'page' : undefined">分类</RouterLink>
        <RouterLink to="/posts/tags/" :aria-current="kind === 'posts-tags' ? 'page' : undefined">标签</RouterLink>
        <RouterLink to="/posts/archives/" :aria-current="kind === 'posts-archives' ? 'page' : undefined">归档</RouterLink>
      </nav>

      <div v-if="kind === 'posts-categories'" class="category-layout">
        <nav class="category-menu" aria-label="文章分类">
          <button :aria-pressed="!selectedCategory" @click="select('id', '')"><span><VPIcon name="ph:squares-four" />全部分类</span><small>{{ posts.length }}</small></button>
          <template v-for="group in roots" :key="group.id">
            <button :aria-pressed="selectedCategory?.id === group.id" @click="select('id', group.id)"><span><VPIcon name="ph:folder-simple" />{{ group.name }}</span><small>{{ group.posts.length }}</small></button>
            <button v-for="child in groups.filter(child => child.parent === group.id)" :key="child.id" class="category-child" :aria-pressed="selectedCategory?.id === child.id" @click="select('id', child.id)"><span>{{ child.name }}</span><small>{{ child.posts.length }}</small></button>
          </template>
        </nav>
        <div class="category-results">
          <section v-if="selectedCategory" :key="selectedCategory.id">
            <div class="section-heading"><h2>{{ selectedCategory.name }}</h2><span role="status">{{ selectedCategory.posts.length }} 篇文章</span></div>
            <DiscoveryPosts :posts="selectedCategory.posts" />
          </section>
          <template v-else>
            <section v-for="group in roots" :key="group.id" class="category-section">
              <div class="section-heading"><h2>{{ group.name }}<small>{{ group.posts.length }} 篇</small></h2><button class="text-action" :aria-label="`查看${group.name}全部文章`" @click="select('id', group.id)">查看全部<VPIcon name="ph:arrow-right" /></button></div>
              <DiscoveryPosts :posts="group.posts.slice(0, 3)" compact />
            </section>
          </template>
        </div>
      </div>

      <div v-else-if="kind === 'posts-tags'" class="tags-layout">
        <div class="tags-toolbar"><h2>探索标签</h2><label class="tag-search"><VPIcon name="ph:magnifying-glass" /><input v-model="tagSearch" type="search" placeholder="搜索标签" aria-label="搜索标签"></label></div>
        <div class="tag-cloud" aria-label="选择文章标签">
          <button class="landscape-chip" :aria-pressed="!selectedTag" @click="select('tag', '')">全部</button>
          <button v-for="tag in matchingTags" :key="tag.name" class="landscape-chip" :aria-pressed="selectedTag === tag.name" @click="select('tag', tag.name)"><span>{{ tag.name }}</span><small>{{ tag.posts.length }}</small></button>
        </div>
        <p v-if="!matchingTags.length" class="landscape-empty" role="status">没有找到相关标签。<button class="text-action" @click="tagSearch = ''">清空搜索</button></p>
        <section class="tag-results">
          <div class="section-heading"><h2>{{ selectedTag || '最近文章' }}</h2><span role="status">{{ selectedTag ? `${taggedPosts.length} 篇相关文章` : '最近更新的 6 篇记录' }}</span></div>
          <DiscoveryPosts :posts="taggedPosts" />
          <p v-if="!taggedPosts.length" class="landscape-empty">这个标签还没有文章。<button class="text-action" @click="select('tag', '')">查看最近文章</button></p>
        </section>
      </div>

      <div v-else class="archive-layout">
        <nav class="year-menu" aria-label="按年份筛选"><button class="landscape-chip" :aria-pressed="!selectedYear" @click="select('year', '')">全部年份</button><button v-for="year in years" :key="year" class="landscape-chip" :aria-pressed="selectedYear === year" @click="select('year', year)">{{ year }}</button></nav>
        <p class="landscape-sr-only" role="status">{{ selectedYear || '全部年份' }}，共 {{ visibleMonths.reduce((sum, month) => sum + month.posts.length, 0) }} 篇文章</p>
        <section v-for="month in visibleMonths" :key="month.key" class="archive-month">
          <header><span class="archive-year">{{ month.year }}</span><h2>{{ month.month }} 月</h2><small>{{ month.posts.length }} 篇记录</small></header>
          <div class="archive-entries"><RouterLink v-for="post in month.posts" :key="post.path" :to="post.path" class="archive-entry"><time :datetime="postDate(post)">{{ postDate(post).slice(5).replace('-', '/') }}</time><span>{{ post.title }}</span><VPIcon name="ph:arrow-up-right" /></RouterLink></div>
        </section>
      </div>
    </main>
  </LandscapeScene>
</template>
