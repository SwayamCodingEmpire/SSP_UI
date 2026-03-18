// ============================================================
// API Constants — single source of truth for all endpoint URLs
// Change BASE_URL here to switch environments.
// ============================================================

export const BASE_URL = 'http://localhost:8080';
const API = `${BASE_URL}/api`;

export const API_ENDPOINTS = {
  // ── Projects ────────────────────────────────────────────
  projects: {
    list:   `${API}/projects`,
    create: `${API}/projects`,
    get:    (id: number) => `${API}/projects/${id}`,
    update: (id: number) => `${API}/projects/${id}`,
    delete: (id: number) => `${API}/projects/${id}`,
  },

  // ── Chapters ────────────────────────────────────────────
  chapters: {
    listByProject:         (projectId: number) => `${API}/projects/${projectId}/chapters`,
    translationsByLanguage:(projectId: number) => `${API}/projects/${projectId}/chapters/translations`,
    upload:                `${API}/chapters/upload`,
    processJson:           `${API}/chapters/process`,
    processText:           `${API}/chapters/process-text`,
    get:                   (chapterId: number) => `${API}/chapters/${chapterId}`,
  },

  // ── Translation ─────────────────────────────────────────
  translation: {
    trigger:   (chapterId: number) => `${API}/translation/chapters/${chapterId}`,
    status:    (chapterId: number) => `${API}/translation/chapters/${chapterId}`,
    text:      (chapterId: number) => `${API}/translation/chapters/${chapterId}/text`,
    save:      (chapterId: number) => `${API}/translation/chapters/${chapterId}/save`,
    languages: (chapterId: number) => `${API}/translation/chapters/${chapterId}/languages`,
  },

  // ── Analysis ────────────────────────────────────────────
  analysis: {
    trigger: (chapterId: number) => `${API}/analysis/chapters/${chapterId}`,
    status:  (chapterId: number) => `${API}/analysis/chapters/${chapterId}`,
  },

  // ── Narrative Data ──────────────────────────────────────
  characters: {
    list:                (projectId: number) => `${API}/projects/${projectId}/characters`,
    states:              (projectId: number, characterId: number) => `${API}/projects/${projectId}/characters/${characterId}/states`,
    relationships:       (projectId: number) => `${API}/projects/${projectId}/relationships`,
    relationshipHistory: (projectId: number, relationshipId: number) => `${API}/projects/${projectId}/relationships/${relationshipId}/history`,
  },

  scenes: {
    list: (projectId: number) => `${API}/projects/${projectId}/scenes`,
  },

  // ── Languages ────────────────────────────────────────────
  languages: {
    list:   `${API}/languages`,
    get:    (code: string) => `${API}/languages/${code}`,
  },
} as const;
