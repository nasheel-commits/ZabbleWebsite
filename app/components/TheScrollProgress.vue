<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const progress = ref(0)
let ticking = false

function update() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  progress.value = max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(update)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div class="scroll-progress" aria-hidden="true">
    <div class="scroll-progress__bar" :style="{ width: progress + '%' }" />
  </div>
</template>
