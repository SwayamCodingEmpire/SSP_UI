export type ChapterStatus =
  | 'PENDING' | 'PARSING' | 'PARSED' | 'PROCESSED' | 'TRANSLATING' | 'COMPLETED';

export type TranslationStatus =
  | 'PENDING' | 'TRANSLATING' | 'AI_TRANSLATED'
  | 'HUMAN_REVIEWED' | 'APPROVED' | 'FAILED';

/** Returned by GET /api/v2/projects/{id}/chapters */
export interface ChapterSummary {
  id: number;
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
  analysisStatus: string;
  preview: string;
}

/** Returned by POST /api/v2/chapters, /api/v2/chapters/text, /api/v2/chapters/upload
 *  and GET /api/v2/chapters/{id} */
export interface IngestChapterResponse {
  chapterId: number;
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
  analysisStatus: string;
  originalTextPreview: string;
}

export interface SubmitChapterJsonRequest {
  projectId: number;
  chapterNumber: number;
  title: string;
  chapterText: string;
}
