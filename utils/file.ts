import { open } from '@tauri-apps/plugin-shell';

export async function openFileLocation(path: string) {
  try {
    await open(path);
  } catch (error) {
    console.error('Error opening file:', error);
  }
} 