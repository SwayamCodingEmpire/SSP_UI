import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Scene } from '../models/scene.model';

@Injectable({ providedIn: 'root' })
export class SceneService {
  private http = inject(HttpClient);

  getScenes(projectId: number) {
    return this.http.get<Scene[]>(API_ENDPOINTS.scenes.list(projectId));
  }
}
