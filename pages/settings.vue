<template>
  <div class="p-8 w-[500px] mx-auto">
    <h1 class="text-2xl font-tajawal mb-6">الإعدادات</h1>
    
    <div class="space-y-6">
      <!-- Main Storage Directory Section -->
      <div class="space-y-2">
        <h2 class="text-lg font-tajawal">مجلد التخزين الرئيسي</h2>
        <div class="flex items-center gap-3">
          <UInput
            v-model="mainStoragePath"
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
        <p v-if="mainStoragePath" class="text-sm text-gray-600 font-scheherazade">
          المسار المحدد: {{ mainStoragePath }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { open } from '@tauri-apps/plugin-dialog';

const mainStoragePath = ref('');

async function selectMainStorage() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    
    if (selected && typeof selected === 'string') {
      mainStoragePath.value = selected;
      // Store the path in localStorage for persistence
      localStorage.setItem('mainStoragePath', selected);
    }
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}

// Load saved path on component mount
onMounted(() => {
  const savedPath = localStorage.getItem('mainStoragePath');
  if (savedPath) {
    mainStoragePath.value = savedPath;
  }
});
</script>
