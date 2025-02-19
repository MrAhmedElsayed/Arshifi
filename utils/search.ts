import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';

export interface SearchableRecord {
  id: number;
  name: string;
  date?: string;
  mainDirectory: string;
  subFolders: string[];
  notes?: string;
  files: {
    id: number;
    name: string;
    path: string;
  }[];
}

export interface SearchResult {
  mainDirectory: string;
  count: number;
  items: {
    type: 'file' | 'folder' | 'note';
    name: string;
    path?: string;
    content?: string;
    recordId: number;
    fileId?: number;
  }[];
}

export const fuseOptions = {
  keys: [
    'name',
    'mainDirectory',
    'subFolders',
    'notes',
    'files.name'
  ],
  threshold: 0.4,
  includeMatches: true
};

interface FuseMatch {
  key: string;
  refIndex?: number;
}

export async function searchRecords(records: SearchableRecord[], query: string): Promise<SearchResult[]> {
  const fuse = new Fuse(records, fuseOptions);
  const results = fuse.search(query);

  // Group results by main directory
  const groupedResults = new Map<string, SearchResult>();

  results.forEach(({ item, matches }: FuseResult<SearchableRecord>) => {
    let directory = groupedResults.get(item.mainDirectory);
    if (!directory) {
      directory = {
        mainDirectory: item.mainDirectory,
        count: 0,
        items: []
      };
      groupedResults.set(item.mainDirectory, directory);
    }

    // Add matching files
    matches?.forEach(match => {
      if (match.key === 'files.name') {
        const fileIndex = match.refIndex;
        const file = item.files[fileIndex!];
        directory!.items.push({
          type: 'file',
          name: file.name,
          path: file.path,
          recordId: item.id,
          fileId: file.id
        });
        directory!.count++;
      }
    });

    // Add matching folders
    if (matches?.some(m => m.key === 'subFolders')) {
      item.subFolders.forEach(folder => {
        if (folder.toLowerCase().includes(query.toLowerCase())) {
          directory!.items.push({
            type: 'folder',
            name: folder,
            recordId: item.id
          });
          directory!.count++;
        }
      });
    }

    // Add matching notes
    if (item.notes && matches?.some(m => m.key === 'notes')) {
      directory!.items.push({
        type: 'note',
        name: 'ملاحظات',
        content: item.notes,
        recordId: item.id
      });
      directory!.count++;
    }
  });

  return Array.from(groupedResults.values());
} 