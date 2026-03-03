import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CharacterService } from '../../core/services/character.service';
import {
  Character, CharacterRole, RelationshipType,
} from '../../core/models/character.model';
import { CharacterCard } from '../../shared/components/character-card';
import { PageHeader, Breadcrumb } from '../../shared/components/page-header';
import { SspLoader } from '../../shared/components/ssp-loader';
import { EmptyState } from '../../shared/components/empty-state';

type RoleFilter = CharacterRole | 'ALL';

const ROLE_FILTERS: { label: string; value: RoleFilter }[] = [
  { label: 'All',          value: 'ALL'         },
  { label: 'Protagonists', value: 'PROTAGONIST'  },
  { label: 'Antagonists',  value: 'ANTAGONIST'   },
  { label: 'Supporting',   value: 'SUPPORTING'   },
  { label: 'Minor',        value: 'MINOR'        },
];

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  ALLY: 'Ally', ENEMY: 'Enemy', FAMILY: 'Family',
  ROMANTIC: 'Romantic', NEUTRAL: 'Neutral', MENTOR: 'Mentor', RIVAL: 'Rival',
};

const EMOTION_COLORS: Record<string, string> = {
  HAPPY:         'var(--amber)',
  DETERMINED:    'var(--amber)',
  MELANCHOLY:    'var(--slate-blue)',
  SAD:           'var(--slate-blue)',
  CONTEMPLATIVE: 'var(--sage)',
  NEUTRAL:       'var(--mist)',
  ANGRY:         'var(--crimson)',
  FEARFUL:       '#9b7fd4',
  ANXIOUS:       '#c4783a',
  SURPRISED:     '#5ec4c4',
  DISGUSTED:     '#8fa05a',
};

const REL_TYPE_COLORS: Record<RelationshipType, string> = {
  ALLY:     '#5a9e6f',
  ENEMY:    '#c2524a',
  FAMILY:   '#d4a44c',
  ROMANTIC: '#e879a0',
  NEUTRAL:  '#6b7280',
  MENTOR:   '#5b7fa6',
  RIVAL:    '#d4843a',
};

@Component({
  selector: 'app-character-registry',
  standalone: true,
  imports: [RouterLink, CharacterCard, PageHeader, SspLoader, EmptyState],
  templateUrl: './character-registry.html',
  styleUrl: './character-registry.scss',
})
export class CharacterRegistry {
  private characterService = inject(CharacterService);

  readonly id = input.required<string>();
  private readonly projectId = computed(() => Number(this.id()));

  // ── Characters ─────────────────────────────────────────
  readonly charactersResource = rxResource({
    params: () => this.projectId(),
    stream: ({ params: pid }) => this.characterService.getCharacters(pid),
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: 'Project', link: ['/projects', this.id()] },
    { label: 'Characters' },
  ]);

  readonly roleFilters = ROLE_FILTERS;
  readonly activeFilter = signal<RoleFilter>('ALL');

  readonly filtered = computed(() => {
    const chars = this.charactersResource.value() ?? [];
    const f = this.activeFilter();
    return f === 'ALL' ? chars : chars.filter(c => c.role === f);
  });

  // ── Character arc selection ─────────────────────────────
  readonly selectedCharacterId = signal<number | null>(null);

  readonly selectedCharacter = computed<Character | null>(() =>
    this.charactersResource.value()?.find(c => c.id === this.selectedCharacterId()) ?? null,
  );

  readonly characterStatesResource = rxResource({
    params: () => this.selectedCharacterId() ?? undefined,
    stream: ({ params: cid }) =>
      this.characterService.getStates(this.projectId(), cid),
  });

  selectCharacter(id: number) {
    this.selectedCharacterId.set(this.selectedCharacterId() === id ? null : id);
  }

  emotionColor(type: string | null): string {
    return type ? (EMOTION_COLORS[type] ?? 'var(--mist)') : 'var(--mist)';
  }

  intensityPct(v: number | null): number {
    return v !== null ? Math.round(v * 100) : 0;
  }

  // ── Relationships ───────────────────────────────────────
  readonly relationshipsResource = rxResource({
    params: () => this.projectId(),
    stream: ({ params: pid }) => this.characterService.getRelationships(pid),
  });

  readonly relationshipLabels = RELATIONSHIP_LABELS;
  readonly Math = Math;

  // ── Relationship history ────────────────────────────────
  readonly expandedRelId = signal<number | null>(null);

  readonly relHistoryResource = rxResource({
    params: () => this.expandedRelId() ?? undefined,
    stream: ({ params: rid }) =>
      this.characterService.getRelationshipHistory(this.projectId(), rid),
  });

  readonly relAffinityChart = computed(() => {
    const history = this.relHistoryResource.value();
    if (!history?.length) return null;

    const W = 300, H = 72, PX = 14, PY = 10;
    const iW = W - PX * 2, iH = H - PY * 2;

    const chapters = history.map(h => h.chapterNumber);
    const minCh = chapters[0], maxCh = chapters[chapters.length - 1];
    const chRange = maxCh - minCh || 1;

    // Detect scale: -1..1 or 0..100
    const maxAbs = Math.max(...history.map(h => Math.abs(h.affinity)));
    const scale  = maxAbs <= 1.0 ? 1.0 : 100.0;

    const toX = (ch: number)  => PX + ((ch - minCh) / chRange) * iW;
    const toY = (aff: number) => PY + iH / 2 - (aff / scale) * (iH / 2 - 2);
    const zeroY = toY(0);

    const pts = history.map(h => ({
      x:            toX(h.chapterNumber),
      y:            toY(h.affinity),
      color:        REL_TYPE_COLORS[h.type] ?? '#6b7280',
      chapterNumber: h.chapterNumber,
      affinity:     h.affinity,
      type:         h.type,
      description:  h.description,
      dynamicsNote: h.dynamicsNote,
    }));

    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    return { W, H, zeroY, pts, polyline };
  });

  toggleRelHistory(relId: number) {
    this.expandedRelId.set(this.expandedRelId() === relId ? null : relId);
  }

  relTypeColor(type: RelationshipType): string {
    return REL_TYPE_COLORS[type] ?? '#6b7280';
  }

  setFilter(filter: RoleFilter) { this.activeFilter.set(filter); }
}