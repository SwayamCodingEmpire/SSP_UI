import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Select } from 'primeng/select';
import { ProjectService } from '../../core/services/project.service';
import { ChapterService } from '../../core/services/chapter.service';
import { TranslationService } from '../../core/services/translation.service';
import { LanguageService } from '../../core/services/language.service';
import { ChapterSummary } from '../../core/models/chapter.model';
import { AvailableTranslation } from '../../core/models/translation.model';
import { SspLoader } from '../../shared/components/ssp-loader';
import { StatusBadge } from '../../shared/components/status-badge';
import { EmptyState } from '../../shared/components/empty-state';
import { languageDisplayLabel } from '../../core/constants/languages.constants';

export interface ChapterLangRow extends ChapterSummary {
  langStatus: AvailableTranslation | null;
}

@Component({
  selector: 'app-language-browse',
  standalone: true,
  imports: [RouterLink, FormsModule, Select, SspLoader, StatusBadge, EmptyState],
  templateUrl: './language-browse.html',
  styleUrl: './language-browse.scss',
})
export class LanguageBrowse {
  private projectService     = inject(ProjectService);
  private chapterService     = inject(ChapterService);
  private translationService = inject(TranslationService);
  private languageService    = inject(LanguageService);

  readonly selectedProjectId = signal<string>('');
  readonly selectedLanguage  = signal<string>('');

  setProject(id: string) {
    this.selectedProjectId.set(id);
    this.selectedLanguage.set('');
  }

  // ── Resources ────────────────────────────────────────────
  readonly projectsResource = rxResource({
    stream: () => this.projectService.getAll(),
  });

  readonly languageOptionsResource = rxResource({
    stream: () => this.languageService.getOptions(),
  });

  /** Loads chapters then enriches each with its translation status for the selected language */
  readonly chaptersResource = rxResource({
    params: () => {
      const pid  = Number(this.selectedProjectId());
      const lang = this.selectedLanguage();
      return pid > 0 && lang ? { pid, lang } : undefined;
    },
    stream: ({ params: { pid, lang } }) =>
      this.chapterService.getByProject(pid).pipe(
        switchMap(chapters => {
          if (!chapters.length) return of([] as ChapterLangRow[]);
          return forkJoin(
            chapters.map(ch =>
              this.translationService.getLanguages(ch.id).pipe(
                map(langs => ({
                  ...ch,
                  langStatus: langs.find(t => t.targetLanguage === lang) ?? null,
                })),
                catchError(() => of({ ...ch, langStatus: null } as ChapterLangRow)),
              )
            )
          );
        }),
        catchError(() => of([] as ChapterLangRow[])),
      ),
  });

  // ── Derived ──────────────────────────────────────────────
  readonly projectOptions = computed(() =>
    (this.projectsResource.value() ?? []).map(p => ({ label: p.title, value: String(p.id) }))
  );

  readonly languageOptions = computed(() =>
    this.languageOptionsResource.value() ?? []
  );

  readonly selectedProject = computed(() =>
    this.projectsResource.value()?.find(p => String(p.id) === this.selectedProjectId()) ?? null
  );

  readonly langDisplayLabel = languageDisplayLabel;

  readonly progress = computed(() => {
    const items = this.chaptersResource.value();
    if (!items?.length) return null;
    const done = items.filter(c =>
      c.langStatus &&
      c.langStatus.status !== 'PENDING' &&
      c.langStatus.status !== 'TRANSLATING'
    ).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  });
}
