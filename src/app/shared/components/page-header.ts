import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  link?: string | any[];
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly title       = input.required<string>();
  readonly subtitle    = input<string>('');
  readonly breadcrumbs = input<Breadcrumb[]>([]);
}
