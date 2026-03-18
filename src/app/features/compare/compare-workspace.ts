import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Select } from 'primeng/select';
import { ProjectService } from '../../core/services/project.service';
import { ChapterService } from '../../core/services/chapter.service';
import { TranslationService } from '../../core/services/translation.service';
import { LanguageService } from '../../core/services/language.service';
import { isRtlLanguage } from '../../core/constants/languages.constants';
import { SspLoader } from '../../shared/components/ssp-loader';

type PanelKey = 'source' | 'ai' | 'user';

const PANEL_META: Record<PanelKey, { title: string; icon: string; tag: string }> = {
  source: { title: 'Source Text',  icon: 'pi pi-book',      tag: 'Original'  },
  ai:     { title: 'AI Draft',     icon: 'pi pi-robot',     tag: 'Generated' },
  user:   { title: 'Your Version', icon: 'pi pi-user-edit', tag: 'Revised'   },
};

@Component({
  selector: 'app-compare-workspace',
  standalone: true,
  imports: [FormsModule, Select, SspLoader],
  templateUrl: './compare-workspace.html',
  styleUrl: './compare-workspace.scss',
})
export class CompareWorkspace {
  private projectService     = inject(ProjectService);
  private chapterService     = inject(ChapterService);
  private translationService = inject(TranslationService);
  private languageService    = inject(LanguageService);

  @ViewChild('panelsContainer') panelsContainerRef?: ElementRef<HTMLDivElement>;

  readonly panelMeta = PANEL_META;

  // ── Chapter + language picker ────────────────────────────
  readonly compareProjectId = signal<string>('');
  readonly compareChapterId = signal<string>('');
  readonly compareLanguage  = signal<string>('');

  setProject(id: string) {
    this.compareProjectId.set(id);
    this.compareChapterId.set('');
    this.compareLanguage.set('');
  }

  setChapter(id: string) {
    this.compareChapterId.set(id);
    this.compareLanguage.set(''); // auto-set once languages load
  }

  // ── Resources ───────────────────────────────────────────
  readonly projectsResource = rxResource({
    stream: () => this.projectService.getAll(),
  });

  readonly chaptersResource = rxResource({
    params: () => {
      const id = Number(this.compareProjectId());
      return id > 0 ? id : undefined;
    },
    stream: ({ params: pid }) => this.chapterService.getByProject(pid),
  });

  readonly chapterDataResource = rxResource({
    params: () => {
      const id = Number(this.compareChapterId());
      return id > 0 ? id : undefined;
    },
    stream: ({ params: cid }) => this.chapterService.getById(cid),
  });

  /** Languages that have translations for the selected chapter */
  readonly chapterLanguagesResource = rxResource({
    params: () => {
      const id = Number(this.compareChapterId());
      return id > 0 ? id : undefined;
    },
    stream: ({ params: cid }) =>
      this.translationService.getLanguages(cid).pipe(catchError(() => of(null))),
  });

  /** Auto-select first available language when chapter languages load */
  private readonly _autoSelectLang = effect(() => {
    const langs = this.chapterLanguagesResource.value();
    if (!langs?.translations.length) return;
    if (!this.compareLanguage()) {
      this.compareLanguage.set(langs.translations[0].targetLanguage);
    }
  });

  readonly translationResource = rxResource({
    params: () => {
      const cid  = Number(this.compareChapterId());
      const lang = this.compareLanguage();
      return cid > 0 && lang ? { cid, lang } : undefined;
    },
    stream: ({ params: { cid, lang } }) =>
      this.translationService.getText(cid, lang).pipe(catchError(() => of(null))),
  });

  /** Live language options fetched from the API */
  readonly languageOptionsResource = rxResource({
    stream: () => this.languageService.getOptions(),
  });

  // ── Selector options ────────────────────────────────────
  readonly projectOptions = computed(() =>
    (this.projectsResource.value() ?? []).map(p => ({
      label: p.title,
      value: String(p.id),
    }))
  );

  readonly chapterOptions = computed(() =>
    (this.chaptersResource.value() ?? []).map(c => ({
      label: `Ch. ${c.chapterNumber}${c.title ? ' — ' + c.title : ''}`,
      value: String(c.chapterId),
    }))
  );

  readonly chapterLanguageOptions = computed(() => {
    const langs   = this.chapterLanguagesResource.value();
    const allOpts = this.languageOptionsResource.value() ?? [];
    if (!langs?.translations.length) return [];
    return langs.translations.map(t => {
      const opt = allOpts.find(o => o.code === t.targetLanguage);
      return {
        label: opt ? opt.label : t.targetLanguage.toUpperCase(),
        value: t.targetLanguage,
      };
    });
  });

