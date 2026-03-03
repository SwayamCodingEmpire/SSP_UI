import { TranslationStatus } from './chapter.model';

export type TranslationProvider = 'openai' | 'anthropic';

export interface TranslationStatusResponse {
  chapterId: number;
  status: TranslationStatus;
  provider: TranslationProvider;
}

export interface TranslationTextResponse {
  chapterId: number;
  chapterNumber: number;
  title: string;
  translationStatus: TranslationStatus;
  translatedText: string;
  userAccepted: boolean | null;
  userEditedText: string | null;
  reviewedAt: string | null;
  chunked: boolean;
  totalSegments: number | null;
  translatedSegments: number | null;
}

export interface TranslationSaveRequest {
  accepted: boolean;
  editedText?: string;
}
