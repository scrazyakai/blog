<script setup lang="ts">
import type { ThemePostsItem } from 'vuepress-theme-plume/shared';
import { RouterLink } from 'vue-router';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import { postDate } from '../utils/post-discovery.js';
import { summaryOf } from '../utils/posts-index.js';
import { postSummaries } from '../data/post-summaries.js';
defineProps<{ posts: ThemePostsItem[]; compact?: boolean }>();
</script>

<template>
  <div class="discovery-posts" :class="{ compact }">
    <article v-for="post in posts" :key="post.path" class="discovery-post">
      <div>
        <h3><RouterLink :to="post.path">{{ post.title }}</RouterLink></h3>
        <p v-if="!compact" class="discovery-summary">{{ summaryOf(post, postSummaries) }}</p>
        <div class="discovery-meta"><time :datetime="postDate(post)">{{ postDate(post) }}</time><span v-if="post.tags?.length">{{ post.tags[0] }}</span><span v-if="post.encrypt">加密文章</span></div>
      </div>
      <RouterLink :to="post.path" class="discovery-open" :aria-label="`阅读：${post.title}`"><VPIcon name="ph:arrow-right" /></RouterLink>
    </article>
  </div>
</template>
