import { defineStore } from 'pinia'
import { Store } from '@tauri-apps/plugin-store'

let store: Store | null = null;

export const useStorageStore = defineStore('storage', {
  state: () => ({
    mainStoragePath: '',
    isLoading: true
  }),

  actions: {
    async setMainStoragePath(path: string) {
      try {
        if (!store) {
          store = await Store.load('.settings.dat');
        }
        await store.set('mainStoragePath', path);
        await store.save();
        this.mainStoragePath = path;
      } catch (error) {
        console.error('Error saving path:', error);
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    async initialize() {
      this.isLoading = true;
      try {
        store = await Store.load('.settings.dat');
        const path = await store.get('mainStoragePath');
        this.mainStoragePath = path as string || '';
      } catch (error) {
        console.error('Error loading mainStoragePath:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}) 