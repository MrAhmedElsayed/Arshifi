<template>
  <div class="h-screen">
    <slot />
  </div>
</template>

<script lang="ts" setup>
useHead({ htmlAttrs: { lang: 'ar', dir: 'rtl' } })
</script>
