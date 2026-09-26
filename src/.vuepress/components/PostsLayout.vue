<script setup lang="ts">
import { useData } from 'vuepress-theme-plume/composables';
import OriginalPosts from 'vuepress-theme-plume/components/Posts/VPPosts.vue';
import PostsIndex from './PostsIndex.vue';
import PostsExplorer from './PostsExplorer.vue';

defineProps<{ homePosts?: boolean; type?: string; onlyOnce?: boolean; collection?: string }>();
const { page } = useData();
</script>

<template>
  <PostsIndex v-if="page.type === 'posts' && page.path === '/posts/'" />
  <PostsExplorer v-else-if="['posts-categories', 'posts-tags', 'posts-archives'].includes(page.type || '')" :key="page.type" :kind="page.type" />
  <OriginalPosts v-else v-bind="$props">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </OriginalPosts>
</template>
