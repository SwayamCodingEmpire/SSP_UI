import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-segment-progress',
  standalone: true,
  imports: [],
  templateUrl: './segment-progress.html',
  styleUrl: './segment-progress.scss',
})
export class SegmentProgress {
  readonly current = input.required<number>();
  readonly total   = input.required<number>();
  readonly compact = input(false);

  readonly pct = computed(() =>
    this.total() > 0 ? Math.round((this.current() / this.total()) * 100) : 0
  );

  readonly done = computed(() => this.current() >= this.total() && this.total() > 0);
}
