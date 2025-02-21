<script lang="ts" setup>
import { inject, ref, computed, watchEffect } from 'vue';
import Database from '@tauri-apps/plugin-sql';
import type { Ref } from 'vue';
import { until } from '@vueuse/core';

const db = inject<Ref<Database | null>>('db', ref(null));
const dbInitialized = inject<Ref<boolean>>('dbInitialized', ref(false));

// Wait for database initialization
await until(dbInitialized).toBe(true);

if (!db?.value) {
  throw createError({
    statusCode: 500,
    message: 'Database connection failed',
    fatal: true
  });
}

// Now TypeScript knows db.value is Database
const database = db as Ref<Database>;

// Columns
const columns = [{
  key: 'select',
  class: 'w-2'
}, {
  key: 'id',
  label: '#',
  sortable: true
}, {
  key: 'name',
  label: 'اسم السجل',
  sortable: true
}, {
  key: 'mainDirectory',
  label: 'المجلد الرئيسي',
  sortable: true
}, {
  key: 'date',
  label: 'التاريخ',
  sortable: true
}, {
  key: 'files',
  label: 'الملفات',
  sortable: false
}, {
  key: 'actions',
  label: 'الإجراءات',
  sortable: false
}]

const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)))
const excludeSelectColumn = computed(() => columns.filter(v => v.key !== 'select'))

// Selected Rows
const selectedRows = ref<ArchiveRow[]>([])

interface ArchiveRow {
  id: number;
  name: string;
  mainDirectory: string;
  date: string;
  files: { name: string; path: string; }[];
}

interface DbRecord {
  id: number;
  name: string;
  date: string;
  main_directory: string;
  sub_folders: string;
  notes: string;
  fileNames: string | null;
  filePaths: string | null;
}

interface CountResult {
  total: number;
}

interface TableRow extends ArchiveRow {
  subFolders: string[];
  notes: string;
}

function select(row: ArchiveRow) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selectedRows.value.push(row)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

// Actions
const actions = [
  [{
    key: 'open',
    label: 'فتح الملف',
    icon: 'i-heroicons-folder-open'
  }, {
    key: 'edit',
    label: 'تعديل',
    icon: 'i-heroicons-pencil-square'
  }], [{
    key: 'delete',
    label: 'حذف',
    icon: 'i-heroicons-trash'
  }]
]

// Filters
const search = ref('')
const selectedStatus = ref([])

const resetFilters = () => {
  search.value = ''
  selectedStatus.value = []
}

// Pagination
const sort = ref({ column: 'id', direction: 'desc' as const })
const page = ref(1)
const pageCount = ref(10)
const pageTotal = ref(0)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