  readonly hasChapterLanguages = computed(() =>
    (this.chapterLanguagesResource.value()?.translations.length ?? 0) > 0
  );

  // ── Text values ─────────────────────────────────────────
  readonly sourceText = computed(() => {
    const ch = this.chapterDataResource.value();
    return ch?.fullOriginalText ?? ch?.originalTextPreview ?? '';
  });

  readonly aiText = computed(() =>
    this.translationResource.value()?.translatedText ?? ''
  );

  readonly userText = computed(() => {
    const t = this.translationResource.value();
    return t?.userEditedText ?? t?.translatedText ?? '';
  });

  readonly hasUserRevision = computed(() =>
    !!this.translationResource.value()?.userEditedText
  );

  readonly hasTranslation = computed(() =>
    !!this.translationResource.value()
  );

  readonly translationIsRtl = computed(() =>
    isRtlLanguage(this.compareLanguage())
  );

  // ── Panel visibility ────────────────────────────────────
  readonly showSource      = signal(true);
  readonly showAiDraft     = signal(true);
  readonly showUserVersion = signal(true);

  readonly visibleCount = computed(() =>
    [this.showSource(), this.showAiDraft(), this.showUserVersion()].filter(Boolean).length
  );

  togglePanel(key: PanelKey) {
    const vis = {
      source: this.showSource(),
      ai:     this.showAiDraft(),
      user:   this.showUserVersion(),
    };
    const next = { ...vis, [key]: !vis[key] };
    if (!Object.values(next).some(Boolean)) return;

    if (key === 'source') this.showSource.set(next.source);
    else if (key === 'ai') this.showAiDraft.set(next.ai);
    else this.showUserVersion.set(next.user);

    const visKeys = (['source', 'ai', 'user'] as PanelKey[]).filter(k => next[k]);
    const w = 100 / visKeys.length;
    this.panelWeights.update(prev => {
      const u = { ...prev };
      visKeys.forEach(k => (u[k] = w));
      return u;
    });
  }

  // ── Drag-resize ─────────────────────────────────────────
  readonly panelWeights = signal<Record<PanelKey, number>>({
    source: 33.33, ai: 33.34, user: 33.33,
  });

  readonly effW = computed(() => {
    const w = this.panelWeights();
    const visible: PanelKey[] = [];
    if (this.showSource())      visible.push('source');
    if (this.showAiDraft())     visible.push('ai');
    if (this.showUserVersion()) visible.push('user');
    const total = visible.reduce((s, k) => s + w[k], 0);
    if (!total) return { source: 0, ai: 0, user: 0 };
    return {
      source: this.showSource()      ? (w.source / total) * 100 : 0,
      ai:     this.showAiDraft()     ? (w.ai     / total) * 100 : 0,
      user:   this.showUserVersion() ? (w.user   / total) * 100 : 0,
    };
  });

  nextAfterSource(): PanelKey {
    return this.showAiDraft() ? 'ai' : 'user';
  }

  readonly isResizing = signal(false);

  private _res: {
    left: PanelKey; right: PanelKey;
    startX: number; startLeft: number; startRight: number;
  } | null = null;

  private readonly _boundMove = this._onMove.bind(this);
  private readonly _boundUp   = this._onUp.bind(this);

  startResize(left: PanelKey, right: PanelKey, event: MouseEvent) {
    event.preventDefault();
    const w = this.panelWeights();
    this._res = { left, right, startX: event.clientX, startLeft: w[left], startRight: w[right] };
    this.isResizing.set(true);
    document.addEventListener('mousemove', this._boundMove);
    document.addEventListener('mouseup',   this._boundUp);
  }

  private _onMove(e: MouseEvent) {
    if (!this._res) return;
    const container = this.panelsContainerRef?.nativeElement;
    if (!container) return;
    const { left, right, startX, startLeft, startRight } = this._res;
    const deltaPct = ((e.clientX - startX) / container.offsetWidth) * 100;
    const combined = startLeft + startRight;
    const newLeft  = Math.max(10, Math.min(combined - 10, startLeft + deltaPct));
    this.panelWeights.update(w => ({ ...w, [left]: newLeft, [right]: combined - newLeft }));
  }

  private _onUp() {
    this._res = null;
    this.isResizing.set(false);
    document.removeEventListener('mousemove', this._boundMove);
    document.removeEventListener('mouseup',   this._boundUp);
  }
}
