<template>
  <div class="h-full">
    <slot />
  </div>
</template>

<script lang="ts" setup>
useHead({ htmlAttrs: { lang: 'ar', dir: 'rtl' } })
</script>
