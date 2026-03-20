export type AnalysisStatus = 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'FAILED';

export interface AnalysisScenePreview {
  type: string;
  summary: string;
  /** 0–10 integer (v2) */
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
