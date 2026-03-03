import { Component, input } from '@angular/core';

// Line widths (%) represent varying text line lengths in a manuscript
const LINE_WIDTHS = [72, 88, 61, 95, 49];

@Component({
  selector: 'app-ssp-loader',
  standalone: true,
  imports: [],
  templateUrl: './ssp-loader.html',
  styleUrl: './ssp-loader.scss',
})
export class SspLoader {
  readonly size     = input<'sm' | 'md' | 'lg'>('md');
  readonly label    = input<string>('');
  readonly fullPage = input(false);

  readonly lines = LINE_WIDTHS;
}
