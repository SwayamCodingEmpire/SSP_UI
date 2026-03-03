import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { ProjectService } from '../../core/services/project.service';
import { PageHeader, Breadcrumb } from '../../shared/components/page-header';
import { SspLoader } from '../../shared/components/ssp-loader';

const LANGUAGES = [
  { label: 'Japanese', code: 'ja' },
  { label: 'English', code: 'en' },
  { label: 'Korean', code: 'ko' },
  { label: 'Chinese (Simplified)', code: 'zh-Hans' },
  { label: 'Chinese (Traditional)', code: 'zh-Hant' },
  { label: 'French', code: 'fr' },
  { label: 'German', code: 'de' },
  { label: 'Spanish', code: 'es' },
  { label: 'Portuguese', code: 'pt' },
  { label: 'Italian', code: 'it' },
  { label: 'Russian', code: 'ru' },
  { label: 'Arabic', code: 'ar' },
];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [RouterLink, FormsModule, InputText, Textarea, Select, PageHeader, SspLoader],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  private router = inject(Router);
  private projectService = inject(ProjectService);

  // Route param: present on /projects/:id/edit, absent on /projects/new
  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly languages = LANGUAGES;

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    { label: this.isEditMode() ? 'Edit Project' : 'New Project' },
  ]);

  private readonly numericId = computed(() => {
    const id = this.id();
    return id ? Number(id) : undefined;
  });

  readonly projectResource = rxResource({
    params: () => this.numericId(),
    stream: ({ params: id }) =>
      id !== undefined ? this.projectService.getById(id) : of(null),
  });

  // Form fields
  readonly title = signal('');
  readonly sourceLanguage = signal('ja');
  readonly targetLanguage = signal('en');
  readonly description = signal('');
  readonly translationStyle = signal('');
  readonly saving = signal(false);
  readonly error = signal('');

  constructor() {
    // Populate form when editing an existing project
    effect(() => {
      const p = this.projectResource.value();
      if (p) {
        this.title.set(p.title);
        this.sourceLanguage.set(p.sourceLanguage);
        this.targetLanguage.set(p.targetLanguage);
        this.description.set(p.description);
        this.translationStyle.set(p.translationStyle);
      }
    });
  }

  async save() {
    const body = {
      title: this.title().trim(),
      sourceLanguage: this.sourceLanguage(),
      targetLanguage: this.targetLanguage(),
      description: this.description().trim(),
      translationStyle: this.translationStyle().trim(),
    };

    if (!body.title) {
      this.error.set('Title is required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const id = this.numericId();
      const project = id
        ? await firstValueFrom(this.projectService.update(id, body))
        : await firstValueFrom(this.projectService.create(body));

      this.router.navigate(['/projects', project.id]);
    } catch {
      this.error.set('Failed to save project. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
