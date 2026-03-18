import { Component, input, computed } from '@angular/core';

const BADGE_MAP: Record<string, { label: string; cssClass: string; pulse: boolean }> = {
  DRAFT:        { label: 'Draft',        cssClass: 'badge--slate',   pulse: false },
  PARSING:      { label: 'Parsing',      cssClass: 'badge--amber',   pulse: true  },
  IN_PROGRESS:  { label: 'In Progress',  cssClass: 'badge--amber',   pulse: false },
  REVIEW:       { label: 'Review',       cssClass: 'badge--orchid',  pulse: false },
  COMPLETED:    { label: 'Completed',    cssClass: 'badge--sage',    pulse: false },
  ARCHIVED:     { label: 'Archived',     cssClass: 'badge--muted',   pulse: false },
  PENDING:      { label: 'Pending',      cssClass: 'badge--muted',   pulse: false },
  AI_TRANSLATED:{ label: 'AI Translated',cssClass: 'badge--slate',   pulse: false },
  PARSED:       { label: 'Parsed',       cssClass: 'badge--slate',   pulse: false },
  TRANSLATING:  { label: 'Translating',  cssClass: 'badge--amber',   pulse: true  },
  ANALYZING:    { label: 'Analyzing',    cssClass: 'badge--amber',   pulse: true  },
  ANALYZED:     { label: 'Analyzed',     cssClass: 'badge--slate',   pulse: false },
  PARTIAL:      { label: 'Partial',      cssClass: 'badge--orchid',  pulse: false },
  PROTAGONIST:  { label: 'Protagonist',  cssClass: 'badge--amber',   pulse: false },
  ANTAGONIST:   { label: 'Antagonist',   cssClass: 'badge--crimson', pulse: false },
  SUPPORTING:   { label: 'Supporting',   cssClass: 'badge--slate',   pulse: false },
  MINOR:        { label: 'Minor',        cssClass: 'badge--muted',   pulse: false },
  DIALOGUE:     { label: 'Dialogue',     cssClass: 'badge--slate',   pulse: false },
  ACTION:       { label: 'Action',       cssClass: 'badge--amber',   pulse: false },
  BATTLE:       { label: 'Battle',       cssClass: 'badge--crimson', pulse: false },
  INTROSPECTION:{ label: 'Introspection',cssClass: 'badge--orchid',  pulse: false },
  ROMANCE:      { label: 'Romance',      cssClass: 'badge--rose',    pulse: false },
  EXPOSITION:   { label: 'Exposition',   cssClass: 'badge--muted',   pulse: false },
  TRANSITION:   { label: 'Transition',   cssClass: 'badge--muted',   pulse: false },
  PRESENT:      { label: 'Present',      cssClass: 'badge--default', pulse: false },
  FLASHBACK:    { label: 'Flashback',    cssClass: 'badge--sepia',   pulse: false },
  FLASH_FORWARD:{ label: 'Flash-Fwd',   cssClass: 'badge--blue',    pulse: false },
  ALLY:         { label: 'Ally',         cssClass: 'badge--sage',    pulse: false },
  ENEMY:        { label: 'Enemy',        cssClass: 'badge--crimson', pulse: false },
  FAMILY:       { label: 'Family',       cssClass: 'badge--amber',   pulse: false },
  ROMANTIC:     { label: 'Romantic',     cssClass: 'badge--rose',    pulse: false },
  NEUTRAL:      { label: 'Neutral',      cssClass: 'badge--muted',   pulse: false },
  MENTOR:       { label: 'Mentor',       cssClass: 'badge--orchid',  pulse: false },
  RIVAL:        { label: 'Rival',        cssClass: 'badge--slate',   pulse: false },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly size   = input<'sm' | 'md'>('md');

  readonly config = computed(() =>
    BADGE_MAP[this.status()] ?? { label: this.status(), cssClass: 'badge--default', pulse: false }
  );
}
