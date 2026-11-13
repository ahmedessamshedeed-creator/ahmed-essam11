export type GameModeId = 'mcq' | 'tf' | 'bubbles' | 'shooting' | 'genius' | 'map';

export type PlayStyle = 'solo' | 'duel';

export type ContinentId = 'north-america' | 'south-america' | 'australia' | 'antarctica';

export interface GameModeMeta {
  id: GameModeId;
  title: string;
  subtitle: string;
  duelLabel: string;
  questionCount: number;
}

export interface ChoiceQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface TfQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  correction: string;
}

export interface MapQuestion {
  id: string;
  continent: ContinentId;
  question: string;
  markerX: number; // percentage 0..100
  markerY: number; // percentage 0..100
  featureLabel: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface MistakeRecord {
  question: string;
  chosenAnswer: string;
  correctAnswer: string;
  note?: string;
}

export interface ContinentLessonInfo {
  id: ContinentId;
  name: string;
  areaNote: string;
  astronomical: string;
  borders: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
  mountains: string[];
  plateaus: string[];
  plainsAndRivers: string[];
  keyFact: string;
}

export type UnifiedDuelQuestion =
  | {
      kind: 'choice';
      id: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      correctLabel: string;
    }
  | {
      kind: 'tf';
      id: string;
      prompt: string;
      options: ['صح ✓', 'خطأ ✗'];
      correctIndex: 0 | 1;
      correctLabel: string;
    }
  | {
      kind: 'map';
      id: string;
      continent: ContinentId;
      markerX: number;
      markerY: number;
      featureLabel: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      correctLabel: string;
    };
