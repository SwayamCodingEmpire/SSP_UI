import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, Sidebar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar()  { this.sidebarOpen.set(false); }
}
