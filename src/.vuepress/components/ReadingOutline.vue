<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useData, useHeaders } from 'vuepress-theme-plume/composables';
import OriginalOutline from 'vuepress-theme-plume/components/VPDocAsideOutline.vue';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import ReadingOutlineItems from './ReadingOutlineItems.vue';

const { page } = useData();
const headers = useHeaders();
const article = computed(() => page.value.path.startsWith('/posts/') && page.value.path.endsWith('.html'));
const active = ref('');
const collapsed = ref(new Set<string>());
let frame = 0;
let targets: { link: string; element: HTMLElement }[] = [];
function updateActive() {
  frame = 0;
  let current = '';
  for (const target of targets) {
    if (target.element.getBoundingClientRect().top > 100) break;
    current = target.link;
  }
  active.value = current;
}
function onScroll() { if (!frame) frame = requestAnimationFrame(updateActive); }
function refreshTargets() {
  const links: string[] = [];
  function visit(items: typeof headers.value) {
    for (const item of items) { links.push(item.link); if (item.children) visit(item.children); }
  }
  visit(headers.value);
  targets = links.flatMap(link => {
    const element = document.getElementById(decodeURIComponent(link.slice(1)));
    return element ? [{ link, element }] : [];
  });
  updateActive();
}
function toggle(link: string) {
  const next = new Set(collapsed.value);
  if (next.has(link)) next.delete(link); else next.add(link);
  collapsed.value = next;
}
function printArticle() { window.print(); }
watch(() => page.value.path, () => { collapsed.value = new Set(); active.value = ''; });
watch(headers, () => nextTick(refreshTargets), { flush: 'post' });
onMounted(() => {
  refreshTargets();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  cancelAnimationFrame(frame);
});
</script>

<template>
  <nav v-if="article && headers.length" class="reading-outline" aria-labelledby="reading-outline-title">
    <div class="reading-outline-header">
      <h2 id="reading-outline-title"><VPIcon name="ph:list-bullets" />文章大纲</h2>
      <button class="reading-outline-print" type="button" aria-label="打印文章" title="打印文章" @click="printArticle"><VPIcon name="ph:printer" /></button>
    </div>
    <ReadingOutlineItems :headers="headers" :active="active" :collapsed="collapsed" @toggle="toggle" />
  </nav>
  <OriginalOutline v-else-if="!article" />
</template>
