import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AnalysisResult } from '../models/analysis.model';
import { PollingService } from './polling.service';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private http = inject(HttpClient);
  private polling = inject(PollingService);

  trigger(chapterId: number) {
    return this.http.post<void>(API_ENDPOINTS.analysis.trigger(chapterId), null);
  }

  getStatus(chapterId: number) {
    return this.http.get<AnalysisResult>(API_ENDPOINTS.analysis.status(chapterId));
  }

  /** Triggers analysis then polls until ANALYZED */
  triggerAndPoll(chapterId: number) {
    return new Promise<void>((resolve, reject) => {
      this.trigger(chapterId).subscribe({ next: () => resolve(), error: reject });
    }).then(() =>
      this.polling.poll(
        () => this.getStatus(chapterId),
        r => r.status === 'ANALYZED',
      )
    );
  }
}
