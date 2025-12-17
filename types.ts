export interface CaseScenario {
  id: string;
  title: string;
  difficulty: 'Novice' | 'Detective' | 'Inspecteur';
  context: string; // The setup of the mystery
  brokenText: string; // The French text with errors
  errors: Array<{
    original: string;
    type: string;
    hint: string;
  }>;
}

export interface Submission {
  originalSegment: string;
  correction: string;
  explanation: string;
}

export interface AnalysisResult {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  detectedErrorType?: string;
  grammarLesson?: string;
  clueFound: boolean;
}

export interface PlayerStats {
  casesSolved: number;
  score: number;
  weaknesses: Record<string, number>; // Error type -> frequency
  strengths: Record<string, number>;
}