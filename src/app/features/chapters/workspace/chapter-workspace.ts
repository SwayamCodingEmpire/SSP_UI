import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, catchError, of } from 'rxjs';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ChapterService } from '../../../core/services/chapter.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { TranslationService } from '../../../core/services/translation.service';
import { AnalysisResult } from '../../../core/models/analysis.model';
import { TranslationTextResponse, TranslationProvider } from '../../../core/models/translation.model';
import { PageHeader, Breadcrumb } from '../../../shared/components/page-header';
import { SspLoader } from '../../../shared/components/ssp-loader';
import { StatusBadge } from '../../../shared/components/status-badge';
import { AsyncPulse } from '../../../shared/components/async-pulse';
import { SegmentProgress } from '../../../shared/components/segment-progress';
import { TensionBar } from '../../../shared/components/tension-bar';

const PROVIDER_OPTIONS: { label: string; value: TranslationProvider }[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
];

@Component({
  selector: 'app-chapter-workspace',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    SelectButton,
    PageHeader, SspLoader, StatusBadge, AsyncPulse, SegmentProgress, TensionBar,
  ],
  templateUrl: './chapter-workspace.html',
  styleUrl: './chapter-workspace.scss',
})
export class ChapterWorkspace {
  private chapterService = inject(ChapterService);
  private analysisService = inject(AnalysisService);
  private translationService = inject(TranslationService);

  readonly id = input.required<string>();            // projectId
  readonly chapterId = input.required<string>();     // chapterId

  private readonly numericChapterId = computed(() => Number(this.chapterId()));

