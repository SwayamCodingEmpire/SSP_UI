import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { SspLoader } from '../../shared/components/ssp-loader';
import { EmptyState } from '../../shared/components/empty-state';
import { ProjectCard } from '../../shared/components/project-card';
import { PageHeader } from '../../shared/components/page-header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SspLoader, EmptyState, ProjectCard, PageHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private router = inject(Router);
  private projectService = inject(ProjectService);

  readonly projectsResource = rxResource({
    stream: () => this.projectService.getAll(),
  });

  readonly deleting = signal(false);

  onEdit(project: Project) {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

  async onDelete(project: Project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    this.deleting.set(true);
    try {
      await firstValueFrom(this.projectService.delete(project.id));
      this.projectsResource.reload();
    } finally {
      this.deleting.set(false);
    }
  }
}
