import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../models/project.model';

// Services are thin HTTP wrappers returning Observables.
// Components own reactive state via rxResource / toSignal.
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Project[]>(API_ENDPOINTS.projects.list);
  }

  getById(id: number) {
    return this.http.get<Project>(API_ENDPOINTS.projects.get(id));
  }

  create(body: CreateProjectRequest) {
    return this.http.post<Project>(API_ENDPOINTS.projects.create, body);
  }

  update(id: number, body: UpdateProjectRequest) {
    return this.http.put<Project>(API_ENDPOINTS.projects.update(id), body);
  }

  delete(id: number) {
    return this.http.delete<void>(API_ENDPOINTS.projects.delete(id));
  }
}
