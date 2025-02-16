<template>
  <UHeader :links="links" :ui="{wrapper: 'font-tajawal'}">
    <template #logo>
      <h1 class="text-2xl font-bold font-alkalami text-primary">أرشيفي</h1>
    </template>

    <template #right>
      <UColorModeButton />
      <UButton to="/settings" icon="i-heroicons-cog-6-tooth" color="gray" variant="ghost" />
      <UButton to="/profile" icon="i-heroicons-user-circle" color="gray" variant="ghost" />
    </template>
  </UHeader>

  <UMain>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UMain>

  <!-- Footer -->
  <UFooter :links="footer_links">
    <template #left>
      Copyright © {{ new Date().getFullYear() }}
    </template>

    <template #right>
      <UButton icon="i-simple-icons-x" color="gray" variant="ghost" to="https://x.com/nuxt_js" target="_blank" />
      <UButton icon="i-simple-icons-discord" color="gray" variant="ghost" to="https://discord.com/invite/ps2h6QT"
        target="_blank" />
      <UButton icon="i-simple-icons-github" color="gray" variant="ghost" to="https://github.com/nuxt/nuxt"
        target="_blank" />
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
const links = [{
  label: 'ادارة البيانات',
  icon: 'i-heroicons-book-open',
  to: '/devices'
}, {
  label: 'المستخدمين',
  icon: 'i-heroicons-rocket-launch',
  to: '/users'
}]

const footer_links = [{
  label: 'Nuxt UI',
  to: 'https://ui.nuxt.com/'
}, {
  label: 'Nuxt Docs',
  to: 'https://nuxt.com'
}, {
  label: 'Nuxt Studio',
  to: 'https://nuxt.studio'
}]
</script>