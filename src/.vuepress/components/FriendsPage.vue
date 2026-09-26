<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData } from 'vuepress-theme-plume/composables';
import { withBase } from 'vuepress/client';
import VPComment from 'vuepress-theme-plume/components/VPComment.vue';
import VPEncrypt from 'vuepress-theme-plume/components/VPEncrypt.vue';
import VPIcon from 'vuepress-theme-plume/components/VPIcon.vue';
import LandscapeScene from './LandscapeScene.vue';
const { frontmatter } = useData<'friends'>();
const groups = computed(() => [
  ...(frontmatter.value.list?.length ? [{ title: '我的朋友', list: frontmatter.value.list }] : []),
  ...(frontmatter.value.groups || []).map(group => ({ ...group, list: group.list || [] })),
]);
const failedAvatars = ref(new Set<string>());
const copyStatus = ref('');
const siteInfo = '名称：青云小筑\n地址：https://www.52xinxin.top/\n简介：个人开发的学习与记录\n头像：https://www.52xinxin.top/lxh_71.gif';
async function copySiteInfo() {
  try { await navigator.clipboard.writeText(siteInfo); copyStatus.value = '本站信息已复制'; }
  catch { copyStatus.value = '复制失败，可以手动选择下方的本站信息。'; }
}
</script>

<template>
  <LandscapeScene>
    <main class="landscape-panel friends-panel" aria-labelledby="friends-title">
      <header class="landscape-heading"><div><h1 id="friends-title">友情链接</h1><p>在自己的小天地里，遇见同样热爱记录的人。</p></div><span class="friends-heading-icon" aria-hidden="true"><VPIcon name="ph:link-simple" :size="40" /></span></header>
      <VPEncrypt>
        <Content v-if="frontmatter.contentPosition === 'before'" class="vp-doc plume-content" />
        <section v-for="(group, index) in groups" :key="index" class="friend-group">
          <div class="section-heading"><h2>{{ group.title || '朋友们' }}</h2><span>{{ group.list.length }} 个站点</span></div>
          <div class="friend-grid">
            <a v-for="friend in group.list" :key="friend.link" :href="friend.link" target="_blank" rel="noopener noreferrer" class="friend-card" :aria-label="`访问 ${friend.name}（新窗口打开）`">
              <img v-if="friend.avatar && !failedAvatars.has(friend.link)" :src="/^(https?:)?\/\//.test(friend.avatar) ? friend.avatar : withBase(friend.avatar)" alt="" width="72" height="72" @error="failedAvatars.add(friend.link)">
              <span v-else class="friend-avatar-fallback" aria-hidden="true"><VPIcon name="ph:globe" :size="56" /></span>
              <div><h3>{{ friend.name }}</h3><p>{{ friend.desc }}</p><span class="friend-visit">去逛逛<VPIcon name="ph:arrow-up-right" /></span></div>
            </a>
          </div>
        </section>
        <section class="friend-exchange" aria-labelledby="friend-exchange-title">
          <div><h2 id="friend-exchange-title">交换友链</h2><p>如果你也有一处认真经营的小站，欢迎在下方评论留下站点名称、地址和简介。</p><a class="text-action" href="#friend-comments">留下你的站点<VPIcon name="ph:arrow-down" /></a></div>
          <div class="friend-site-info"><div class="section-heading"><h3>本站信息</h3><button class="text-action" @click="copySiteInfo"><VPIcon name="ph:copy" />复制信息</button></div><dl><dt>名称</dt><dd>青云小筑</dd><dt>地址</dt><dd><a href="https://www.52xinxin.top/">https://www.52xinxin.top/</a></dd><dt>简介</dt><dd>个人开发的学习与记录</dd></dl><p class="copy-status" role="status">{{ copyStatus }}</p></div>
        </section>
        <Content v-if="frontmatter.contentPosition !== 'before'" class="vp-doc plume-content" />
      </VPEncrypt>
      <section id="friend-comments" class="friend-comments" aria-label="友链留言"><VPComment /></section>
    </main>
  </LandscapeScene>
</template>
