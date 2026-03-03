import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { SceneService } from '../../core/services/scene.service';
import { Scene, SceneType, NarrativeTimeType } from '../../core/models/scene.model';
import { SceneCard } from '../../shared/components/scene-card';
import { PageHeader, Breadcrumb } from '../../shared/components/page-header';
import { SspLoader } from '../../shared/components/ssp-loader';
import { EmptyState } from '../../shared/components/empty-state';

type TimeFilter = NarrativeTimeType | 'ALL';
type TypeFilter = SceneType | 'ALL';

@Component({
  selector: 'app-scene-timeline',
  standalone: true,
  imports: [RouterLink, SceneCard, PageHeader, SspLoader, EmptyState],
  templateUrl: './scene-timeline.html',
  styleUrl: './scene-timeline.scss',
})
export class SceneTimeline {
  private sceneService = inject(SceneService);

  readonly id = input.required<string>(); // projectId
  private readonly projectId = computed(() => Number(this.id()));

  readonly scenesResource = rxResource({
    params: () => this.projectId(),
    stream: ({ params: pid }) => this.sceneService.getScenes(pid),
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: 'Project', link: ['/projects', this.id()] },
    { label: 'Scenes' },
  ]);

  readonly timeFilters: { label: string; value: TimeFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Present', value: 'PRESENT' },
    { label: 'Flashback', value: 'FLASHBACK' },
    { label: 'Flash Forward', value: 'FLASH_FORWARD' },
  ];

  readonly typeFilters: { label: string; value: TypeFilter }[] = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Dialogue', value: 'DIALOGUE' },
    { label: 'Action', value: 'ACTION' },
    { label: 'Battle', value: 'BATTLE' },
    { label: 'Introspection', value: 'INTROSPECTION' },
    { label: 'Romance', value: 'ROMANCE' },
    { label: 'Exposition', value: 'EXPOSITION' },
    { label: 'Transition', value: 'TRANSITION' },
  ];

  readonly activeTime = signal<TimeFilter>('ALL');
  readonly activeType = signal<TypeFilter>('ALL');

  readonly filtered = computed<Scene[]>(() => {
    const scenes = this.scenesResource.value() ?? [];
    return scenes
      .filter(s => this.activeTime() === 'ALL' || s.narrativeTimeType === this.activeTime())
      .filter(s => this.activeType() === 'ALL' || s.type === this.activeType());
  });

  setTime(f: TimeFilter) { this.activeTime.set(f); }
  setType(f: TypeFilter) { this.activeType.set(f); }
}
