import questionsData from "@/data/questions.json";
import type { Question } from "@/types";

export function getAllQuestions(): Question[] {
  return questionsData.map((q) => ({
    id: q.id,
    orderIndex: q.orderIndex,
    category: q.category,
    scenario: q.scenario,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctOption: q.correctOption as Question["correctOption"],
    explanation: q.explanation,
    productSuggestions: q.productSuggestions,
    lifestyleAdvice: q.lifestyleAdvice,
    points: q.points,
  }));
}

export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find((q) => q.id === id);
}

export const TOTAL_QUESTIONS = questionsData.length;
export const MAX_SCORE = questionsData.reduce((sum, q) => sum + q.points, 0);
