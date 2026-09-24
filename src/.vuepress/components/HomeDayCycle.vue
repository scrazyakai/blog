<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { withBase } from "vuepress/client";

const frames = [
  { hour: 6, name: "日出", file: "01-sunrise.png" },
  { hour: 9, name: "上午", file: "02-morning.png" },
  { hour: 12, name: "正午", file: "03-noon.png" },
  { hour: 16, name: "金色时刻", file: "04-golden-hour.png" },
  { hour: 18, name: "日落", file: "05-sunset.png" },
];
const hour = ref(6);
const live = ref(true);
const playing = ref(false);
const clock = ref("--:--:--");
const date = ref("");
const ready = ref(false);
const failed = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
let animation = 0;
let last = 0;
let disposed = false;
const source = (file: string) => withBase(`/images/day-cycle/${file}`);
const position = computed(() => {
  let index = 0;
  while (index < frames.length - 2 && hour.value >= frames[index + 1].hour) index++;
  const fraction = (hour.value - frames[index].hour) /
    (frames[index + 1].hour - frames[index].hour);
  return { index, fraction: fraction * fraction * (3 - 2 * fraction) };
});
const opacity = (index: number) => {
  // Real-time mode holds one keyframe so the sky never shows two suns.
  if (live.value) return index === position.value.index +
    (position.value.fraction >= 0.5 ? 1 : 0) ? 1 : 0;
  return index === position.value.index ? 1 :
    index === position.value.index + 1 ? position.value.fraction : 0;
};
const label = computed(() => {
  const minutes = Math.round(hour.value * 60);
  const stamp = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const frame = frames[position.value.index + (position.value.fraction >= 0.5 ? 1 : 0)];
  return `${stamp} · ${frame.name}`;
});
function sync() {
  const now = new Date();
  clock.value = now.toLocaleTimeString("zh-CN", { hour12: false });
  date.value = now.toLocaleDateString("zh-CN");
  if (live.value) hour.value = Math.max(6, Math.min(18,
    now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600));
}
function reset() {
  live.value = true;
  playing.value = false;
  sync();
}
function seek(event: Event) {
  live.value = false;
  playing.value = false;
  hour.value = Number((event.target as HTMLInputElement).value);
}
function toggle() {
  live.value = false;
  if (hour.value >= 18) hour.value = 6;
  playing.value = !playing.value;
  last = performance.now();
}
function tick(now: number) {
  if (playing.value) {
    hour.value = Math.min(18, hour.value + (now - last) / 2000);
    if (hour.value >= 18) playing.value = false;
  }
  last = now;
  animation = requestAnimationFrame(tick);
}
function visibility() {
  last = performance.now();
  if (!document.hidden) sync();
}
onMounted(async () => {
  reset();
  timer = setInterval(sync, 1000);
  window.addEventListener("pageshow", reset);
  document.addEventListener("visibilitychange", visibility);
  try {
    await Promise.all(frames.map(({ file }) => {
      const image = new Image();
      image.src = source(file);
      return image.decode();
    }));
    if (disposed) return;
    ready.value = true;
    last = performance.now();
    animation = requestAnimationFrame(tick);
  } catch {
    if (!disposed) failed.value = true;
  }
});
onUnmounted(() => {
  disposed = true;
  clearInterval(timer);
  cancelAnimationFrame(animation);
  window.removeEventListener("pageshow", reset);
  document.removeEventListener("visibilitychange", visibility);
});
</script>

<template>
  <div class="day-cycle__background" aria-hidden="true">
    <img v-for="(frame, index) in frames" :key="frame.file" :src="source(frame.file)"
      alt="" :style="{ opacity: opacity(index) }">
  </div>
  <div class="day-cycle__panel">
  <div class="day-cycle__clock">
    <small>{{ date }}</small>
    <time>{{ clock }}</time>
  </div>
  <div class="day-cycle__controls">
    <div class="day-cycle__toolbar">
      <button type="button" :disabled="!ready" @click="toggle">
        {{ failed ? "图片加载失败" : !ready ? "加载中" : playing ? "暂停" : hour >= 18 ? "重新播放" : "播放" }}
      </button>
      <output>{{ label }}</output>
      <button type="button" class="day-cycle__live" @click="reset">回到当前时间</button>
    </div>
    <input aria-label="背景时间进度" :aria-valuetext="label" type="range"
      min="6" max="18" step="0.001" :value="hour" @input="seek">
  </div>
  </div>
</template>

<style scoped>
.day-cycle__background { position: absolute; inset: 0; pointer-events: none; }
.day-cycle__background img { position: absolute; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.day-cycle__panel { position: absolute; z-index: 2; top: 20px; left: 24px; display: flex; align-items: center; gap: 18px; max-width: calc(100% - 48px); padding: 12px 16px; border: 1px solid #ffffff30; background: #1018219e; backdrop-filter: blur(14px); border-radius: 14px; color: #fff; }
.day-cycle__clock { display: grid; gap: 2px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.day-cycle__clock small { font-size: 11px; line-height: 16px; color: #e0d9ca; }
.day-cycle__clock time { font-size: 24px; line-height: 28px; letter-spacing: 1px; }
.day-cycle__controls { width: clamp(240px, 32vw, 480px); min-width: 0; padding-left: 18px; border-left: 1px solid #ffffff24; }
.day-cycle__toolbar { display: flex; gap: 12px; align-items: center; white-space: nowrap; }
.day-cycle__toolbar button { background: #e7c796; color: #18222c; padding: 2px 10px; border-radius: 12px; font-size: 11px; line-height: 20px; cursor: pointer; }
.day-cycle__toolbar button:disabled { opacity: .6; cursor: wait; }
.day-cycle__toolbar .day-cycle__live { margin-left: auto; background: #ffffff18; color: white; }
.day-cycle__toolbar output { font-size: 11px; font-variant-numeric: tabular-nums; }
.day-cycle__controls input { appearance: none; display: block; width: 100%; height: 18px; margin: 4px 0 0; background: transparent; cursor: ew-resize; }
.day-cycle__controls input::-webkit-slider-runnable-track { height: 3px; background: #e7c79680; border-radius: 2px; }
.day-cycle__controls input::-webkit-slider-thumb { appearance: none; width: 10px; height: 10px; margin-top: -3.5px; background: #e7c796; border-radius: 50%; }
.day-cycle__controls input::-moz-range-track { height: 3px; background: #e7c79680; border-radius: 2px; }
.day-cycle__controls input::-moz-range-thumb { width: 10px; height: 10px; border: 0; background: #e7c796; border-radius: 50%; }
@media (max-width: 600px) {
  .day-cycle__panel { top: 16px; left: 16px; max-width: none; width: calc(100% - 32px); padding: 10px; gap: 10px; }
  .day-cycle__clock time { font-size: 18px; letter-spacing: 0; }
  .day-cycle__clock small { font-size: 10px; }
  .day-cycle__controls { flex: 1; width: auto; padding-left: 10px; }
  .day-cycle__toolbar { gap: 6px; flex-wrap: wrap; }
  .day-cycle__toolbar button { padding: 1px 6px; font-size: 10px; }
  .day-cycle__toolbar output { font-size: 10px; }
  .day-cycle__toolbar .day-cycle__live { margin-left: 0; }
}
</style>
