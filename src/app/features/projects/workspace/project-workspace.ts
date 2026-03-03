import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { ChapterService } from '../../../core/services/chapter.service';
import { PageHeader, Breadcrumb } from '../../../shared/components/page-header';
import { SspLoader } from '../../../shared/components/ssp-loader';
import { StatusBadge } from '../../../shared/components/status-badge';
import { LanguagePair } from '../../../shared/components/language-pair';
import { EmptyState } from '../../../shared/components/empty-state';

@Component({
  selector: 'app-project-workspace',
  standalone: true,
  imports: [RouterLink, DatePipe, PageHeader, SspLoader, StatusBadge, LanguagePair, EmptyState],
  templateUrl: './project-workspace.html',
  styleUrl: './project-workspace.scss',
})
export class ProjectWorkspace {
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private chapterService = inject(ChapterService);

  readonly id = input.required<string>();
  private readonly numericId = computed(() => Number(this.id()));

  readonly projectResource = rxResource({
    params: () => this.numericId(),
    stream: ({ params: id }) => this.projectService.getById(id),
  });

  readonly chaptersResource = rxResource({
    params: () => this.numericId(),
    stream: ({ params: id }) => this.chapterService.getByProject(id),
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: this.projectResource.value()?.title ?? 'Project' },
  ]);

  async deleteProject() {
    const p = this.projectResource.value();
    if (!p) return;
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await firstValueFrom(this.projectService.delete(p.id));
    this.router.navigate(['/']);
  }
}
