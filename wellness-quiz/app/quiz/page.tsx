"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllQuestions } from "@/lib/questions";
import { supabase } from "@/lib/supabase";
import type { Question, Option } from "@/types";
import ProgressBar from "@/components/ProgressBar";
import ConfettiEffect from "@/components/ConfettiEffect";

const OPTION_LABELS: Record<Option, string> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
};

const OPTION_COLORS: Record<string, string> = {
  a: "from-blue-400 to-blue-500 border-blue-300",
  b: "from-purple-400 to-purple-500 border-purple-300",
  c: "from-orange-400 to-orange-500 border-orange-300",
  d: "from-pink-400 to-pink-500 border-pink-300",
};

const OPTION_CORRECT = "from-green-400 to-green-600 border-green-300 ring-4 ring-green-300";
const OPTION_WRONG = "from-red-400 to-red-500 border-red-300 ring-4 ring-red-300";
const OPTION_DIMMED = "opacity-40 grayscale";

export default function QuizPage() {
  const router = useRouter();
  const questions = getAllQuestions();

  const [session, setSession] = useState<{
    participantId: string;
    store: { id: string; name: string; code: string };
    employeeNumber: string;
    currentQuestionIndex: number;
    answers: Array<{ questionId: string; selectedOption: Option; isCorrect: boolean; score: number }>;
    totalScore: number;
  } | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("quizSession");
    if (!raw) { router.replace("/"); return; }
    const s = JSON.parse(raw);
    setSession(s);
    setQuestion(questions[s.currentQuestionIndex] ?? null);
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || answered) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, answered]);

  const handleTimeUp = useCallback(() => {
    setTimerActive(false);
    setAnswered(true);
  }, []);

  const handleSelect = async (opt: Option) => {
    if (answered || !question || !session) return;
    setTimerActive(false);
    setSelectedOption(opt);
    setAnswered(true);

    const isCorrect = opt === question.correctOption;
    const score = isCorrect ? question.points : 0;

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Persist answer
    const newAnswer = { questionId: question.id, selectedOption: opt, isCorrect, score };
    const updatedAnswers = [...session.answers, newAnswer];
    const updatedScore = session.totalScore + score;
    const updatedSession = { ...session, answers: updatedAnswers, totalScore: updatedScore };

    localStorage.setItem("quizSession", JSON.stringify(updatedSession));
    setSession(updatedSession);

    // Supabase insert (fire-and-forget)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== "https://your-project.supabase.co") {
      supabase.from("answers").upsert({
        participant_id: session.participantId,
        question_id: question.id,
        selected_option: opt,
        is_correct: isCorrect,
        score,
      }, { onConflict: "participant_id,question_id" }).then(() => {
        if (isCorrect) {
          supabase.rpc("update_participant_score", {
            p_participant_id: session.participantId,
            p_score: score,
          }).then(() => {});
        }
      });
    }
  };

  const handleNext = () => {
    if (!session) return;
    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      const finalSession = { ...session, currentQuestionIndex: nextIndex };
      localStorage.setItem("quizSession", JSON.stringify(finalSession));
      router.push("/result");
      return;
    }
    const updatedSession = { ...session, currentQuestionIndex: nextIndex };
    localStorage.setItem("quizSession", JSON.stringify(updatedSession));
    setSession(updatedSession);
    setQuestion(questions[nextIndex]);
    setSelectedOption(null);
    setAnswered(false);
    setShowConfetti(false);
    setTimeLeft(30);
    setTimerActive(true);
  };

  if (!session || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse text-green-600 font-bold">読み込み中...</div>
      </div>
    );
  }

  const currentIndex = session.currentQuestionIndex;
  const options: [Option, string][] = [
    ["a", question.optionA],
    ["b", question.optionB],
    ["c", question.optionC],
    ["d", question.optionD],
  ];

  const timerColor =
    timeLeft > 15 ? "text-green-600" : timeLeft > 8 ? "text-orange-500" : "text-red-500";
  const timerBg =
    timeLeft > 15 ? "bg-green-100" : timeLeft > 8 ? "bg-orange-100" : "bg-red-100";

  return (
    <main className="min-h-screen py-4 px-4">
      <ConfettiEffect trigger={showConfetti} />

      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white rounded-xl px-3 py-2 shadow text-sm font-bold text-gray-600">
            🏪 {session.store.name}
          </div>
          <div className={`rounded-xl px-4 py-2 shadow font-black text-2xl ${timerBg} ${timerColor} transition-colors`}>
            ⏱ {timeLeft}
          </div>
          <div className="bg-orange-100 rounded-xl px-3 py-2 shadow text-sm font-bold text-orange-600">
            🏆 {session.totalScore}pt
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        {/* Category badge */}
        <div className="mb-3 text-center">
          <span className="bg-green-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow">
            📋 {question.category}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-4 border-2 border-green-100">
          {/* Scenario */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-green-200">
            <p className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">📖 ケーススタディ</p>
            <p className="text-gray-700 text-sm leading-relaxed">{question.scenario}</p>
          </div>

          {/* Question */}
          <p className="font-bold text-gray-800 text-base leading-snug">
            Q. {question.questionText}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {options.map(([opt, text]) => {
            let colorClass = `bg-gradient-to-r ${OPTION_COLORS[opt]} border-2`;
            if (answered) {
              if (opt === question.correctOption) colorClass = `bg-gradient-to-r ${OPTION_CORRECT} border-2`;
              else if (opt === selectedOption) colorClass = `bg-gradient-to-r ${OPTION_WRONG} border-2`;
              else colorClass = `bg-gradient-to-r ${OPTION_COLORS[opt]} border-2 ${OPTION_DIMMED}`;
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={answered}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl text-white font-semibold text-sm text-left transition-all duration-200 ${colorClass} ${
                  !answered ? "hover:scale-102 hover:shadow-lg active:scale-98 cursor-pointer" : "cursor-default"
                } shadow-md`}
              >
                <span className="shrink-0 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center font-black text-base">
                  {OPTION_LABELS[opt]}
                </span>
                <span className="leading-snug">{text}</span>
                {answered && opt === question.correctOption && (
                  <span className="ml-auto text-xl shrink-0">✅</span>
                )}
                {answered && opt === selectedOption && opt !== question.correctOption && (
                  <span className="ml-auto text-xl shrink-0">❌</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Result Banner */}
        {answered && (
          <div
            className={`mb-4 p-4 rounded-2xl text-center font-black text-xl shadow-lg animate-bounce-in ${
              selectedOption === question.correctOption
                ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                : selectedOption === null
                ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                : "bg-gradient-to-r from-red-400 to-red-500 text-white"
            }`}
          >
            {selectedOption === question.correctOption ? (
              "🎉 正解！ +" + question.points + "pt"
            ) : selectedOption === null ? (
              "⌛ 時間切れ... 正解は " + OPTION_LABELS[question.correctOption]
            ) : (
              "😢 不正解... 正解は " + OPTION_LABELS[question.correctOption]
            )}
          </div>
        )}

        {/* Explanation Preview (brief) + Next Button */}
        {answered && (
          <div className="animate-slide-up">
            {/* Brief explanation */}
            <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-orange-200 shadow">
              <p className="text-xs font-black text-orange-600 mb-2">💡 解説ポイント</p>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {question.explanation}
              </p>
              <details className="mt-2">
                <summary className="text-xs text-blue-500 cursor-pointer font-bold hover:text-blue-700">
                  もっと詳しく見る ▼
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-black text-blue-700 mb-1.5">🛒 おすすめ商品提案</p>
                    {question.productSuggestions.map((p, i) => (
                      <div key={i} className="mb-1.5">
                        <span className="font-bold text-xs text-gray-800">・{p.name}</span>
                        <p className="text-xs text-gray-600 ml-2">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-black text-green-700 mb-1.5">🌱 生活習慣改善アドバイス</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{question.lifestyleAdvice}</p>
                  </div>
                </div>
              </details>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {currentIndex + 1 >= questions.length ? "🏁 結果を見る！" : "次の問題へ →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
