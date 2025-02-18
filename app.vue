<template>
  <div>
    <UHeader :links="links" :ui="{ wrapper: 'font-tajawal' }">
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
  </div>
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
</script>