import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon        = input<string>('pi pi-inbox');
  readonly title       = input.required<string>();
  readonly description = input<string>('');
}
