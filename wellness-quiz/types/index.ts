export type Option = "a" | "b" | "c" | "d";

export interface ProductSuggestion {
  name: string;
  reason: string;
}

export interface Question {
  id: string;
  orderIndex: number;
  category: string;
  scenario: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: Option;
  explanation: string;
  productSuggestions: ProductSuggestion[];
  lifestyleAdvice: string;
  points: number;
}

export interface Store {
  id: string;
  name: string;
  code: string;
}

export interface Participant {
  id: string;
  storeId: string;
  employeeNumber: string;
  totalScore: number;
  questionsAnswered: number;
}

export interface Answer {
  id: string;
  participantId: string;
  questionId: string;
  selectedOption: Option;
  isCorrect: boolean;
  score: number;
  answeredAt: string;
}

export interface StoreRanking {
  storeId: string;
  storeName: string;
  storeCode: string;
  participantCount: number;
  avgScore: number;
  totalScore: number;
}

export interface QuizSession {
  participant: Participant;
  store: Store;
  currentQuestionIndex: number;
  answers: Answer[];
  totalScore: number;
}
