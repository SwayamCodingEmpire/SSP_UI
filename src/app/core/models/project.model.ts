export type ProjectStatus =
  | 'DRAFT' | 'PARSING' | 'IN_PROGRESS'
  | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';

export type FileFormat = 'PDF' | 'EPUB' | 'DOCX' | 'TXT';

export interface Project {
  id: number;
  title: string;
  sourceLanguage: string;
  targetLanguage: string | null;
  status: ProjectStatus;
  description: string;
  originalFileName: string | null;
  fileFormat: FileFormat | null;
  translationStyle: string;
  chapterCount: number;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  sourceLanguage: string;
  targetLanguage?: string;
  description: string;
  translationStyle: string;
}

export type UpdateProjectRequest = CreateProjectRequest;
