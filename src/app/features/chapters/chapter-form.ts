import { Component, computed, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ProjectService } from '../../core/services/project.service';
import { ChapterService } from '../../core/services/chapter.service';
import { PageHeader, Breadcrumb } from '../../shared/components/page-header';
import { SspLoader } from '../../shared/components/ssp-loader';

type TabId = 'file' | 'text' | 'json';

@Component({
  selector: 'app-chapter-form',
  standalone: true,
  imports: [FormsModule, InputText, Textarea, PageHeader, SspLoader],
  templateUrl: './chapter-form.html',
  styleUrl: './chapter-form.scss',
})
export class ChapterForm {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private projectService = inject(ProjectService);
  private chapterService = inject(ChapterService);

  readonly id = input.required<string>(); // projectId from route
  private readonly projectId = computed(() => Number(this.id()));

  readonly projectResource = rxResource({
    params: () => this.projectId(),
    stream: ({ params: pid }) => this.projectService.getById(pid),
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Projects', link: '/' },
    {
      label: this.projectResource.value()?.title ?? 'Project',
      link: ['/projects', this.id()],
    },
    { label: 'Add Chapter' },
  ]);

  // Shared fields
  readonly chapterNumber = signal<number>(1);
  readonly chapterTitle = signal('');
  readonly submitting = signal(false);
  readonly error = signal('');

  // Active tab
  readonly activeTab = signal<TabId>('file');
  readonly tabs: { id: TabId; icon: string; label: string }[] = [
    { id: 'file', icon: 'pi-upload', label: 'File Upload' },
    { id: 'text', icon: 'pi-align-left', label: 'Paste Text' },
    { id: 'json', icon: 'pi-code', label: 'JSON' },
  ];

  // File tab
  readonly dragOver = signal(false);
  readonly selectedFile = signal<File | null>(null);

  // Text mode
  readonly chapterText = signal('');

  // JSON mode
  readonly chapterJson = signal('');

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave() { this.dragOver.set(false); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.selectedFile.set(file);
  }

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  clearFile() {
    this.selectedFile.set(null);
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  async uploadFile() {
    const file = this.selectedFile();
    if (!file) { this.error.set('Please select a file.'); return; }

    this.submitting.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        this.chapterService.uploadFile(
          file,
          this.projectId(),
          this.chapterNumber(),
          this.chapterTitle() || undefined,
        ),
      );
      this.router.navigate(['/projects', this.id(), 'chapters', result.chapterId]);
    } catch {
      this.error.set('Upload failed. Check the file format and try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async submitText() {
    const text = this.chapterText().trim();
    if (!text) { this.error.set('Please paste chapter text.'); return; }

    this.submitting.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        this.chapterService.submitText(
          text,
          this.projectId(),
          this.chapterNumber(),
          this.chapterTitle() || undefined,
        ),
      );
      this.router.navigate(['/projects', this.id(), 'chapters', result.chapterId]);
    } catch {
      this.error.set('Submission failed. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async submitJson() {
    const raw = this.chapterJson().trim();
    if (!raw) { this.error.set('Please enter the chapter JSON.'); return; }

    let parsed: { chapterText?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.error.set('Invalid JSON. Please check the format.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        this.chapterService.submitJson({
          projectId: this.projectId(),
          chapterNumber: this.chapterNumber(),
          title: this.chapterTitle() || `Chapter ${this.chapterNumber()}`,
          chapterText: parsed.chapterText ?? raw,
        }),
      );
      this.router.navigate(['/projects', this.id(), 'chapters', result.chapterId]);
    } catch {
      this.error.set('Submission failed. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
