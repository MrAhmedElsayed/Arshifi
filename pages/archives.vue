<template>
  <UContainer class="mt-5 w-full">
    <UCard class="w-full"
    :ui="{
        base: '',
        ring: '',
        divide: 'divide-y divide-gray-200 dark:divide-gray-700',
        header: { padding: 'px-4 py-5' },
        body: {
          padding: '',
          base: 'divide-y divide-gray-200 dark:divide-gray-700',
        },
        footer: { padding: 'p-4' },
      }"
    >
      <template #header>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="font-semibold text-xl text-gray-900 dark:text-white leading-tight font-tajawal">
                الأرشيف
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                إدارة وتنظيم سجلات الأرشيف الخاصة بك
              </p>
            </div>
            <UButton
              icon="i-heroicons-plus"
              color="primary"
              to='/'
            >
              إضافة سجل جديد
            </UButton>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            يمكنك هنا تصفح وإدارة سجلات الأرشيف الخاصة بك. استخدم الفلاتر للبحث عن سجلات محددة.
          </p>
        </div>
      </template>

      <!-- Filters -->
      <div
        class="flex items-center justify-between gap-3 px-4 py-3 font-tajawal"
      >
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="بحث..."
          :loading="isSearching"
        />

        <USelectMenu
          v-model="selectedStatus"
          :options="recordStatus"
          multiple
          placeholder="الحالة"
          class="w-40"
        />
      </div>

      <!-- Header and Action buttons -->
      <div class="flex justify-between items-center w-full px-4 py-3">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5 font-scheherazade">عدد الصفوف في الصفحة:</span>

          <USelect
            v-model="pageCount"
            :options="[3, 5, 10, 20, 30, 40]"
            class="me-2 w-20"
            size="xs"
          />
        </div>

        <div class="flex gap-1.5 items-center">
          
          <USelectMenu
            v-model="selectedColumns"
            :options="excludeSelectColumn"
            multiple
          >
            <UButton icon="i-heroicons-view-columns" color="gray" 
            size="xs" class="min-w-36">
              الأعمدة
            </UButton>
          </USelectMenu>

          <UButton
            icon="i-heroicons-funnel"
            color="gray"
            size="xs"
            :disabled="searchQuery === '' && selectedStatus.length === 0"
            @click="resetFilters"
          >
            إعادة تعيين
          </UButton>
        </div>
      </div>

      <!-- Table -->
      <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        :rows="records"
        :columns="columnsTable"
        :loading="loading"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        sort-mode="manual"
        class="w-full"
        :ui="{
          td: {
            base: 'max-w-[0] truncate',
            style: 'font-family: Tajwal, sans-serif; direction: rtl;',
          },
          default: { checkbox: { color: 'primary' } },
        }"
        :empty-state="{
          icon: 'i-heroicons-circle-stack',
          label: 'لا توجد سجلات',
        }"
        :loading-state="{
          icon: 'i-heroicons-arrow-path',
          label: 'جاري التحميل...',
        }"
        @select="select"
      >

        <template #filesCount-data="{ row }">
          {{ row.files?.length || 0 }} ملفات
        </template>
        
        <template #actions-data="{ row }">
          <UButton
              icon="i-heroicons-folder-open"
              color="gray"
              variant="ghost"
              size="xs"
              @click="viewRecord(row)"
            />
        </template>
      </UTable>

      <!-- Footer with Pagination -->
      <template #footer>
        <div class="flex flex-wrap justify-between items-center font-scheherazade">
          <div>
            <span class="text-sm leading-5">
              عرض
              <span class="font-medium">{{ startIndex + 1 }}</span>
              إلى
              <span class="font-medium">{{ endIndex }}</span>
              من
              <span class="font-medium">{{ totalRecords }}</span>
              سجل
            </span>
          </div>

          <UPagination
            v-model="currentPage"
            :page-count="pageCount"
            :total="totalRecords"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
          />
        </div>
      </template>
    </UCard>
  </UContainer>

  <!-- View Record Modal -->
  <UModal v-model="showViewModal" :ui="{ width: 'max-w-2xl' }">
    <UCard v-if="selectedRecord">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ selectedRecord.name }}</h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="showViewModal = false"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium text-gray-500">المجلد الرئيسي</div>
            <div>{{ selectedRecord.mainDirectory }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-500">التاريخ</div>
            <div>{{ selectedRecord.date }}</div>
          </div>
        </div>

        <div v-if="selectedRecord.subFolders?.length">
          <div class="text-sm font-medium text-gray-500">المجلدات الفرعية</div>
          <div class="flex gap-2 flex-wrap">
            <UBadge
              v-for="folder in selectedRecord.subFolders"
              :key="folder"
              color="gray"
              variant="soft"
            >
              {{ folder }}
            </UBadge>
          </div>
        </div>

        <div v-if="selectedRecord.files?.length">
          <div class="text-sm font-medium text-gray-500 mb-2">الملفات</div>
          <div class="space-y-2">
            <div
              v-for="file in selectedRecord.files"
              :key="file.id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span>{{ file.name }}</span>
              <UButton
                icon="i-heroicons-folder-open"
                color="primary"
                variant="ghost"
                size="xs"
                @click="openFile(file.path)"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedRecord.notes">
          <div class="text-sm font-medium text-gray-500">ملاحظات</div>
          <p class="text-gray-700">{{ selectedRecord.notes }}</p>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted } from "vue";