// Modified data fetching to handle database state better
const { data: records, status, refresh } = await useLazyAsyncData(
  'archives',
  async () => {
    if (!dbInitialized.value || !database.value) {
      return [];
    }

    try {
      // Get total count for pagination
      const countResult = await database.value.select(
        'SELECT COUNT(*) as total FROM archive_records'
      ) as CountResult[];
      pageTotal.value = countResult[0].total;

      // Fetch paginated records
      const records = await database.value.select(`
        SELECT 
          r.id, 
          r.name, 
          r.date, 
          r.main_directory as mainDirectory, 
          r.sub_folders as subFolders,
          r.notes,
          GROUP_CONCAT(f.name) as fileNames,
          GROUP_CONCAT(f.archived_path) as filePaths
        FROM archive_records r
        LEFT JOIN archived_files f ON f.record_id = r.id
        WHERE 
          LOWER(r.name) LIKE LOWER(?) OR
          LOWER(r.main_directory) LIKE LOWER(?) OR
          LOWER(r.notes) LIKE LOWER(?) OR
          LOWER(f.name) LIKE LOWER(?)
        GROUP BY r.id
        ORDER BY r.${sort.value.column} ${sort.value.direction}
        LIMIT ? OFFSET ?
      `, [
        `%${search.value}%`,
        `%${search.value}%`,
        `%${search.value}%`,
        `%${search.value}%`,
        pageCount.value,
        (page.value - 1) * pageCount.value
      ]) as DbRecord[];

      // Process records to format files
      return records.map((record: DbRecord) => ({
        id: record.id,
        name: record.name,
        date: record.date,
        mainDirectory: record.main_directory,
        files: record.fileNames ?
          record.fileNames.split(',').map((name: string, i: number) => ({
            name,
            path: record.filePaths!.split(',')[i]
          })) : [],
        subFolders: JSON.parse(record.sub_folders || '[]'),
        notes: record.notes
      })) as TableRow[];
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  },
  {
    watch: [search, page, pageCount, sort, dbInitialized],
    default: () => [],
    server: false,
    immediate: false
  }
)

// Trigger initial fetch when DB is ready
watchEffect(() => {
  if (dbInitialized.value) {
    refresh();
  }
});

// Actions handlers
async function handleAction(action: string, row: any) {
  if (!dbInitialized.value || !database.value) {
    console.error('Database not initialized')
    return
  }

  try {
    switch (action) {
      case 'open':
        await openFileLocation(row.files[0]?.path)
        break
      case 'delete':
        if (await confirm('هل أنت متأكد من حذف هذا السجل؟')) {
          await database.value.execute(
            'DELETE FROM archive_records WHERE id = ?',
            [row.id]
          )
          refresh()
        }
        break
    }
  } catch (error) {
    console.error(`Error handling action ${action}:`, error)
  }
}
</script>

<template>
  <ClientOnly>
    <!-- Change v-if condition -->
    <div v-if="!dbInitialized" class="flex items-center justify-center h-screen">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
      <span class="ml-2 text-gray-500">جاري تحميل قاعدة البيانات...</span>
    </div>

    <UCard v-else class="mx-auto max-w-7xl" :ui="{
      base: 'm-5',
      ring: '',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: { padding: 'px-4 py-5' },
      body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
      footer: { padding: 'p-4' }
    }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-xl text-gray-900 dark:text-white leading-tight font-tajawal">
            الأرشيف
          </h2>
          <UButton icon="i-heroicons-plus" to="/" color="primary" class="font-tajawal">
            إضافة سجل
          </UButton>
        </div>
      </template>

      <!-- Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="بحث..."
          class="font-tajawal" />

        <div class="flex gap-1.5 items-center">
          <UDropdown v-if="selectedRows.length" :items="actions" :ui="{ width: 'w-36' }"
            @select="handleAction($event, selectedRows[0])">
            <UButton icon="i-heroicons-chevron-down" trailing color="gray" class="font-tajawal">
              إجراءات
            </UButton>
          </UDropdown>

          <USelectMenu v-model="selectedColumns" :options="excludeSelectColumn" multiple class="font-tajawal">
            <UButton icon="i-heroicons-view-columns" color="gray" class="font-tajawal">
              الأعمدة
            </UButton>
          </USelectMenu>

          <UButton icon="i-heroicons-funnel" color="gray" :disabled="!search" @click="resetFilters"
            class="font-tajawal">
            إعادة تعيين
          </UButton>
        </div>
      </div>

      <!-- Table -->
      <UTable v-model="selectedRows" v-model:sort="sort" :rows="records" :columns="columnsTable"
        :loading="status === 'pending'" :empty-state="{ icon: 'i-heroicons-document', label: 'لا توجد سجلات' }"
        sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" class="w-full" @select="select">
        <!-- Custom cell renderers -->
        <template #files-data="{ row }">
          <div class="flex gap-1">
            <UBadge v-for="file in row.files" :key="file.path" :label="file.name" color="gray" variant="subtle"
              class="truncate max-w-xs" />
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UDropdown :items="actions" :ui="{ width: 'w-36' }" @select="handleAction($event, row)">
              <UButton icon="i-heroicons-ellipsis-horizontal" color="gray" variant="ghost" class="font-tajawal" />
            </UDropdown>
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <template #footer>
        <div class="flex flex-wrap justify-between items-center">
          <div class="font-tajawal">
            <span class="text-sm leading-5">
              عرض
              <span class="font-medium">{{ pageFrom }}</span>
              إلى
              <span class="font-medium">{{ pageTo }}</span>
              من
              <span class="font-medium">{{ pageTotal }}</span>
              سجل
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm font-tajawal">عدد السجلات في الصفحة:</span>
            <USelect v-model="pageCount" :options="[10, 20, 30, 50]" class="w-20" />
          </div>

          <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
              activeButton: {
                variant: 'outline'
              }
            }
          }" />
        </div>
      </template>
    </UCard>

    <template #fallback>
      <div class="flex items-center justify-center h-screen">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
      </div>
    </template>
  </ClientOnly>
</template>
