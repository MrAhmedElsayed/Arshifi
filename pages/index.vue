<template>
  <UContainer class="relative h-screen">
    <UButton class="fixed top-20 start-10 mx-auto font-tajawal w-24 mt-6 text-lg" icon="i-heroicons-folder-plus"
      size="sm" color="primary" variant="soft" label="اضافة " :trailing="false" @click="openFileSelector" />

    <UModal v-model="isOpen" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <!-- Header -->
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white font-tajawal">
              اضافة ملف جديد
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen = false" />
          </div>
        </template>

        <div class="font-scheherazade space-y-5 p-4">
          <!-- Selected File Info -->
          <div v-if="selectedFile" class="text-sm text-gray-600">
            Selected file: {{ selectedFile.name }}
          </div>

          <!-- File Name and Date -->
          <input type="text" v-model="fileName" placeholder="اسم الملف" class="w-full p-2 border" required />
          <input type="date" v-model="fileDate" placeholder="التاريخ" class="w-full p-2 border" />

          <!-- Main Location Field -->
          <input type="text" v-model="mainLocation" placeholder="المجلد الرئيسي" class="w-full p-2 border" required />

          <!-- Dynamic Subfolders -->
          <div>
            <h4 class="font-semibold mb-2">المجلدات الفرعية</h4>
            <div v-for="(folder, index) in subfolders" :key="index" class="flex items-center space-x-2 mb-2">
              <input type="text" v-model="subfolders[index]" placeholder="اسم المجلد الفرعي"
                class="flex-1 p-2 border" />
              <UButton v-if="subfolders.length > 1" color="red" variant="ghost" icon="i-heroicons-trash"
                @click="removeSubfolder(index)" />
            </div>
            <UButton color="primary" variant="soft" label="إضافة مجلد فرعي" @click="addSubfolder" />

            <!-- Show the current folder structure (progress) -->
            <div class="mt-3">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                المسار الحالي:
                <span class="font-bold">{{ progressPath }}</span>
              </p>
            </div>
          </div>

          <!-- Notes -->
          <textarea v-model="notes" placeholder="ملاحظات" class="w-full p-2 border" rows="3"></textarea>
        </div>

        <!-- Footer (Submit/Cancel buttons) -->
        <template #footer>
          <div class="flex justify-end space-x-2 p-4">
            <UButton color="gray" variant="ghost" label="الغاء" @click="isOpen = false" />
            <UButton color="primary" variant="soft" label="حفظ" @click="saveFile" :disabled="!selectedFile" />
          </div>
        </template>
      </UCard>
    </UModal>

    <ULandingSection title="ارشيفي لادارة الملفات" :ui="{
      wrapper: 'py-16 sm:py-20 md:py-24',
      title: 'text-4xl sm:text-5xl font-tajawal',
      container: 'gap-8 sm:gap-y-12',
      description: 'mt-10 flex flex-col w-full font-scheherazade',
    }">
      <template #description>
        <UInput v-model="q" name="q" size="lg" placeholder="بحث..." icon="i-heroicons-magnifying-glass-20-solid"
          class="mx-auto font-scheherazade w-5/12" autocomplete="off" :ui="{ icon: { trailing: { pointer: '' } } }">
          <template #trailing>
            <UButton v-show="q !== ''" color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" :padded="false"
              @click="q = ''" />
          </template>
        </UInput>
      </template>

      <UPageGrid>
        <ULandingCard title="القاهرة: 4 نتائج" :ui="{ title: 'text-2xl font-tajawal' }">
          <template #description>
            <div v-if="archivedFiles.length > 0">
              <ul class="space-y-2">
                <li v-for="file in archivedFiles" :key="file.path" class="p-2 hover:bg-gray-100 rounded">
                  {{ file.name }} - {{ file.path }}
                </li>
              </ul>
            </div>
            <div v-else class="text-gray-500">
              No archived files found
            </div>
          </template>
        </ULandingCard>
      </UPageGrid>
    </ULandingSection>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
// Update the import to use plugin-dialog
import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, mkdir } from '@tauri-apps/plugin-fs';
import { join, basename, homeDir } from '@tauri-apps/api/path';


const q = ref(""); // Search query
const isOpen = ref(false);
const fileName = ref('');
const fileDate = ref('');
const mainLocation = ref('');
const notes = ref('');
const subfolders = ref<string[]>(['']);
const selectedFile = ref<{ path: string, name: string } | null>(null);
const archivedFiles = ref<Array<{ name: string, path: string }>>([]);
const mainStoragePath = computed(() => localStorage.getItem('mainStoragePath') || '');

// Compute the full folder structure: main location + subfolders
const progressPath = computed(() => {
  if (!mainStoragePath.value) {
    return '';
  }
  
  const segments: string[] = [mainStoragePath.value];
  if (mainLocation.value.trim() !== '') {
    segments.push(mainLocation.value.trim());
  }
  segments.push(...subfolders.value.filter((folder) => folder.trim() !== ''));
  // Use proper path joining instead of string concatenation
  return segments.join('\\').replace(/\//g, '\\');
});

async function openFileSelector() {
  try {
    const selected = await open({
      multiple: false,
      directory: false, // explicitly specify we want files, not directories
      filters: [{
        name: 'All Files',
        extensions: ['*']
      }]
    });
    
    if (selected && typeof selected === 'string') {
      selectedFile.value = {
        path: selected,
        name: await basename(selected)
      };
      fileName.value = selectedFile.value.name;
      isOpen.value = true;
    }
  } catch (error) {
    console.error('Error selecting file:', error);
  }
}

const addSubfolder = () => {
  subfolders.value.push('');
};

const removeSubfolder = (index: number) => {
  if (subfolders.value.length > 1) {
    subfolders.value.splice(index, 1);
  }
};

async function saveFile() {
  if (!selectedFile.value) return;
  if (!mainStoragePath.value) {
    // Show error or notification that main storage path needs to be set
    console.error('Please set main storage path in settings first');
    return;
  }

  try {
    const targetPath = progressPath.value;
    
    // Ensure directory exists with proper path
    await mkdir(targetPath, { recursive: true });
    
    // Create new file path with proper path separator
    const joinedPath = await join(targetPath, fileName.value);
    const newPath = joinedPath.replace(/\//g, '\\');
    
    await copyFile(selectedFile.value.path, newPath);

    // Add to archived files list
    archivedFiles.value.push({
      name: fileName.value,
      path: newPath
    });

    // Reset form
    selectedFile.value = null;
    fileName.value = '';
    fileDate.value = '';
    mainLocation.value = '';
    notes.value = '';
    subfolders.value = [''];
    
    // Close modal
    isOpen.value = false;

    console.log('File archived successfully!');
  } catch (error) {
    console.error('Error archiving file:', error);
  }
}
</script>
