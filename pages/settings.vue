<template>
  <div class="p-8 w-[500px] mx-auto">
    <h1 class="text-2xl font-tajawal mb-6">الإعدادات</h1>
    
    <div class="space-y-6">
      <!-- Main Storage Directory Section -->
      <div class="space-y-2">
        <h2 class="text-lg font-tajawal">مجلد التخزين الرئيسي</h2>
        <div class="flex items-center gap-3">
          <UInput
            v-model="storageStore.mainStoragePath"
            placeholder="اختر مجلد التخزين الرئيسي"
            readonly
            class="flex-1 font-scheherazade"
          />
          <UButton
            icon="i-heroicons-folder"
            label="اختيار المجلد"
            @click="selectMainStorage"
            class="font-tajawal"
          />
        </div>
        <p v-if="storageStore.mainStoragePath" class="text-sm text-gray-600 font-scheherazade">
          المسار المحدد: {{ storageStore.mainStoragePath }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { open } from '@tauri-apps/plugin-dialog';
import { useStorageStore } from '../stores/storage';
import { Store } from '@tauri-apps/plugin-store'

const db = inject<Ref<any>>('db', ref(null));
const storageStore = useStorageStore();

async function selectMainStorage() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    
    if (selected && typeof selected === 'string') {
      await storageStore.setMainStoragePath(selected);
    }
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}
</script>
