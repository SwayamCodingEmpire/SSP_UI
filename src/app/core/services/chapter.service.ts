import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ChapterProcessingResponse,
  ChapterLanguageProgress,
  SubmitChapterJsonRequest,
} from '../models/chapter.model';

@Injectable({ providedIn: 'root' })
export class ChapterService {
  private http = inject(HttpClient);

  getByProject(projectId: number) {
    return this.http.get<ChapterProcessingResponse[]>(
      API_ENDPOINTS.chapters.listByProject(projectId),
    );
  }

  /** §7 — per-chapter translation progress for one language */
  getTranslationsByLanguage(projectId: number, targetLanguage: string) {
    const params = new HttpParams().set('targetLanguage', targetLanguage);
    return this.http.get<ChapterLanguageProgress[]>(
      API_ENDPOINTS.chapters.translationsByLanguage(projectId), { params },
    );
  }

  getById(chapterId: number) {
    return this.http.get<ChapterProcessingResponse>(
      API_ENDPOINTS.chapters.get(chapterId),
    );
  }

  uploadFile(file: File, projectId: number, chapterNumber: number, title?: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('projectId', String(projectId));
    form.append('chapterNumber', String(chapterNumber));
    if (title) form.append('title', title);
    return this.http.post<ChapterProcessingResponse>(API_ENDPOINTS.chapters.upload, form);
  }

  submitJson(data: SubmitChapterJsonRequest) {
    return this.http.post<ChapterProcessingResponse>(
      API_ENDPOINTS.chapters.processJson, data,
    );
  }

  submitText(
    text: string,
    projectId: number,
    chapterNumber: number,
    title?: string,
  ) {
    let params = new HttpParams()
      .set('projectId', String(projectId))
      .set('chapterNumber', String(chapterNumber));
    if (title) params = params.set('title', title);

    return this.http.post<ChapterProcessingResponse>(
      API_ENDPOINTS.chapters.processText,
      text,
      { params, headers: { 'Content-Type': 'text/plain' } },
    );
  }
}
