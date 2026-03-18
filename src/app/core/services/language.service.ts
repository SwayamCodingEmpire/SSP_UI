import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Language, LANGUAGES } from '../constants/languages.constants';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private http = inject(HttpClient);

  /** Fetch all supported languages from the backend.
   *  Falls back to the static list if the request fails. */
  getAll(script?: string) {
    let params = new HttpParams();
    if (script) params = params.set('script', script);
    return this.http
      .get<Language[]>(API_ENDPOINTS.languages.list, { params })
      .pipe(catchError(() => of(LANGUAGES)));
  }

  /** Fetch a single language by code. */
  getOne(code: string) {
    return this.http
      .get<Language>(API_ENDPOINTS.languages.get(code))
      .pipe(catchError(() => of(null)));
  }

  /** Returns select-friendly options from the live or static language list */
  getOptions() {
    return this.getAll().pipe(
      map(langs => langs.map(l => ({
        label: `${l.englishName} — ${l.nativeName}`,
        code: l.code,
        rtl: l.rtl,
        script: l.script,
      })))
    );
  }
}
