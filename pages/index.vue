<template>
  <UContainer class="relative h-screen">
    <UButton class="fixed top-20 start-10 mx-auto font-tajawal w-24 mt-6 text-lg" icon="i-heroicons-folder-plus"
      size="sm" color="primary" variant="soft" label="اضافة " :trailing="false" @click="isOpen = true" />

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
          <textarea v-model="notes" placeholder="ملاحظات" class="w-full p-2 border" required></textarea>
        </div>

        <!-- Footer (Submit/Cancel buttons) -->
        <template #footer>
          <div class="flex justify-end space-x-2 p-4">
            <UButton color="gray" variant="ghost" label="الغاء" @click="isOpen = false" />
            <UButton color="primary" variant="soft" label="حفظ" @click="saveFile" />
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
          <!-- Using the description slot to insert a list -->
          <template #description>
            please visit : https://preline.co/docs/tree-view.html npm install
            fuse.js@^7
          </template>
        </ULandingCard>
      </UPageGrid>
    </ULandingSection>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";

const q = ref(""); // Holds the file name

const isOpen = ref(false);
const fileName = ref('');
const fileDate = ref('');
const mainLocation = ref(''); // Main location field (المجلد الرئيسي)
const notes = ref('');
const subfolders = ref<string[]>(['']);

// Compute the full folder structure: main location + subfolders
const progressPath = computed(() => {
  const segments: string[] = [];
  if (mainLocation.value.trim() !== '') {
    segments.push(mainLocation.value.trim());
  }
  segments.push(...subfolders.value.filter((folder) => folder.trim() !== ''));
  return segments.join('/');
});

// Method to add a new subfolder input.
const addSubfolder = () => {
  subfolders.value.push('');
};

// Method to remove a specific subfolder input.
const removeSubfolder = (index: number) => {
  if (subfolders.value.length > 1) {
    subfolders.value.splice(index, 1);
  }
};

// Method to handle file saving logic.
const saveFile = () => {
  console.log('Saving file with the following data:', {
    fileName: fileName.value,
    fileDate: fileDate.value,
    mainLocation: mainLocation.value,
    notes: notes.value,
    folderStructure: progressPath.value,
  });

  // Insert your file upload/storage logic here.

  // Close the modal after saving.
  isOpen.value = false;
};

// https://v2.tauri.app/plugin/file-system/

</script>
