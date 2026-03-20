import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ChapterService } from '../../../core/services/chapter.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { TranslationService } from '../../../core/services/translation.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisResult } from '../../../core/models/analysis.model';
import { ChapterTranslationResponse, AvailableTranslation, TranslationProvider } from '../../../core/models/translation.model';
import { isRtlLanguage, languageDisplayLabel } from '../../../core/constants/languages.constants';
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
    RouterLink, FormsModule, UpperCasePipe,
    Button, Tag, Select,
    PageHeader, SspLoader, StatusBadge, AsyncPulse, SegmentProgress, TensionBar,
  ],
  templateUrl: './chapter-workspace.html',
  styleUrl: './chapter-workspace.scss',
})
export class ChapterWorkspace {
  private chapterService = inject(ChapterService);
  private analysisService = inject(AnalysisService);
  private translationService = inject(TranslationService);
  private languageService = inject(LanguageService);
  private projectService = inject(ProjectService);

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

  // ── Language state ───────────────────────────────────────
  /** All languages that have existing translations for this chapter */
  readonly existingLanguages = signal<AvailableTranslation[]>([]);
  /** The currently viewed language tab (code, e.g. "en") */
  readonly activeLanguage = signal<string | null>(null);

  /** Project resource — used to read targetLanguage as the default translation language */
  private readonly numericProjectId = computed(() => Number(this.id()));
  private readonly projectResource = rxResource({
    params: () => this.numericProjectId(),
    stream: ({ params: pid }) => this.projectService.getById(pid),
  });

  /** The language chosen in the new-translation picker.
   *  Defaults to the project's targetLanguage once it loads, then falls back to 'en'. */
  readonly selectedNewLanguage = signal<string>('en');

  readonly languagesResource = rxResource({
    stream: () => this.languageService.getOptions(),
  });

  readonly languageOptions = computed(() =>
    this.languagesResource.value() ?? []
  );

  // ── Translation state ────────────────────────────────────
  /** Per-language translation results, keyed by BCP-47 code */
  readonly translationsByLang = signal<Record<string, ChapterTranslationResponse>>({});
  readonly translationLoading = signal(false);
  readonly translationError = signal('');
  readonly providerOptions = PROVIDER_OPTIONS;
  readonly selectedProvider = signal<TranslationProvider>('openai');

  readonly activeTranslation = computed<ChapterTranslationResponse | null>(() => {
    const lang = this.activeLanguage();
    return lang ? (this.translationsByLang()[lang] ?? null) : null;
  });

  // ── Review / edit state ──────────────────────────────────
  readonly editMode = signal(false);
  readonly editText = signal('');
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly viewMode = signal<'final' | 'ai'>('final');

  readonly reviewState = computed<'pending' | 'accepted' | 'edited' | null>(() => {
    const r = this.activeTranslation();
    if (!r) return null;
    if (r.userAccepted === true) return 'accepted';
    if (r.userAccepted === false && r.userEditedText) return 'edited';
    return 'pending';
  });

  readonly finalText = computed(() => {
    const r = this.activeTranslation();
    return r ? (r.userEditedText ?? r.translatedText) : '';
  });

  readonly displayText = computed(() => {
    const r = this.activeTranslation();
    if (!r) return '';
    if (this.reviewState() === 'edited' && this.viewMode() === 'ai') return r.translatedText;
    return r.userEditedText ?? r.translatedText;
  });

  readonly reviewedAtFormatted = computed(() => {
    const d = this.activeTranslation()?.reviewedAt;
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
    if (this.existingLanguages().length > 0) return 'done';
    if (this.translationError()) return 'failed';
    return 'idle';
  });

  readonly copied = signal(false);
  readonly langPickerOpen = signal(false);

  readonly languageLabel = languageDisplayLabel;
  readonly isRtl = isRtlLanguage;

  readonly activeIsRtl = computed(() => {
    const lang = this.activeLanguage();
    return lang ? isRtlLanguage(lang) : false;
  });

  private analysisInitDone = false;
  private translationInitDone = false;

