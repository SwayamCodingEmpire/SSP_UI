import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { ChapterService } from '../../../core/services/chapter.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslationService } from '../../../core/services/translation.service';
import { PageHeader, Breadcrumb } from '../../../shared/components/page-header';
import { SspLoader } from '../../../shared/components/ssp-loader';
import { StatusBadge } from '../../../shared/components/status-badge';
import { LanguagePair } from '../../../shared/components/language-pair';
import { EmptyState } from '../../../shared/components/empty-state';
import { ChapterLanguageProgress } from '../../../core/models/chapter.model';
import { languageDisplayLabel } from '../../../core/constants/languages.constants';

@Component({
  selector: 'app-project-workspace',
  standalone: true,
  imports: [
    RouterLink, DatePipe, FormsModule,
    Select,
    PageHeader, SspLoader, StatusBadge, LanguagePair, EmptyState,
  ],
  templateUrl: './project-workspace.html',
  styleUrl: './project-workspace.scss',
})
export class ProjectWorkspace {
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private chapterService = inject(ChapterService);
  private languageService = inject(LanguageService);
  private translationService = inject(TranslationService);

  readonly id = input.required<string>();
  private readonly numericId = computed(() => Number(this.id()));

  readonly projectResource = rxResource({
    params: () => this.numericId(),
    stream: ({ params: id }) => this.projectService.getById(id),
  });

  readonly chaptersResource = rxResource({
    params: () => this.numericId(),
    stream: ({ params: id }) => this.chapterService.getByProject(id),
  });

  /** Language options from the live API */
  readonly languageOptionsResource = rxResource({
    stream: () => this.languageService.getOptions(),
  });

  readonly languageOptions = computed(() =>
    this.languageOptionsResource.value() ?? []
  );

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: this.projectResource.value()?.title ?? 'Project' },
  ]);

  // ── Language switcher ─────────────────────────────────────
  /** null = show the default coarse chapter list; string = per-language view */
  readonly selectedLanguage = signal<string | null>(null);

  readonly langViewResource = rxResource({
    params: () => {
      const lang = this.selectedLanguage();
      const pid  = this.numericId();
      return lang ? { pid, lang } : undefined;
    },
    stream: ({ params: { pid, lang } }) =>
      this.chapterService.getTranslationsByLanguage(pid, lang).pipe(catchError(() => of([]))),
  });

  readonly langDisplayLabel = languageDisplayLabel;

  // ── Per-language translate action ─────────────────────────
  readonly translatingChapterIds = signal<Set<number>>(new Set());

  async triggerChapterTranslation(chapter: ChapterLanguageProgress) {
    const lang = this.selectedLanguage();
    if (!lang) return;
    this.translatingChapterIds.update(s => new Set([...s, chapter.chapterId]));
    try {
      await firstValueFrom(
        this.translationService.trigger(chapter.chapterId, lang).pipe(catchError(() => of(null)))
      );
      // Refresh the language view to reflect the new PENDING/TRANSLATING status
      this.langViewResource.reload();
    } finally {
      this.translatingChapterIds.update(s => {
        const next = new Set(s);
        next.delete(chapter.chapterId);
        return next;
      });
    }
  }

  isTranslating(chapterId: number) {
    return this.translatingChapterIds().has(chapterId);
  }

  // ── Progress helpers ──────────────────────────────────────
  readonly langViewProgress = computed(() => {
    const items = this.langViewResource.value();
    if (!items?.length) return null;
    const done  = items.filter(c => c.translationStatus && c.translationStatus !== 'PENDING').length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  });

  // ── Delete project ────────────────────────────────────────
  async deleteProject() {
    const p = this.projectResource.value();
    if (!p) return;
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await firstValueFrom(this.projectService.delete(p.id));
    this.router.navigate(['/']);
  }
}