import type { SearchableRecord } from "~/utils/search";
import { openFileLocation } from "~/utils/file";
import { useDebounceFn } from "@vueuse/core";

const db = inject<Ref<any>>("db", ref(null));

// Table state
const loading = ref(false);
const records = ref<SearchableRecord[]>([]);
const selectedRows = ref<SearchableRecord[]>([]);
const searchQuery = ref("");
const isSearching = ref(false);
const currentPage = ref(1);
const pageCount = ref(10);
const totalRecords = ref(0);
const sort = ref<{ column: string; direction: "desc" | "asc" }>({
  column: "date",
  direction: "desc",
});
const showViewModal = ref(false);
const selectedRecord = ref<SearchableRecord | null>(null);

// Column definitions with select
const columns = [
  {
    key: "select",
    class: "w-2",
  },
  {
    key: "name",
    label: "الاسم",
    sortable: true,
  },
  {
    key: "mainDirectory",
    label: "المجلد الرئيسي",
    sortable: true,
  },
  {
    key: "date",
    label: "التاريخ",
    sortable: true,
  },
  {
    key: "filesCount",
    label: "عدد الملفات",
    sortable: true,
  },
  {
    key: "actions",
    label: "اجراءات",
    sortable: false,
  },
];

// Column selection
const selectedColumns = ref(columns);

const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

const excludeSelectColumn = computed(() =>
  columns.filter((v) => v.key !== "select")
);

interface StatusOption {
  key: string;
  label: string;
  value: string;
}

// Update ref type
const selectedStatus = ref<StatusOption[]>([]);

// Status options for filter
const recordStatus: StatusOption[] = [
  {
    key: "all",
    label: "الكل",
    value: "all",
  },
  {
    key: "withFiles",
    label: "مع ملفات",
    value: "withFiles",
  },
  {
    key: "noFiles",
    label: "بدون ملفات",
    value: "noFiles",
  },
];

// Reset filters function
const resetFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = [];
};

// Computed properties
const startIndex = computed(() => (currentPage.value - 1) * pageCount.value);
const endIndex = computed(() => {
  const end = startIndex.value + pageCount.value;
  return Math.min(end, totalRecords.value);
});

// Add a new function to check and wait for DB initialization
async function waitForDb() {
  let attempts = 0;
  const maxAttempts = 10;

  while (!db.value && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
    attempts++;
  }

  if (!db.value) {
    throw new Error("Database failed to initialize");
  }
}

