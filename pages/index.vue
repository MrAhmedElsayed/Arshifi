<template>
  <UContainer class="relative h-screen">
    <!-- Alert for main storage path -->
    <UAlert v-if="!mainStoragePath" icon="i-heroicons-exclamation-triangle" title="تنبيه!"
      description="يرجى تحديد مجلد التخزين الرئيسي في الإعدادات أولاً" color="amber" class="mb-4">
      <template #description>
        <div class="flex items-center gap-2">
          <span>يرجى تحديد مجلد التخزين الرئيسي في الإعدادات أولاً</span>
          <UButton to="/settings" color="amber" variant="soft" label="الذهاب للإعدادات" />
        </div>
      </template>
    </UAlert>

    <!-- Add File Button -->
    <UButton class="fixed top-20 start-10 mx-auto font-tajawal w-24 mt-6 text-lg" icon="i-heroicons-folder-plus"
      size="sm" color="primary" variant="soft" label="اضافة " :trailing="false" @click="openFileSelector" />

    <!-- Search Section -->
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

      <!-- Search Results -->
      <UPageGrid>
        <template v-if="q">
          <div v-if="searching" class="text-center py-8">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
          </div>
          <template v-else>
            <div v-if="searchResults.length === 0" class="text-center py-8 text-gray-500">
              لا توجد نتائج
            </div>
            <UCard v-else v-for="record in searchResults" :key="record.id" class="mb-4">
              <div class="space-y-4">
                <!-- Record Info -->
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-lg">{{ record.name }}</h3>
                    <p class="text-sm text-gray-600">{{ record.mainDirectory }}</p>
                  </div>
                  <span class="text-sm text-gray-500">{{ record.date }}</span>
                </div>

                <!-- Files -->
                <div v-if="record.files.length" class="space-y-2">
                  <div v-for="file in record.files" :key="file.id" 
                    class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-document" class="text-primary" />
                      <span>{{ file.name }}</span>
                    </div>
                    <UButton
                      icon="i-heroicons-folder-open"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      @click="openFile(file.path)"
                    />
                  </div>
                </div>

                <!-- Notes -->
                <p v-if="record.notes" class="text-sm text-gray-600">
                  {{ record.notes }}
                </p>
              </div>
            </UCard>
          </template>
        </template>
      </UPageGrid>
    </ULandingSection>

    <!-- Add File Modal -->
    <UModal v-model="isOpen" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 dark:text-white font-tajawal">
              اضافة ملف جديد
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="isOpen = false" />
          </div>
        </template>

        <form @submit.prevent="saveFile" class="font-scheherazade space-y-4 p-4">
          <!-- Record Name -->
          <UFormGroup label="اسم السجل" required>
            <UInput v-model="recordForm.name" placeholder="ادخل اسم السجل" />
          </UFormGroup>

          <!-- Date -->
          <UFormGroup label="التاريخ">
            <UInput v-model="recordForm.date" type="date" />
          </UFormGroup>

          <!-- Main Directory -->
          <UFormGroup label="المجلد الرئيسي" required>
            <div class="flex gap-2">
              <USelect
                v-model="recordForm.mainDirectory"
                :options="mainDirectories"
                placeholder="اختر المجلد الرئيسي"
                class="flex-1"
              />
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                variant="soft"
                @click="showNewDirInput = true"
              />
            </div>
            
            <!-- New Directory Input -->
            <UModal v-model="showNewDirInput">
              <UCard>
                <template #header>إضافة مجلد جديد</template>
                <div class="p-4 space-y-4">
                  <UInput v-model="newDirName" placeholder="اسم المجلد الجديد" />
                  <div class="flex justify-end gap-2">
                    <UButton
                      color="gray"
                      variant="soft"
                      @click="showNewDirInput = false"
                    >
                      الغاء
                    </UButton>
                    <UButton
                      color="primary"
                      :loading="creating"
                      @click="createNewDirectory"
                    >
                      إضافة
                    </UButton>
                  </div>
                </div>
              </UCard>
            </UModal>
          </UFormGroup>

          <!-- Sub Folders -->
          <UFormGroup label="المجلدات الفرعية">
            <div class="space-y-2">
              <div v-for="(folder, index) in recordForm.subFolders" :key="index" class="flex gap-2">
                <UInput v-model="recordForm.subFolders[index]" placeholder="اسم المجلد الفرعي" class="flex-1" />
                <UButton
                  v-if="recordForm.subFolders.length > 1"
                  icon="i-heroicons-trash"
                  color="red"
                  variant="soft"
                  @click="recordForm.subFolders.splice(index, 1)"
                />
              </div>
              <UButton
                icon="i-heroicons-plus"
                variant="soft"
                @click="recordForm.subFolders.push('')"
              >
                إضافة مجلد فرعي
              </UButton>
            </div>
          </UFormGroup>

          <!-- Files -->
          <UFormGroup label="الملفات" required>
            <div class="space-y-2">
              <div v-for="(file, index) in recordForm.files" 
                   :key="index" 
                   class="flex items-center gap-2">
                <div v-if="!file.isEditing" class="flex-1 text-sm">
                  {{ file.name }}
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="xs"
                    @click="startEditingFile(index)"
                  />
                </div>
                <div v-else class="flex-1 flex items-center gap-2">
                  <UInput 
                    v-model="file.newName" 
                    size="sm"
                    class="flex-1"
                  />
                  <UButton
                    icon="i-heroicons-check"
                    color="green"
                    variant="soft"
                    size="xs"
                    @click="saveFileName(index)"
                  />
                  <UButton
                    icon="i-heroicons-x-mark"
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="cancelEditingFile(index)"
                  />
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="soft"
                  @click="recordForm.files.splice(index, 1)"
                />
              </div>
              <UButton
                icon="i-heroicons-document-plus"
                variant="soft"
                @click="openFileSelector"
              >
                إضافة ملف
              </UButton>
            </div>
          </UFormGroup>

          <!-- Notes -->
          <UFormGroup label="ملاحظات">
            <UTextarea v-model="recordForm.notes" :rows="3" />
          </UFormGroup>

          <!-- Path Preview -->
          <div class="text-sm text-gray-600">
            المسار: {{ computedPath }}
          </div>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2 p-4">
            <UButton color="gray" variant="soft" @click="isOpen = false">
              الغاء
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!isFormValid"
              @click="saveFile"
            >
              حفظ
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, shallowRef } from "vue";
import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, mkdir } from '@tauri-apps/plugin-fs';
import { join, basename } from '@tauri-apps/api/path';
import type { ArchiveRecord, FileEntry } from '~/types/archive';
import { searchRecords } from '~/utils/search';
import type { SearchableRecord, SearchResult } from '~/utils/search';
import { openFileLocation } from '~/utils/file';

