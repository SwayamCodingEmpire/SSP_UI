export type CharacterRole = 'PROTAGONIST' | 'ANTAGONIST' | 'SUPPORTING' | 'MINOR';

export type RelationshipType =
  | 'ALLY' | 'ENEMY' | 'FAMILY' | 'ROMANTIC'
  | 'NEUTRAL' | 'MENTOR' | 'RIVAL';

export interface Character {
  id: number;
  projectId: number;
  name: string;
  translatedName: string;
  aliases: string[];
  description: string;
  personalityTraits: string;
  role: CharacterRole;
  voiceExample: string;
  firstAppearanceChapter: number;
  createdAt: string;
  updatedAt: string;
}

export type DialogueEmotionType =
  | 'HAPPY' | 'SAD' | 'ANGRY' | 'FEARFUL' | 'SURPRISED'
  | 'DISGUSTED' | 'NEUTRAL' | 'CONTEMPLATIVE' | 'MELANCHOLY'
  | 'DETERMINED' | 'ANXIOUS';

export interface CharacterState {
  id: number;
  characterId: number;
  chapterNumber: number;
  emotionalState: string | null;
  physicalState: string | null;
  currentGoal: string | null;
  arcStage: string | null;
  affiliation: string | null;
  loyalty: string | null;
  dialogueEmotionType: DialogueEmotionType | null;
  dialogueEmotionIntensity: number | null;
  dialogueSummary: string | null;
  createdAt: string;
}

export interface RelationshipHistory {
  id: number;
  relationshipId: number;
  chapterNumber: number;
  type: RelationshipType;
  description: string;
  affinity: number;
  dynamicsNote: string | null;
  createdAt: string;
}

export interface Relationship {
  id: number;
  character1Id: number;
  character1Name: string;
  character2Id: number;
  character2Name: string;
  type: RelationshipType;
  description: string;
  affinity: number;
  establishedAtChapter: number;
  createdAt: string;
}
