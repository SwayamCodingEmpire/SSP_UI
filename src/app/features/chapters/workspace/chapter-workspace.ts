import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, catchError, of } from 'rxjs';
import { SelectButton } from 'primeng/selectbutton';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
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

export type PanelId = 'source' | 'analysis' | 'translation';
export type PanelState = 'normal' | 'minimized' | 'expanded' | 'hidden';

export const PANEL_META: Record<PanelId, { icon: string; num: string; label: string; colorClass: string }> = {
  source:      { icon: 'pi-file-edit', num: '01', label: 'Source',      colorClass: 'stage-panel--source' },
  analysis:    { icon: 'pi-search',    num: '02', label: 'Analysis',    colorClass: 'stage-panel--analysis' },
  translation: { icon: 'pi-language',  num: '03', label: 'Translation', colorClass: 'stage-panel--translation' },
};

const PROVIDER_OPTIONS: { label: string; value: TranslationProvider }[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
];

@Component({
  selector: 'app-chapter-workspace',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    SelectButton, Button, Tag,
    PageHeader, SspLoader, StatusBadge, AsyncPulse, SegmentProgress, TensionBar,
  ],
  templateUrl: './chapter-workspace.html',
  styleUrl: './chapter-workspace.scss',
})
export class ChapterWorkspace {
  private chapterService = inject(ChapterService);
  private analysisService = inject(AnalysisService);
  private translationService = inject(TranslationService);

  readonly id = input.required<string>();
  readonly chapterId = input.required<string>();

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

  // ── Pipeline mode ────────────────────────────────────────
  private static readonly AUTO_MODE_KEY = 'ssp_pipeline_auto_mode';
  readonly autoMode = signal<boolean>(
    localStorage.getItem(ChapterWorkspace.AUTO_MODE_KEY) !== 'false',
  );

  // ── Panel layout ─────────────────────────────────────────
  readonly panelMeta = PANEL_META;
  readonly panelOrder = signal<PanelId[]>(['source', 'analysis', 'translation']);
  readonly panelStates = signal<Record<PanelId, PanelState>>({
    source: 'normal', analysis: 'normal', translation: 'normal',
  });

  readonly visiblePanels = computed(() =>
    this.panelOrder().filter(id => this.panelStates()[id] !== 'hidden'),
  );

  readonly hiddenPanels = computed(() =>
    this.panelOrder().filter(id => this.panelStates()[id] === 'hidden'),
  );

  // ── Drag-and-drop state ───────────────────────────────────
  readonly dragging = signal<PanelId | null>(null);
  readonly dragOverPanel = signal<PanelId | null>(null);

  // ── Analysis state ───────────────────────────────────────
  readonly analysisResult = signal<AnalysisResult | null>(null);
  readonly analysisLoading = signal(false);
  readonly analysisError = signal('');

  // ── Translation state ────────────────────────────────────
  readonly translationResult = signal<TranslationTextResponse | null>(null);
  readonly translationLoading = signal(false);
  readonly translationError = signal('');
  readonly providerOptions = PROVIDER_OPTIONS;
  readonly selectedProvider = signal<TranslationProvider>('openai');

  // ── Review / edit state ──────────────────────────────────
  readonly editMode = signal(false);
  readonly editText = signal('');
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly viewMode = signal<'final' | 'ai'>('final');

  readonly reviewState = computed<'pending' | 'accepted' | 'edited' | null>(() => {
    const r = this.translationResult();
    if (!r) return null;
    if (r.userAccepted === true) return 'accepted';
    if (r.userAccepted === false && r.userEditedText) return 'edited';
    return 'pending';
  });

  readonly finalText = computed(() => {
    const r = this.translationResult();
    return r ? (r.userEditedText ?? r.translatedText) : '';
  });

  readonly displayText = computed(() => {
    const r = this.translationResult();
    if (!r) return '';
    if (this.reviewState() === 'edited' && this.viewMode() === 'ai') return r.translatedText;
    return r.userEditedText ?? r.translatedText;
  });

