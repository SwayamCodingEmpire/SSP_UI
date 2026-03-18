export type ChapterStatus =
  | 'PENDING' | 'PARSING' | 'PARSED' | 'TRANSLATING' | 'COMPLETED';

export type TranslationStatus =
  | 'PENDING' | 'TRANSLATING' | 'COMPLETED' | 'PARTIAL' | 'AI_TRANSLATED';

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

/** One item from GET /api/projects/{id}/chapters/translations?targetLanguage=xx (§7) */
export interface ChapterLanguageProgress {
  chapterId: number;
  chapterNumber: number;
  title: string;
  analysisStatus: string;
  targetLanguage: string;
  translationStatus: TranslationStatus | null;
  userAccepted: boolean | null;
  updatedAt: string | null;
}
