import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  TranslationProvider,
  TranslationSaveRequest,
  TranslationStatusResponse,
  ChapterTranslationResponse,
  ReviewResult,
  AvailableTranslation,
} from '../models/translation.model';
import { PollingService } from './polling.service';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);
  private polling = inject(PollingService);

  trigger(chapterId: number, targetLanguage: string, provider?: TranslationProvider) {
    let params = new HttpParams().set('targetLanguage', targetLanguage);
    if (provider) params = params.set('provider', provider);
    return this.http.post<void>(
      API_ENDPOINTS.translation.trigger(chapterId), null, { params }
    );
  }

  getStatus(chapterId: number, targetLanguage: string) {
    const params = new HttpParams().set('targetLanguage', targetLanguage);
    return this.http.get<TranslationStatusResponse>(
      API_ENDPOINTS.translation.status(chapterId), { params }
    );
  }

  getText(chapterId: number, targetLanguage: string) {
    const params = new HttpParams().set('targetLanguage', targetLanguage);
    return this.http.get<ChapterTranslationResponse>(
      API_ENDPOINTS.translation.text(chapterId), { params }
    );
  }

  save(chapterId: number, body: TranslationSaveRequest) {
    return this.http.put<ReviewResult>(
      API_ENDPOINTS.translation.save(chapterId), body
    );
  }

  /** Returns a flat array of available translations for a chapter */
  getLanguages(chapterId: number) {
    return this.http.get<AvailableTranslation[]>(
      API_ENDPOINTS.translation.languages(chapterId)
    );
  }

  /** Triggers translation then polls until AI_TRANSLATED, HUMAN_REVIEWED, APPROVED, or FAILED */
  triggerAndPoll(chapterId: number, targetLanguage: string, provider?: TranslationProvider) {
    return new Promise<void>((resolve, reject) => {
      this.trigger(chapterId, targetLanguage, provider).subscribe({
        next: () => resolve(),
        error: reject,
      });
    }).then(() =>
      this.polling.poll(
        () => this.getStatus(chapterId, targetLanguage),
        s => s.status === 'AI_TRANSLATED' || s.status === 'HUMAN_REVIEWED' || s.status === 'APPROVED' || s.status === 'FAILED',
      )
    );
  }
}
