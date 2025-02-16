<template>
  <UDashboardLayout>
    <slot />
  </UDashboardLayout>
</template>

<script lang="ts" setup>
useHead({ htmlAttrs: { lang: 'ar', dir: 'rtl' } })
</script>