const db = inject<Ref<any>>('db', ref(null));
const mainStoragePath = inject<Ref<string>>('mainStoragePath', ref(''));

const isOpen = ref(false);
const recordForm = ref<ArchiveRecord>({
  name: '',
  date: '',
  mainDirectory: '',
  subFolders: [''],
  notes: '',
  files: [] as FileEntry[]
});
const showNewDirInput = ref(false);
const newDirName = ref('');
const creating = ref(false);
const saving = ref(false);
const archivedFiles = ref<Array<any>>([]);
const q = ref('');
const searching = ref(false);
const searchResults = ref<SearchableRecord[]>([]);

// Get main directories
const mainDirectories = ref<string[]>([]);

async function loadMainDirectories() {
  if (!mainStoragePath.value) return;
  
  try {
    const { readDir } = await import('@tauri-apps/plugin-fs');
    const entries = await readDir(mainStoragePath.value);
    
    // Filter only directories using isDirectory
    mainDirectories.value = entries
      .filter(entry => entry.isDirectory)  // Changed from children to isDirectory
      .map(entry => entry.name as string);
      
  } catch (error) {
    console.error('Error loading directories:', error);
  }
}

async function createNewDirectory() {
  if (!newDirName.value) return;
  
  creating.value = true;
  try {
    const newPath = await join(mainStoragePath.value, newDirName.value);
    await mkdir(newPath);
    mainDirectories.value.push(newDirName.value);
    recordForm.value.mainDirectory = newDirName.value;
    showNewDirInput.value = false;
    newDirName.value = '';
  } catch (error) {
    console.error('Error creating directory:', error);
  } finally {
    creating.value = false;
  }
}

// Computed path based on form values
const computedPath = computed(() => {
  const parts = [
    mainStoragePath.value,
    recordForm.value.mainDirectory,
    ...recordForm.value.subFolders.filter(f => f.trim())
  ];
  return parts.join('\\');
});

// Form validation
const isFormValid = computed(() => {
  return recordForm.value.name &&
    recordForm.value.mainDirectory &&
    recordForm.value.files.length > 0;
});

// Modified file selector
async function openFileSelector() {
  try {
    const selected = await open({
      multiple: false,
      directory: false
    });
    
    if (selected && typeof selected === 'string') {
      const name = await basename(selected);
      recordForm.value.files.push({
        path: selected,
        name
      });
      isOpen.value = true;
    }
  } catch (error) {
    console.error('Error selecting file:', error);
  }
}

