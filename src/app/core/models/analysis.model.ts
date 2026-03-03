export type AnalysisStatus = 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'FAILED';

export interface AnalysisScenePreview {
  type: string;
  summary: string;
  tensionLevel: number;
}

export interface AnalysisResult {
  chapterId: number;
  status: AnalysisStatus;
  charactersFound: number;
  scenesDetected: number;
  characterNames: string[];
  scenes: AnalysisScenePreview[];
}