  readonly reviewedAtFormatted = computed(() => {
    const d = this.translationResult()?.reviewedAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  // ── Pipeline stage statuses ───────────────────────────────
  readonly analysisStageStatus = computed<'idle' | 'running' | 'done' | 'failed'>(() => {
    if (this.analysisLoading()) return 'running';
    if (this.analysisResult()) return 'done';
    if (this.analysisError()) return 'failed';
    return 'idle';
  });

  readonly translationStageStatus = computed<'idle' | 'running' | 'done' | 'failed'>(() => {
    if (this.translationLoading()) return 'running';
    if (this.translationResult()) return 'done';
    if (this.translationError()) return 'failed';
    return 'idle';
  });

  readonly copied = signal(false);

  private analysisInitDone = false;
  private translationInitDone = false;

  constructor() {
    effect(() => {
      const chapter = this.chapterResource.value();
      if (!chapter) return;

      if (!this.analysisInitDone) {
        this.analysisInitDone = true;
        // Always load — chapter may already be analyzed regardless of current status.
        // Only allow auto-triggering when the chapter text is ready (PARSED).
        void this.loadAnalysisStatus(chapter.status === 'PARSED');
      }

      if (!this.translationInitDone) {
        this.translationInitDone = true;
        void this.loadTranslationStatus();
      }
    });

    // Persist pipeline mode preference across sessions
    effect(() => {
      localStorage.setItem(ChapterWorkspace.AUTO_MODE_KEY, String(this.autoMode()));
    });

    // Auto-chain when switching to auto mode with analysis already done
    effect(() => {
      if (
        this.autoMode() &&
        this.analysisResult() &&
        !this.translationResult() &&
        !this.translationLoading()
      ) {
        void this.autoChainTranslation();
      }
    });
  }

  // ── Panel layout methods ──────────────────────────────────

  setPanelState(id: PanelId, state: PanelState) {
    this.panelStates.update(s => ({ ...s, [id]: state }));
  }

  toggleMinimize(id: PanelId) {
    const current = this.panelStates()[id];
    this.setPanelState(id, current === 'minimized' ? 'normal' : 'minimized');
  }

  toggleExpand(id: PanelId) {
    const current = this.panelStates()[id];
    this.setPanelState(id, current === 'expanded' ? 'normal' : 'expanded');
  }

  hidePanel(id: PanelId) {
    this.setPanelState(id, 'hidden');
  }

  showPanel(id: PanelId) {
    this.setPanelState(id, 'normal');
  }

  // ── Drag-and-drop methods ─────────────────────────────────

  onDragStart(event: DragEvent, id: PanelId) {
    this.dragging.set(id);
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', id);
  }

  onDragEnter(id: PanelId) {
    if (this.dragging() && this.dragging() !== id) {
      this.dragOverPanel.set(id);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave(event: DragEvent, id: PanelId) {
    const panel = event.currentTarget as HTMLElement;
    if (!panel.contains(event.relatedTarget as Node)) {
      if (this.dragOverPanel() === id) this.dragOverPanel.set(null);
    }
  }

  onDrop(event: DragEvent, targetId: PanelId) {
    event.preventDefault();
    const sourceId = this.dragging();
    if (!sourceId || sourceId === targetId) {
      this.dragging.set(null);
      this.dragOverPanel.set(null);
      return;
    }
    this.panelOrder.update(order => {
      const arr = [...order];
      const fromIdx = arr.indexOf(sourceId);
      const toIdx = arr.indexOf(targetId);
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, sourceId);
      return arr;
    });
    this.dragging.set(null);
    this.dragOverPanel.set(null);
  }

  onDragEnd() {
    this.dragging.set(null);
    this.dragOverPanel.set(null);
  }

  // ── Analysis ─────────────────────────────────────────────

  private async loadAnalysisStatus(canTrigger = true) {
    const cid = this.numericChapterId();
    const result = await firstValueFrom(
      this.analysisService.getStatus(cid).pipe(catchError(() => of(null))),
    );

    if (result?.status === 'ANALYZED') {
      this.analysisResult.set(result);
      if (this.autoMode()) void this.autoChainTranslation();
    } else if (result?.status === 'ANALYZING') {
      this.analysisLoading.set(true);
      this.pollAnalysis(cid);
    } else if (result?.status === 'FAILED') {
      this.analysisError.set('Analysis failed.');
    } else {
      // PENDING or no record — only trigger when chapter text is ready
      if (this.autoMode() && canTrigger) {
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
        if (this.autoMode()) void this.autoChainTranslation();
      } else if (result?.status === 'FAILED') {
        this.analysisLoading.set(false);
        this.analysisError.set('Analysis failed.');
      } else {
        this.pollAnalysis(cid, attempt + 1);
      }
    }, 4000);
  }

  async runAnalysis() {
    const cid = this.numericChapterId();
    this.analysisError.set('');
    this.analysisResult.set(null);
    this.analysisLoading.set(true);
    try {
      await firstValueFrom(this.analysisService.trigger(cid));
      this.pollAnalysis(cid);
    } catch {
      this.analysisLoading.set(false);
      this.analysisError.set('Failed to start analysis.');
    }
  }

  // ── Translation ──────────────────────────────────────────

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

  private async autoChainTranslation() {
    if (this.translationResult() || this.translationLoading()) return;

    // Always check the server status first — concurrent calls from loadAnalysisStatus()
    // and loadTranslationStatus() can race, so never rely solely on local signal state.
    const cid = this.numericChapterId();
    const status = await firstValueFrom(
      this.translationService.getStatus(cid).pipe(catchError(() => of(null))),
    );

    if (status?.status === 'COMPLETED' || status?.status === 'PARTIAL') {
      // Already translated — load the text, do NOT re-trigger
      const text = await firstValueFrom(
        this.translationService.getText(cid).pipe(catchError(() => of(null))),
      );
      if (text) this.translationResult.set(text);
      return;
    }

    if (status?.status === 'TRANSLATING') {
      this.translationLoading.set(true);
      this.pollTranslation(cid);
      return;
    }

    // Not translated yet — safe to trigger
    await this.triggerTranslation();
  }

  private pollTranslation(cid: number, attempt = 0) {
    if (attempt > 90) { this.translationLoading.set(false); return; }
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

  // ── Utilities ────────────────────────────────────────────

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
