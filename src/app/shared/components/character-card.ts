import { Component, input, computed } from '@angular/core';
import { Character } from '../../core/models/character.model';
import { StatusBadge } from './status-badge';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [StatusBadge],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
})
export class CharacterCard {
  readonly character = input.required<Character>();

  readonly traitsArray = computed(() =>
    this.character().personalityTraits
      ?.split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 4) ?? []
  );

  readonly hasAliases = computed(() => this.character().aliases?.length > 0);
}