  readonly chapterResource = rxResource({
    params: () => this.numericChapterId(),
    stream: ({ params: cid }) => this.chapterService.getById(cid),
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: 'Project', link: ['/projects', this.id()] },
    { label: this.chapterResource.value()?.title ?? `Chapter ${this.chapterResource.value()?.chapterNumber ?? ''}` },
  ]);

  // Analysis state
  readonly analysisResult = signal<AnalysisResult | null>(null);
  readonly analysisLoading = signal(false);
  readonly analysisError = signal('');
  readonly analysisOpen = signal(true);

  // Translation state
  readonly translationResult = signal<TranslationTextResponse | null>(null);
  readonly translationLoading = signal(false);
  readonly translationError = signal('');
  readonly providerOptions = PROVIDER_OPTIONS;
  readonly selectedProvider = signal<TranslationProvider>('openai');

  // Review / edit state
  readonly editMode = signal(false);
  readonly editText = signal('');
  readonly saving = signal(false);
  readonly saveError = signal('');

  // When in 'edited' state: which version is the user viewing?
  readonly viewMode = signal<'final' | 'ai'>('final');

  readonly reviewState = computed<'pending' | 'accepted' | 'edited' | null>(() => {
    const r = this.translationResult();
    if (!r) return null;
    if (r.userAccepted === true) return 'accepted';
    if (r.userAccepted === false && r.userEditedText) return 'edited';
    return 'pending';
  });

  // Canonical text for copy/download: edited version wins, else AI text
  readonly finalText = computed(() => {
    const r = this.translationResult();
    return r ? (r.userEditedText ?? r.translatedText) : '';
  });

  // Text shown in the read-only panel body (respects viewMode toggle)
  readonly displayText = computed(() => {
    const r = this.translationResult();
    if (!r) return '';
    if (this.reviewState() === 'edited' && this.viewMode() === 'ai') {
      return r.translatedText;
    }
    return r.userEditedText ?? r.translatedText;
  });

  readonly reviewedAtFormatted = computed(() => {
    const d = this.translationResult()?.reviewedAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  });

  // Copy state
  readonly copied = signal(false);

  // Ensure we only initialise once per chapter load
  private analysisInitDone = false;
  private translationInitDone = false;

  constructor() {
    // Wait for chapter data to arrive, then kick off status checks
    effect(() => {
      const chapter = this.chapterResource.value();
      if (!chapter) return;

      if (!this.analysisInitDone) {
        this.analysisInitDone = true;
        // Only run analysis flow when the chapter is fully parsed
        if (chapter.status === 'PARSED') {
          void this.loadAnalysisStatus();
        }
      }

      if (!this.translationInitDone) {
        this.translationInitDone = true;
        void this.loadTranslationStatus();
      }
    });
  }

  // ── Analysis ────────────────────────────────────────────

  private async loadAnalysisStatus() {
    const cid = this.numericChapterId();
    const result = await firstValueFrom(
      this.analysisService.getStatus(cid).pipe(catchError(() => of(null))),
    );

    if (result?.status === 'ANALYZED') {
      this.analysisResult.set(result);
    } else if (result?.status === 'ANALYZING') {
      this.analysisLoading.set(true);
      this.pollAnalysis(cid);
    } else if (result?.status === 'FAILED') {
      this.analysisError.set('Analysis failed.');
    } else {
      // PENDING or no record — auto-trigger
      this.analysisLoading.set(true);
      try {
        await firstValueFrom(this.analysisService.trigger(cid));
        this.pollAnalysis(cid);
      } catch {
        this.analysisLoading.set(false);
        this.analysisError.set('Failed to start analysis.');
      }
    }
  }

  private pollAnalysis(cid: number, attempt = 0) {
    if (attempt > 60) {
      this.analysisLoading.set(false);
      this.analysisError.set('Analysis timed out.');
      return;
    }
    setTimeout(async () => {
      const result = await firstValueFrom(
        this.analysisService.getStatus(cid).pipe(catchError(() => of(null))),
      );
      if (result?.status === 'ANALYZED') {
        this.analysisResult.set(result);
        this.analysisLoading.set(false);
      } else if (result?.status === 'FAILED') {
        this.analysisLoading.set(false);
        this.analysisError.set('Analysis failed.');
      } else {
        this.pollAnalysis(cid, attempt + 1);
      }
    }, 4000);
  }

  async retryAnalysis() {
    const cid = this.numericChapterId();
    this.analysisError.set('');
    this.analysisLoading.set(true);
    try {
      await firstValueFrom(this.analysisService.trigger(cid));
      this.pollAnalysis(cid);
    } catch {
      this.analysisLoading.set(false);
      this.analysisError.set('Failed to start analysis.');
    }
  }

  // ── Translation ─────────────────────────────────────────

  private async loadTranslationStatus() {
    const cid = this.numericChapterId();
    const status = await firstValueFrom(
      this.translationService.getStatus(cid).pipe(catchError(() => of(null))),
    );
    if (status?.status === 'COMPLETED' || status?.status === 'PARTIAL') {
      const text = await firstValueFrom(
        this.translationService.getText(cid).pipe(catchError(() => of(null))),
      );
      if (text) this.translationResult.set(text);
    } else if (status?.status === 'TRANSLATING') {
      this.translationLoading.set(true);
      this.pollTranslation(cid);
    }
  }

  async triggerTranslation() {
    const cid = this.numericChapterId();
    this.translationLoading.set(true);
    this.translationError.set('');
    try {
      await firstValueFrom(this.translationService.trigger(cid, this.selectedProvider()));
      this.pollTranslation(cid);
    } catch {
      this.translationError.set('Failed to start translation. Try again.');
      this.translationLoading.set(false);
    }
  }

  private pollTranslation(cid: number, attempt = 0) {
    if (attempt > 90) {
      this.translationLoading.set(false);
      return;
    }
    setTimeout(async () => {
      const status = await firstValueFrom(
        this.translationService.getStatus(cid).pipe(catchError(() => of(null))),
      );
      if (status?.status === 'COMPLETED' || status?.status === 'PARTIAL') {
        const text = await firstValueFrom(
          this.translationService.getText(cid).pipe(catchError(() => of(null))),
        );
        if (text) this.translationResult.set(text);
        this.translationLoading.set(false);
      } else {
        this.pollTranslation(cid, attempt + 1);
      }
    }, 4000);
  }

  // ── Review / edit ────────────────────────────────────────

  startEditing() {
    this.editText.set(this.finalText());
    this.saveError.set('');
    this.viewMode.set('final');
    this.editMode.set(true);
  }

  cancelEditing() {
    this.editMode.set(false);
    this.viewMode.set('final');
    this.saveError.set('');
  }

  async acceptTranslation() {
    const cid = this.numericChapterId();
    this.saving.set(true);
    this.saveError.set('');
    try {
      await firstValueFrom(this.translationService.save(cid, { accepted: true }));
      const current = this.translationResult()!;
      this.translationResult.set({ ...current, userAccepted: true, userEditedText: null });
    } catch {
      this.saveError.set('Failed to save. Try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async submitEdit() {
    const text = this.editText().trim();
    if (!text) return;
    const cid = this.numericChapterId();
    this.saving.set(true);
    this.saveError.set('');
    try {
      await firstValueFrom(
        this.translationService.save(cid, { accepted: false, editedText: text }),
      );
      const current = this.translationResult()!;
      this.translationResult.set({ ...current, userAccepted: false, userEditedText: text });
      this.editMode.set(false);
    } catch {
      this.saveError.set('Failed to save. Try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // ── Utilities ───────────────────────────────────────────

  async copyTranslation() {
    const text = this.finalText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  downloadTranslation() {
    const result = this.translationResult();
    if (!result) return;
    const blob = new Blob([this.finalText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapter-${result.chapterNumber}-translation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}