import { NoteMode } from './note-modes';

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  mode: NoteMode;
  createdAt: string;
  updatedAt: string;
  customSlug?: string;
  isPublic?: boolean;
  shareToken?: string;
  cloudNoteId?: string;
}

export interface SharedNote {
  id: string;
  title: string;
  content: string;
  token: string;
  customSlug?: string;
  createdAt: string;
}