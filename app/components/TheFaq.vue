<script setup lang="ts">
// Home-page AEO section (S07): the core-offering answer block + brand FAQs.
//
// Thin wrapper that drops the reusable AnswerBlock + FaqList primitives onto the
// home page with site-level content. Server-rendered; the Q&A text is exposed
// via HOME_ANSWER / HOME_FAQS for S03 to attach FAQPage JSON-LD on `/`.

import { HOME_ANSWER, HOME_FAQS } from '~/data/site-faqs'
</script>

<template>
  <section class="relative py-16 md:py-24 lg:py-28">
    <div class="mx-auto max-w-5xl px-5 md:px-8 lg:px-12">
      <div v-reveal>
        <AnswerBlock
          :question="HOME_ANSWER.question"
          :answer="HOME_ANSWER.answer"
          eyebrow="What we do"
        />
      </div>

      <div v-reveal class="mt-12 md:mt-16">
        <FaqList :items="HOME_FAQS" heading="Questions we get asked" />
      </div>
    </div>
  </section>
</template>
