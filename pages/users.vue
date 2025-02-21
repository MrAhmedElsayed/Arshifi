<template>
  <UContainer class="my-20 w-full">
    <UCard
      class="w-full"
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
        <h2
          class="font-semibold text-xl text-gray-900 dark:text-white leading-tight font-tajawal"
        >
          المهام
        </h2>
      </template>

      <!-- Filters -->
      <div
        class="flex items-center justify-between gap-3 px-4 py-3 font-tajawal"
      >
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="بحث..."
          :loading="status === 'pending'"
        />

        <USelectMenu
          v-model="selectedStatus"
          :options="todoStatus"
          multiple
          placeholder="الحالة"
          class="w-40"
        />
      </div>

      <!-- Header and Action buttons -->
      <div class="flex justify-between items-center w-full px-4 py-3">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5">عدد الصفوف في الصفحة:</span>

          <USelect
            v-model="pageCount"
            :options="[3, 5, 10, 20, 30, 40]"
            class="me-2 w-20"
            size="xs"
          />
        </div>

        <div class="flex gap-1.5 items-center">
          <UDropdown
            v-if="selectedRows.length > 1"
            :items="actions"
            :ui="{ width: 'w-36' }"
          >
            <UButton
              icon="i-heroicons-chevron-down"
              trailing
              color="gray"
              size="xs"
            >
              تحديد كـ
            </UButton>
          </UDropdown>

          <USelectMenu
            v-model="selectedColumns"
            :options="excludeSelectColumn"
            multiple
          >
            <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
              الأعمدة
            </UButton>
          </USelectMenu>

          <UButton
            icon="i-heroicons-funnel"
            color="gray"
            size="xs"
            :disabled="search === '' && selectedStatus.length === 0"
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
        :rows="todos"
        :columns="columnsTable"
        :loading="status === 'pending'"
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
        @select="select"
      >
        <template #completed-data="{ row }">
          <UBadge
            size="xs"
            :label="row.completed ? 'مكتمل' : 'قيد التنفيذ'"
            :color="row.completed ? 'emerald' : 'orange'"
            variant="subtle"
          />
        </template>

        <template #actions-data="{ row }">
          <UButton
            v-if="!row.completed"
            icon="i-heroicons-check"
            size="2xs"
            color="emerald"
            variant="outline"
            :ui="{ rounded: 'rounded-full' }"
            square
          />

          <UButton
            v-else
            icon="i-heroicons-arrow-path"
            size="2xs"
            color="orange"
            variant="outline"
            :ui="{ rounded: 'rounded-full' }"
            square
          />
        </template>
      </UTable>

      <!-- Number of rows & Pagination -->
      <template #footer>
        <div
          class="flex flex-wrap justify-between items-center"
          style="font-family: 'Tajwal', sans-serif; direction: rtl"
        >
          <div>
            <span class="text-sm leading-5">
              عرض
              <span class="font-medium">{{ pageFrom }}</span>
              إلى
              <span class="font-medium">{{ pageTo }}</span>
              من
              <span class="font-medium">{{ pageTotal }}</span>
              نتيجة
            </span>
          </div>

          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="pageTotal"
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
</template>

<script lang="ts" setup>
// Columns
const columns = [
  {
    key: "select",
    class: "w-2",
  },
  {
    key: "id",
    label: "#",
    class: "w-16",
    sortable: true,
  },
  {
    key: "name",
    label: "الاسم",
    class: "w-72",
    sortable: true,
  },
  {
    key: "mainDirectory",
    label: "المجلد الرئيسي",
    class: "w-22",
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

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);
const excludeSelectColumn = computed(() =>
  columns.filter((v) => v.key !== "select")
);

// Selected Rows
const selectedRows = ref([]);

function select(row) {
  const index = selectedRows.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}

// Actions
const actions = [
  [
    {
      key: "completed",
      label: "Completed",
      icon: "i-heroicons-check",
    },
  ],
  [
    {
      key: "uncompleted",
      label: "In Progress",
      icon: "i-heroicons-arrow-path",
    },
  ],
];

// Filters
const todoStatus = [
  {
    key: "uncompleted",
    label: "In Progress",
    value: false,
  },
  {
    key: "completed",
    label: "Completed",
    value: true,
  },
];

const search = ref("");
const selectedStatus = ref([]);
const searchStatus = computed(() => {
  if (selectedStatus.value?.length === 0) {
    return "";
  }

  if (selectedStatus?.value?.length > 1) {
    return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`;
  }

  return `?completed=${selectedStatus.value[0].value}`;
});

const resetFilters = () => {
  search.value = "";
  selectedStatus.value = [];
};

// Pagination
const sort = ref({ column: "id", direction: "asc" as const });
const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(200); // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, pageTotal.value)
);

// Replace the fetch data with static data
const todos = ref([
  {
    id: 1,
    name: "Learn Nuxt UI Table",
    mainDirectory: "Development",
    date: "2023-10-01",
    filesCount: 5,
    completed: false,
  },
  {
    id: 2,
    name: "Master Vue.js Components",
    mainDirectory: "Development",
    date: "2023-10-02",
    filesCount: 3,
    completed: true,
  },
]);

// Remove the useLazyAsyncData part and simplify status
const status = ref("success");
</script>
