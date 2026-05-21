<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line bg-white">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 py-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
      <div>
        <p class="font-display text-ink text-[30px] leading-none tracking-[-0.02em]">Zabble</p>
        <p class="text-[16px] lg:text-[13px] text-mute-2 mt-2">Bespoke digital systems.</p>
      </div>

      <nav class="flex flex-wrap items-center gap-x-7 gap-y-2 text-[16px] lg:text-[14.5px] font-medium text-mute">
        <NuxtLink to="/#home" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Home</NuxtLink>
        <NuxtLink to="/#what-we-build" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">What We Build</NuxtLink>
        <NuxtLink to="/#meet" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Use Cases</NuxtLink>
        <a href="mailto:analytics@zabble.org" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Contact</a>
      </nav>

      <p class="text-[16px] lg:text-[13px] text-mute-2">© {{ year }} Zabble. All rights reserved.</p>
    </div>
  </footer>
</template>
