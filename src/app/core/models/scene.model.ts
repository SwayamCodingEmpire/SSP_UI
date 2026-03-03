export type SceneType =
  | 'DIALOGUE' | 'ACTION' | 'BATTLE' | 'INTROSPECTION'
  | 'ROMANCE' | 'EXPOSITION' | 'TRANSITION';

export type EmotionalTone =
  | 'SERIOUS' | 'HUMOROUS' | 'MELANCHOLIC'
  | 'TRIUMPHANT' | 'MYSTERIOUS' | 'TENSE';

export type NarrativePace = 'SLOW' | 'MODERATE' | 'FAST' | 'FRANTIC';

export type NarrativeTimeType = 'PRESENT' | 'FLASHBACK' | 'FLASH_FORWARD';

export interface Scene {
  id: number;
  projectId: number;
  summary: string;
  type: SceneType;
  location: string;
  tensionLevel: number;
  pace: NarrativePace;
  tone: EmotionalTone;
  narrativeTimeType: NarrativeTimeType;
  flashbackToChapter: number | null;
  chapterIds: number[];
  createdAt: string;
}
