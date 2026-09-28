<script setup lang="ts">
import type { MenuItem } from 'vuepress-theme-plume/composables';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
const props = withDefaults(defineProps<{ headers: MenuItem[]; active: string; collapsed: Set<string>; depth?: number }>(), { depth: 0 });
defineEmits<{ toggle: [link: string] }>();
function containsActive(item: MenuItem): boolean {
  return item.link === props.active || !!item.children?.some(containsActive);
}
function childrenId(link: string) { return `reading-outline-${encodeURIComponent(link)}`; }
function focusHeading(link: string) {
  document.getElementById(decodeURIComponent(link.slice(1)))?.focus({ preventScroll: true });
}
</script>

<template>
  <ul class="reading-outline-list" :class="{ 'is-root': depth === 0 }">
    <li v-for="(item, index) in headers" :key="item.link" :class="{ 'is-current': active === item.link, 'is-ancestor': containsActive(item), 'is-section': depth === 0 }">
      <div class="reading-outline-row">
        <a :href="item.link" :aria-current="active === item.link ? 'location' : undefined" @click="focusHeading(item.link)"><span v-if="depth === 0" class="reading-outline-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>{{ item.title }}</a>
        <button v-if="item.children?.length" type="button" :aria-label="`${collapsed.has(item.link) ? '展开' : '收起'}${item.title}`" :aria-expanded="!collapsed.has(item.link)" :aria-controls="childrenId(item.link)" @click="$emit('toggle', item.link)"><VPIcon :name="collapsed.has(item.link) ? 'ph:caret-right' : 'ph:caret-down'" /></button>
      </div>
      <ReadingOutlineItems v-if="item.children?.length" v-show="!collapsed.has(item.link)" :id="childrenId(item.link)" :headers="item.children" :depth="depth + 1" :active="active" :collapsed="collapsed" @toggle="$emit('toggle', $event)" />
    </li>
  </ul>
</template>
