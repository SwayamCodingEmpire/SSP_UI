import { TranslationStatus } from './chapter.model';

export type TranslationProvider = 'openai' | 'anthropic';

export interface TranslationStatusResponse {
  chapterId: number;
  targetLanguage: string;
  status: TranslationStatus;
  provider: TranslationProvider;
}

/** Full translation record — returned by /text and /save */
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

/** Per-language summary item from /languages */
export interface LanguageTranslationSummary {
  targetLanguage: string;
  translationStatus: TranslationStatus;
  userAccepted: boolean | null;
  updatedAt: string;
}

/** Response from GET /api/translation/chapters/{id}/languages */
export interface ChapterLanguagesResponse {
  chapterId: number;
  translations: LanguageTranslationSummary[];
}

export interface TranslationSaveRequest {
  targetLanguage: string;
  accepted: boolean;
  editedText?: string;
}
