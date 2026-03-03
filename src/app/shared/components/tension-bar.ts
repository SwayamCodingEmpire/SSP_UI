import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-tension-bar',
  standalone: true,
  imports: [],
  templateUrl: './tension-bar.html',
  styleUrl: './tension-bar.scss',
})
export class TensionBar {
  readonly level      = input.required<number>();  // 0.0 – 1.0
  readonly showLabel  = input(false);
  readonly compact    = input(false);

  readonly colorClass = computed(() => {
    const l = this.level();
    if (l >= 0.7) return 'bar--crimson';
    if (l >= 0.4) return 'bar--amber';
    return 'bar--sage';
  });

  readonly pct = computed(() => Math.round(this.level() * 100));
}
