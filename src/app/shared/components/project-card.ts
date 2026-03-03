import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Project } from '../../core/models/project.model';
import { StatusBadge } from './status-badge';
import { LanguagePair } from './language-pair';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, DatePipe, StatusBadge, LanguagePair],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project      = input.required<Project>();
  readonly editRequest  = output<Project>();
  readonly deleteRequest = output<Project>();

  onEdit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.editRequest.emit(this.project());
  }

  onDelete(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.deleteRequest.emit(this.project());
  }
}
