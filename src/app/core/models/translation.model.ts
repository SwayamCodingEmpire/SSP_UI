import { TranslationStatus } from './chapter.model';

export type TranslationProvider = 'openai' | 'anthropic';

export interface TranslationStatusResponse {
  chapterId: number;
  targetLanguage: string;
  status: TranslationStatus;
  provider: TranslationProvider;
}

/** Full translation record — returned by GET /text */
export interface ChapterTranslationResponse {
  id: number;
  chapterId: number;
  chapterNumber: number;
  title: string;
  targetLanguage: string;
  translationStatus: TranslationStatus;
  translatedText: string;
  userEditedText: string | null;
  userAccepted: boolean | null;
  reviewedAt: string | null;
  chunked: boolean;
  totalSegments: number | null;
  translatedSegments: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Leaner response from PUT /save (v2) */
export interface ReviewResult {
  translationId: number;
  chapterId: number;
  targetLanguage: string;
  translationStatus: TranslationStatus;
  translatedText: string;
  userEditedText: string | null;
  userAccepted: boolean | null;
}

/** One item from GET /api/v2/translation/chapters/{id}/languages — flat array */
export interface AvailableTranslation {
  targetLanguage: string;
  /** Plain string status (v2) */
  status: TranslationStatus;
  userAccepted: boolean | null;
  updatedAt: string;
}

export interface TranslationSaveRequest {
  targetLanguage: string;
  accepted: boolean;
  editedText?: string;
}
