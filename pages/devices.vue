<template>
  <div>
    <button @click="openFileDialog" class="p-2 border text-lg m-3 rounded-md">List Desktop Directories</button>
    <div v-if="directories.length > 0" class="m-3">
      <h3 class="text-lg font-bold mb-2">Desktop Directories:</h3>
      <ul class="list-disc pl-5">
        <li v-for="dir in directories" :key="dir" class="mb-1">{{ dir }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { readDir } from '@tauri-apps/plugin-fs';
import { desktopDir } from '@tauri-apps/api/path';
import { ref } from 'vue';

const directories = ref<string[]>([]);

async function openFileDialog() {
  try {
    const desktopPath = await desktopDir();
    const entries = await readDir(desktopPath);
    
    // Filter and store only directory names
    directories.value = entries
      .filter(entry => entry.isDirectory)
      .map(entry => entry.name ?? 'Unnamed Directory');
      
    console.log('Directories listed successfully!');
  } catch (error) {
    console.error('Error listing directories:' + error);
    directories.value = [];
  }
}
</script>
