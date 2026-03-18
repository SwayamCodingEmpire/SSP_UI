import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string | any[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private router = inject(Router);

  readonly collapsed = signal(false);

  // Extract projectId from current URL for project-scoped nav
  readonly projectId = computed<number | null>(() => {
    const match = this.router.url.match(/\/projects\/(\d+)/);
    return match ? Number(match[1]) : null;
  });

  readonly mainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large',       route: '/'        },
    { label: 'Projects',  icon: 'pi pi-folder',          route: '/projects' },
    { label: 'Compare',   icon: 'pi pi-objects-column',  route: '/compare'  },
    { label: 'Browse',    icon: 'pi pi-language',        route: '/browse'   },
  ];

  readonly projectNav = computed<NavItem[]>(() => {
    const id = this.projectId();
    if (!id) return [];
    return [
      { label: 'Chapters',   icon: 'pi pi-book',    route: ['/projects', id, 'chapters']   },
      { label: 'Characters', icon: 'pi pi-users',   route: ['/projects', id, 'characters'] },
      { label: 'Scenes',     icon: 'pi pi-list',    route: ['/projects', id, 'scenes']     },
    ];
  });

  toggle() { this.collapsed.update(v => !v); }
}
