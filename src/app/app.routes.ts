import { Routes } from '@angular/router';

export const routes: Routes = [
  // Dashboard — project list
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard),
  },

  // Compare workspace
  {
    path: 'compare',
    loadComponent: () =>
      import('./features/compare/compare-workspace').then(m => m.CompareWorkspace),
  },

  // Project create / edit
  {
    path: 'projects/new',
    loadComponent: () =>
      import('./features/projects/project-form').then(m => m.ProjectForm),
  },
  {
    path: 'projects/:id/edit',
    loadComponent: () =>
      import('./features/projects/project-form').then(m => m.ProjectForm),
  },

  // Chapter ingestion (more specific routes before parent)
  {
    path: 'projects/:id/chapters/new',
    loadComponent: () =>
      import('./features/chapters/chapter-form').then(m => m.ChapterForm),
  },
  {
    path: 'projects/:id/chapters/:chapterId',
    loadComponent: () =>
      import('./features/chapters/workspace/chapter-workspace').then(m => m.ChapterWorkspace),
  },

  // Narrative data
  {
    path: 'projects/:id/characters',
    loadComponent: () =>
      import('./features/characters/character-registry').then(m => m.CharacterRegistry),
  },
  {
    path: 'projects/:id/scenes',
    loadComponent: () =>
      import('./features/scenes/scene-timeline').then(m => m.SceneTimeline),
  },

  // Project workspace (must come after more-specific project sub-routes)
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/workspace/project-workspace').then(m => m.ProjectWorkspace),
  },

  { path: '**', redirectTo: '' },
];