// Save function
async function saveFile() {
  if (!isFormValid.value) return;
  
  saving.value = true;
  try {
    // Create directories
    const targetPath = computedPath.value;
    await mkdir(targetPath, { recursive: true });

    // First insert the record and get its ID
    const recordResult = await db.value.execute(
      `INSERT INTO archive_records (name, date, main_directory, sub_folders, notes)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id`,  // Add RETURNING to get the new record's ID
      [
        recordForm.value.name,
        recordForm.value.date,
        recordForm.value.mainDirectory,
        JSON.stringify(recordForm.value.subFolders),
        recordForm.value.notes
      ]
    );

    const recordId = recordResult.lastInsertId;

    // Copy files and save them to database
    for (const file of recordForm.value.files) {
      const newPath = await join(targetPath, file.name);
      await copyFile(file.path, newPath);

      // Save file info to database
      await db.value.execute(
        `INSERT INTO archived_files (record_id, name, original_path, archived_path)
         VALUES (?, ?, ?, ?)`,
        [recordId, file.name, file.path, newPath]
      );
    }

    // Reset form
    recordForm.value = {
      name: '',
      date: '',
      mainDirectory: '',
      subFolders: [''],
      notes: '',
      files: []
    };
    isOpen.value = false;

    console.log('Saving record:', {
      name: recordForm.value.name,
      date: recordForm.value.date,
      mainDirectory: recordForm.value.mainDirectory,
      subFolders: recordForm.value.subFolders,
      notes: recordForm.value.notes
    });
  } catch (error) {
    console.error('Error saving record:', error);
  } finally {
    saving.value = false;
  }
}

// Watch for changes in mainStoragePath
watch(() => mainStoragePath.value, () => {
  loadMainDirectories();
});

// Add functions for file editing
function startEditingFile(index: number) {
  const file = recordForm.value.files[index];
  file.isEditing = true;
  file.newName = file.name;
}

function saveFileName(index: number) {
  const file = recordForm.value.files[index];
  if (file.newName && file.newName.trim()) {
    file.name = file.newName;
  }
  file.isEditing = false;
}

function cancelEditingFile(index: number) {
  const file = recordForm.value.files[index];
  file.isEditing = false;
  file.newName = file.name;
}

// Simple search function
async function performSearch(query: string) {
  if (!query.trim() || !db.value) return;
  
  searching.value = true;
  try {
    // Modified query to include sub_folders search
    const records = await db.value.select(`
      SELECT DISTINCT
        r.id, r.name, r.date, r.main_directory, r.sub_folders, r.notes,
        f.id as file_id, f.name as file_name, f.archived_path as file_path
      FROM archive_records r
      LEFT JOIN archived_files f ON f.record_id = r.id
      WHERE 
        LOWER(r.name) LIKE LOWER(?) OR
        LOWER(r.main_directory) LIKE LOWER(?) OR
        LOWER(r.notes) LIKE LOWER(?) OR
        LOWER(f.name) LIKE LOWER(?) OR
        LOWER(r.sub_folders) LIKE LOWER(?)  -- Added sub_folders search
      ORDER BY r.id DESC
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    // For debugging
    console.log('Search query:', query);
    console.log('Search results:', records);

    // Group files by record
    const recordMap = new Map();

    records.forEach((row: DbRow) => {
      if (!recordMap.has(row.id)) {
        recordMap.set(row.id, {
          id: row.id,
          name: row.name,
          date: row.date,
          mainDirectory: row.main_directory,
          subFolders: JSON.parse(row.sub_folders || '[]'),
          notes: row.notes,
          files: []
        });
      }

      if (row.file_id) {
        recordMap.get(row.id).files.push({
          id: row.file_id,
          name: row.file_name,
          path: row.file_path
        });
      }
    });

    searchResults.value = Array.from(recordMap.values());
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    searching.value = false;
  }
}

// Simple debounced watch for search input
let searchTimeout: NodeJS.Timeout;
watch(q, (newQuery: string) => {
  clearTimeout(searchTimeout);
  if (!newQuery.trim()) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(() => {
    performSearch(newQuery);
  }, 300);
});

// Add the function
const openFile = openFileLocation;

interface DbRow {
  id: number;
  name: string;
  date: string;
  main_directory: string;
  sub_folders: string;
  notes: string;
  file_id: number | null;
  file_name: string | null;
  file_path: string | null;
}
</script>
