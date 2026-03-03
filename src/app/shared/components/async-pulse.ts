import { Component, input } from '@angular/core';

@Component({
  selector: 'app-async-pulse',
  standalone: true,
  imports: [],
  templateUrl: './async-pulse.html',
  styleUrl: './async-pulse.scss',
})
export class AsyncPulse {
  /** Whether the operation is currently running */
  readonly active  = input.required<boolean>();
  readonly variant = input<'amber' | 'sage' | 'crimson'>('amber');
  readonly label   = input<string>('');
}