  constructor() {
    // Apply project's targetLanguage as the default translation language (one-shot)
    effect(() => {
      const project = this.projectResource.value();
      if (project?.targetLanguage && this.selectedNewLanguage() === 'en') {
        this.selectedNewLanguage.set(project.targetLanguage);
      }
    });

    effect(() => {
      const chapter = this.chapterResource.value();
      if (!chapter) return;

      if (!this.analysisInitDone) {
        this.analysisInitDone = true;
        void this.loadAnalysisStatus(chapter.status === 'PARSED' || chapter.status === 'PROCESSED');
      }

      if (!this.translationInitDone) {
        this.translationInitDone = true;
        void this.loadLanguages();
      }
    });

    effect(() => {
      localStorage.setItem(ChapterWorkspace.AUTO_MODE_KEY, String(this.autoMode()));
    });

    // Auto-chain: after analysis done, translate into project's default language if no translations exist
    effect(() => {
      if (
        this.autoMode() &&
        this.analysisResult() &&
        this.existingLanguages().length === 0 &&
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

  hidePanel(id: PanelId) { this.setPanelState(id, 'hidden'); }
  showPanel(id: PanelId) { this.setPanelState(id, 'normal'); }

  // ── Drag-and-drop methods ─────────────────────────────────

  onDragStart(event: DragEvent, id: PanelId) {
    this.dragging.set(id);
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', id);
  }

  onDragEnter(id: PanelId) {
    if (this.dragging() && this.dragging() !== id) this.dragOverPanel.set(id);
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
    if (!sourceId || sourceId === targetId) { this.dragging.set(null); this.dragOverPanel.set(null); return; }
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

  onDragEnd() { this.dragging.set(null); this.dragOverPanel.set(null); }

  // ── Analysis ─────────────────────────────────────────────

  private async loadAnalysisStatus(canTrigger = true) {
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
    } else if (this.autoMode() && canTrigger) {
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
    if (attempt > 60) { this.analysisLoading.set(false); this.analysisError.set('Analysis timed out.'); return; }
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

  // ── Language / Translation ────────────────────────────────

  /** Load all existing language translations from /languages, then load text for active one */
  private async loadLanguages() {
    const cid = this.numericChapterId();
    const translations = await firstValueFrom(
      this.translationService.getLanguages(cid).pipe(catchError(() => of(null))),
    );
    if (translations && translations.length > 0) {
      this.existingLanguages.set(translations);
      // Activate the first (most recent / most advanced) language
      const firstLang = translations[0].targetLanguage;
      this.activeLanguage.set(firstLang);
      await this.loadTranslationText(firstLang);
      // If any are still translating/pending, start polling
      for (const t of translations) {
        if (t.status === 'TRANSLATING' || t.status === 'PENDING') {
          this.translationLoading.set(true);
          this.pollTranslation(cid, t.targetLanguage);
        }
      }
    }
  }

  /** Load the text for a given language tab */
  private async loadTranslationText(lang: string) {
    const cid = this.numericChapterId();
    const text = await firstValueFrom(
      this.translationService.getText(cid, lang).pipe(catchError(() => of(null))),
    );
    if (text) {
      this.translationsByLang.update(map => ({ ...map, [lang]: text }));
    }
  }

  /** Switch the active language tab; lazy-load text if not yet fetched */
  async selectLanguageTab(lang: string) {
    this.activeLanguage.set(lang);
    this.editMode.set(false);
    this.viewMode.set('final');
    if (!this.translationsByLang()[lang]) {
      await this.loadTranslationText(lang);
    }
  }

  /** Start a brand-new translation in a new language */
  async triggerTranslation() {
    const cid = this.numericChapterId();
    const lang = this.selectedNewLanguage();
    this.translationLoading.set(true);
    this.translationError.set('');
    try {
      await firstValueFrom(this.translationService.trigger(cid, lang, this.selectedProvider()));
      // Optimistically add to tabs
      const now = new Date().toISOString();
      this.existingLanguages.update(list => {
        const exists = list.some(t => t.targetLanguage === lang);
        if (exists) return list.map(t => t.targetLanguage === lang ? { ...t, status: 'TRANSLATING' as const } : t);
        return [...list, { targetLanguage: lang, status: 'TRANSLATING' as const, userAccepted: null, updatedAt: now }];
      });
      this.activeLanguage.set(lang);
      this.pollTranslation(cid, lang);
    } catch {
      this.translationError.set('Failed to start translation. Try again.');
      this.translationLoading.set(false);
    }
  }

  private async autoChainTranslation() {
    if (this.existingLanguages().length > 0 || this.translationLoading()) return;
    const cid = this.numericChapterId();
    const defaultLang = this.selectedNewLanguage();
    // Check server to avoid duplicate trigger
    const translations = await firstValueFrom(
      this.translationService.getLanguages(cid).pipe(catchError(() => of(null))),
    );
    if (translations && translations.length > 0) {
      this.existingLanguages.set(translations);
      const firstLang = translations[0].targetLanguage;
      this.activeLanguage.set(firstLang);
      await this.loadTranslationText(firstLang);
      for (const t of translations) {
        if (t.status === 'TRANSLATING' || t.status === 'PENDING') {
          this.translationLoading.set(true);
          this.pollTranslation(cid, t.targetLanguage);
        }
      }
      return;
    }
    // No translations yet — trigger with default language
    await this.triggerTranslation();
    if (!this.activeLanguage()) this.activeLanguage.set(defaultLang);
  }

  private pollTranslation(cid: number, lang: string, attempt = 0) {
    if (attempt > 90) { this.translationLoading.set(false); return; }
    setTimeout(async () => {
      const status = await firstValueFrom(
        this.translationService.getStatus(cid, lang).pipe(catchError(() => of(null))),
      );
      if (status?.status === 'AI_TRANSLATED' || status?.status === 'HUMAN_REVIEWED' || status?.status === 'APPROVED') {
        await this.loadTranslationText(lang);
        this.existingLanguages.update(list =>
          list.map(t => t.targetLanguage === lang ? { ...t, status: status.status } : t)
        );
        this.translationLoading.set(false);
      } else if (status?.status === 'FAILED') {
        this.existingLanguages.update(list =>
          list.map(t => t.targetLanguage === lang ? { ...t, status: 'FAILED' as const } : t)
        );
        this.translationLoading.set(false);
        this.translationError.set('Translation failed. You can retry.');
      } else {
        this.pollTranslation(cid, lang, attempt + 1);
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
    const lang = this.activeLanguage();
    if (!lang) return;
    const cid = this.numericChapterId();
    this.saving.set(true);
    this.saveError.set('');
    try {
      const result = await firstValueFrom(
        this.translationService.save(cid, { targetLanguage: lang, accepted: true }),
      );
      // Merge ReviewResult fields into existing ChapterTranslationResponse
      this.translationsByLang.update(map => ({
        ...map,
        [lang]: {
          ...map[lang],
          translationStatus: result.translationStatus,
          translatedText: result.translatedText,
          userEditedText: result.userEditedText,
          userAccepted: result.userAccepted,
          reviewedAt: new Date().toISOString(),
        },
      }));
      this.existingLanguages.update(list =>
        list.map(t => t.targetLanguage === lang ? { ...t, userAccepted: true } : t)
      );
    } catch {
      this.saveError.set('Failed to save. Try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async submitEdit() {
    const text = this.editText().trim();
    if (!text) return;
    const lang = this.activeLanguage();
    if (!lang) return;
    const cid = this.numericChapterId();
    this.saving.set(true);
    this.saveError.set('');
    try {
      const result = await firstValueFrom(
        this.translationService.save(cid, { targetLanguage: lang, accepted: false, editedText: text }),
      );
      // Merge ReviewResult fields into existing ChapterTranslationResponse
      this.translationsByLang.update(map => ({
        ...map,
        [lang]: {
          ...map[lang],
          translationStatus: result.translationStatus,
          translatedText: result.translatedText,
          userEditedText: result.userEditedText,
          userAccepted: result.userAccepted,
          reviewedAt: new Date().toISOString(),
        },
      }));
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
    const result = this.activeTranslation();
    if (!result) return;
    const blob = new Blob([this.finalText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapter-${result.chapterNumber}-${result.targetLanguage}-translation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
