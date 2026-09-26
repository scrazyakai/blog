<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useData, useHeaders, useEncrypt } from 'vuepress-theme-plume/composables';
import OriginalDoc from 'vuepress-theme-plume/components/VPDoc.vue';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import LandscapeScene from './LandscapeScene.vue';
import '../styles/reading.css';

const { page } = useData();
const headers = useHeaders();
const { isPageDecrypted } = useEncrypt();
const article = computed(() => page.value.path.startsWith('/posts/') && page.value.path.endsWith('.html'));
const largeText = ref(false);
const mobileOutline = ref<HTMLDetailsElement>();
function closeOutline() { if (mobileOutline.value) mobileOutline.value.open = false; }
</script>

<template>
  <LandscapeScene v-if="article" class="reading-scene" :class="{ 'large-reading-text': largeText }">
    <OriginalDoc>
      <template v-for="name in Object.keys($slots).filter(name => !['doc-before', 'doc-meta-bottom'].includes(name))" #[name]="scope"><slot :name="name" v-bind="scope || {}" /></template>
      <template #doc-before>
        <slot name="doc-before" />
        <div class="reading-toolbar">
          <RouterLink to="/posts/"><VPIcon name="ph:arrow-left" />返回博文</RouterLink>
          <div role="group" aria-label="正文字号"><button :aria-pressed="!largeText" @click="largeText = false">标准</button><button :aria-pressed="largeText" @click="largeText = true">大字</button></div>
        </div>
      </template>
      <template #doc-meta-bottom>
        <slot name="doc-meta-bottom" />
        <details v-if="headers.length && isPageDecrypted" :key="page.path" ref="mobileOutline" class="reading-mobile-outline">
          <summary><VPIcon name="ph:list-bullets" />本文目录<VPIcon name="ph:caret-down" /></summary>
          <nav aria-label="本文目录"><template v-for="header in headers" :key="header.link"><a :href="header.link" @click="closeOutline">{{ header.title }}</a><a v-for="child in header.children" :key="child.link" class="nested-heading" :href="child.link" @click="closeOutline">{{ child.title }}</a></template></nav>
        </details>
      </template>
    </OriginalDoc>
  </LandscapeScene>
  <OriginalDoc v-else><template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope || {}" /></template></OriginalDoc>
</template>
