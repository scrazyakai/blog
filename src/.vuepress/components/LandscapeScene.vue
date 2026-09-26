<script setup lang="ts">
import { withBase } from 'vuepress/client';
import '../styles/landscape.css';
</script>

<template>
  <div class="landscape-scene">
    <div class="landscape-backdrop" aria-hidden="true">
      <img :src="withBase('/images/day-cycle/02-morning.png')" alt="" width="1882" height="836">
    </div>
    <slot />
  </div>
</template>
