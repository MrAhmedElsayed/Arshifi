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
import { onMounted, provide, ref } from 'vue';
import Database from '@tauri-apps/plugin-sql';
import { join } from '@tauri-apps/api/path';
import { appDataDir } from '@tauri-apps/api/path';

const links = [{
  label: 'ادارة البيانات',
  icon: 'i-heroicons-book-open',
  to: '/devices'
}, {
  label: 'المستخدمين',
  icon: 'i-heroicons-rocket-launch',
  to: '/users'
}]

// Create a shared store for mainStoragePath
const mainStoragePath = ref('');
provide('mainStoragePath', mainStoragePath);

// Create database instance
const db = ref<any>(null);
provide('db', db);

async function initDB() {
  try {
    const appDataDirPath = await appDataDir();
    const dbPath = await join(appDataDirPath, 'archive.db');
    db.value = await Database.load(`sqlite:${dbPath}`);
    
    await db.value.execute(`
      DROP TABLE IF EXISTS archived_files;
      DROP TABLE IF EXISTS archive_records;
      
      CREATE TABLE IF NOT EXISTS archive_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT,
        main_directory TEXT NOT NULL,
        sub_folders TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS archived_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        original_path TEXT NOT NULL,
        archived_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(record_id) REFERENCES archive_records(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Load main storage path on init
    const result = await db.value.select(
      'SELECT value FROM settings WHERE key = ?',
      ['mainStoragePath']
    );
    if (result.length > 0) {
      mainStoragePath.value = result[0].value;
    }
    
    console.log('Database initialized at:', dbPath);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

onMounted(() => {
  initDB();
});
</script>