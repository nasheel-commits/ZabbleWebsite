<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useScroll } from '~/composables/useScroll'

const { scrollY } = useScroll()
const progress = ref(0)

function recompute() {
  if (typeof document === 'undefined') return
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  progress.value = max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0
}

watch(scrollY, recompute)
onMounted(recompute)
</script>

<template>
  <div class="scroll-progress" aria-hidden="true">
    <div class="scroll-progress__bar" :style="{ width: progress + '%' }" />
  </div>
</template>
