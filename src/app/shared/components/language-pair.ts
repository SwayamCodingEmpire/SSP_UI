import { Component, input, computed } from '@angular/core';

const LANG_NAMES: Record<string, string> = {
  ja: 'JA', en: 'EN', ko: 'KO', zh: 'ZH',
  fr: 'FR', de: 'DE', es: 'ES', pt: 'PT',
  it: 'IT', ru: 'RU', ar: 'AR', vi: 'VI',
};

@Component({
  selector: 'app-language-pair',
  standalone: true,
  imports: [],
  templateUrl: './language-pair.html',
  styleUrl: './language-pair.scss',
})
export class LanguagePair {
  readonly source = input.required<string>();
  readonly target = input<string | null>(null);
  readonly size   = input<'sm' | 'md'>('md');

  readonly srcLabel = computed(() => LANG_NAMES[this.source().toLowerCase()] ?? this.source().toUpperCase());
  readonly tgtLabel = computed(() => {
    const t = this.target();
    return t ? (LANG_NAMES[t.toLowerCase()] ?? t.toUpperCase()) : null;
  });
}