// Modify loadRecords to use waitForDb
async function loadRecords() {
  loading.value = true;
  try {
    await waitForDb();

    let whereClause = "";
    let params = [];

    if (selectedStatus.value.length > 0) {
      const hasWithFiles = selectedStatus.value.some(
        (s) => s.value === "withFiles"
      );
      const hasNoFiles = selectedStatus.value.some(
        (s) => s.value === "noFiles"
      );

      if (hasWithFiles && !hasNoFiles) {
        whereClause =
          "WHERE EXISTS (SELECT 1 FROM archived_files f WHERE f.record_id = r.id)";
      } else if (hasNoFiles && !hasWithFiles) {
        whereClause =
          "WHERE NOT EXISTS (SELECT 1 FROM archived_files f WHERE f.record_id = r.id)";
      }
    }

    // Get total count with a separate query that doesn't join with files
    const countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM archive_records r
      ${whereClause}
    `;
    
    const countResult = await db.value.select(countQuery, []);
    totalRecords.value = countResult[0].total;
    console.log("Total unique records count:", totalRecords.value);

    // Get paginated records
    const query = `
      SELECT DISTINCT
        r.id, r.name, r.date, r.main_directory, r.sub_folders, r.notes,
        f.id as file_id, f.name as file_name, f.archived_path as file_path
      FROM archive_records r
      LEFT JOIN archived_files f ON f.record_id = r.id
      ${whereClause}
      ORDER BY r.${sort.value.column} ${sort.value.direction === "desc" ? "DESC" : "ASC"}
      LIMIT ? OFFSET ?
    `;

    const rawRecords = await db.value.select(query, [
      pageCount.value,
      (currentPage.value - 1) * pageCount.value,
    ]);
    console.log("Raw records from DB:", rawRecords);

    // Process records
    const recordMap = new Map();
    rawRecords.forEach((row: any) => {
      if (!recordMap.has(row.id)) {
        recordMap.set(row.id, {
          id: row.id,
          name: row.name,
          date: row.date,
          mainDirectory: row.main_directory,
          subFolders: JSON.parse(row.sub_folders || "[]"),
          notes: row.notes,
          files: [],
        });
      }

      if (row.file_id) {
        recordMap.get(row.id).files.push({
          id: row.file_id,
          name: row.file_name,
          path: row.file_path,
        });
      }
    });

    records.value = Array.from(recordMap.values());
    console.log("Processed records:", records.value);
  } catch (error) {
    console.error("Error loading records:", error);
  } finally {
    loading.value = false;
  }
}

// Modify the onMounted hook to handle errors
onMounted(async () => {
  try {
    await loadRecords();
  } catch (error) {
    console.error("Error in onMounted:", error);
  }
});

// Add debounced search
const debouncedSearch = useDebounceFn(async () => {
  currentPage.value = 1; // Reset to first page when searching
  await performSearch();
}, 300);

// Update search query watcher
watch(searchQuery, () => {
  isSearching.value = true;
  debouncedSearch();
});

// Update performSearch function
async function performSearch() {
  try {
    await waitForDb();
    const query = searchQuery.value.trim();

    if (!query) {
      await loadRecords();
      return;
    }

    // First get total count for pagination
    const countResult = await db.value.select(
      `
      SELECT COUNT(DISTINCT r.id) as count
      FROM archive_records r
      LEFT JOIN archived_files f ON f.record_id = r.id
      WHERE 
        LOWER(r.name) LIKE LOWER(?) OR
        LOWER(r.main_directory) LIKE LOWER(?) OR
        LOWER(r.notes) LIKE LOWER(?) OR
        LOWER(f.name) LIKE LOWER(?)
    `,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    totalRecords.value = countResult[0].count;

    // Then get paginated results
    const searchResults = await db.value.select(
      `
      SELECT DISTINCT
        r.id, r.name, r.date, r.main_directory, r.sub_folders, r.notes,
        f.id as file_id, f.name as file_name, f.archived_path as file_path
      FROM archive_records r
      LEFT JOIN archived_files f ON f.record_id = r.id
      WHERE 
        LOWER(r.name) LIKE LOWER(?) OR
        LOWER(r.main_directory) LIKE LOWER(?) OR
        LOWER(r.notes) LIKE LOWER(?) OR
        LOWER(f.name) LIKE LOWER(?)
      ORDER BY r.${sort.value.column} ${
        sort.value.direction === "desc" ? "DESC" : "ASC"
      }
      LIMIT ? OFFSET ?
    `,
      [
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        pageCount.value,
        (currentPage.value - 1) * pageCount.value,
      ]
    );

    // Process results...
    processSearchResults(searchResults);
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    isSearching.value = false;
  }
}

function select(row: SearchableRecord) {
  const index = selectedRows.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}


function viewRecord(record: SearchableRecord) {
  selectedRecord.value = record;
  showViewModal.value = true;
}

async function openFile(path: string) {
  await openFileLocation(path);
}

// Watch for changes
watch([currentPage, searchQuery], () => {
  if (searchQuery.value) {
    performSearch();
  } else {
    loadRecords();
  }
});

function processSearchResults(searchResults: any[]) {
  const recordMap = new Map();
  searchResults.forEach((row: any) => {
    if (!recordMap.has(row.id)) {
      recordMap.set(row.id, {
        id: row.id,
        name: row.name,
        date: row.date,
        mainDirectory: row.main_directory,
        subFolders: JSON.parse(row.sub_folders || "[]"),
        notes: row.notes,
        files: [],
      });
    }

    if (row.file_id) {
      recordMap.get(row.id).files.push({
        id: row.file_id,
        name: row.file_name,
        path: row.file_path,
      });
    }
  });

  records.value = Array.from(recordMap.values());
}

// Add watchers for new filters
watch([selectedStatus], () => {
  currentPage.value = 1;
  loadRecords();
});

// Watch for page size changes
watch(pageCount, () => {
  currentPage.value = 1; // Reset to first page when changing page size
  loadRecords();
});

// Watch for page changes
watch(currentPage, () => {
  loadRecords();
});
</script>
