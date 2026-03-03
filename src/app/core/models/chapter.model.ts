export type ChapterStatus =
  | 'PENDING' | 'PARSING' | 'PARSED' | 'TRANSLATING' | 'COMPLETED';

export type TranslationStatus =
  | 'PENDING' | 'TRANSLATING' | 'COMPLETED' | 'PARTIAL';

export interface ChapterProcessingResponse {
  chapterId: number;
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
  translationStatus: TranslationStatus | null;
  originalTextPreview: string;
  fullOriginalText: string | null;
}

export interface SubmitChapterJsonRequest {
  projectId: number;
  chapterNumber: number;
  title: string;
  chapterText: string;
}
