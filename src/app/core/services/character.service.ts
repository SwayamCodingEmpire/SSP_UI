import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Character, CharacterState, Relationship, RelationshipHistory } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);

  getCharacters(projectId: number) {
    return this.http.get<Character[]>(API_ENDPOINTS.characters.list(projectId));
  }

  getStates(projectId: number, characterId: number) {
    return this.http.get<CharacterState[]>(
      API_ENDPOINTS.characters.states(projectId, characterId),
    );
  }

  getRelationships(projectId: number) {
    return this.http.get<Relationship[]>(API_ENDPOINTS.characters.relationships(projectId));
  }

  getRelationshipHistory(projectId: number, relationshipId: number) {
    return this.http.get<RelationshipHistory[]>(
      API_ENDPOINTS.characters.relationshipHistory(projectId, relationshipId),
    );
  }
}
