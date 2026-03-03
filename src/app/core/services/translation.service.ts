import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import { TranslationProvider, TranslationSaveRequest, TranslationStatusResponse, TranslationTextResponse } from '../models/translation.model';
import { PollingService } from './polling.service';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);
  private polling = inject(PollingService);

  trigger(chapterId: number, provider?: TranslationProvider) {
    let params = new HttpParams();
    if (provider) params = params.set('provider', provider);
    return this.http.post<void>(
      API_ENDPOINTS.translation.trigger(chapterId), null, { params }
    );
  }

  getStatus(chapterId: number) {
    return this.http.get<TranslationStatusResponse>(
      API_ENDPOINTS.translation.status(chapterId)
    );
  }

  getText(chapterId: number) {
    return this.http.get<TranslationTextResponse>(
      API_ENDPOINTS.translation.text(chapterId)
    );
  }

  save(chapterId: number, body: TranslationSaveRequest) {
    return this.http.put<void>(API_ENDPOINTS.translation.save(chapterId), body);
  }

  /** Triggers translation then polls until COMPLETED or PARTIAL */
  triggerAndPoll(chapterId: number, provider?: TranslationProvider) {
    return new Promise<void>((resolve, reject) => {
      this.trigger(chapterId, provider).subscribe({
        next: () => resolve(),
        error: reject,
      });
    }).then(() =>
      this.polling.poll(
        () => this.getStatus(chapterId),
        s => s.status === 'COMPLETED' || s.status === 'PARTIAL',
      )
    );
  }
}
