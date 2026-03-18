import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  TranslationProvider,
  TranslationSaveRequest,
  TranslationStatusResponse,
  ChapterTranslationResponse,
  ChapterLanguagesResponse,
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
    return this.http.put<ChapterTranslationResponse>(
      API_ENDPOINTS.translation.save(chapterId), body
    );
  }

  getLanguages(chapterId: number) {
    return this.http.get<ChapterLanguagesResponse>(
      API_ENDPOINTS.translation.languages(chapterId)
    );
  }

  /** Triggers translation then polls until COMPLETED or PARTIAL */
  triggerAndPoll(chapterId: number, targetLanguage: string, provider?: TranslationProvider) {
    return new Promise<void>((resolve, reject) => {
      this.trigger(chapterId, targetLanguage, provider).subscribe({
        next: () => resolve(),
        error: reject,
      });
    }).then(() =>
      this.polling.poll(
        () => this.getStatus(chapterId, targetLanguage),
        s => s.status === 'COMPLETED' || s.status === 'PARTIAL' || s.status === 'AI_TRANSLATED',
      )
    );
  }
}
