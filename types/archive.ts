export interface FileEntry {
  path: string;
  name: string;
  newName?: string;
  isEditing?: boolean;
}

export interface ArchiveRecord {
  name: string;
  date?: string;
  mainDirectory: string;
  subFolders: string[];
  notes?: string;
  files: FileEntry[];
} 