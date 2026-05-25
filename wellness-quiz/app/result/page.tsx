"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllQuestions, MAX_SCORE } from "@/lib/questions";
import ConfettiEffect from "@/components/ConfettiEffect";

export default function ResultPage() {
  const router = useRouter();
  const questions = getAllQuestions();

  const [session, setSession] = useState<{
    participantId: string;
    store: { id: string; name: string; code: string };
    employeeNumber: string;
    totalScore: number;
    answers: Array<{ questionId: string; selectedOption: string; isCorrect: boolean; score: number }>;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("quizSession");
    if (!raw) { router.replace("/"); return; }
    const s = JSON.parse(raw);
    setSession(s);
    const pct = (s.totalScore / MAX_SCORE) * 100;
    if (pct >= 70) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, []);

  if (!session) return null;

  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const percentage = Math.round((session.totalScore / MAX_SCORE) * 100);

  const getRank = () => {
    if (percentage >= 90) return { label: "🥇 ウエルネスマスター！", color: "text-yellow-600", bg: "from-yellow-400 to-orange-400" };
    if (percentage >= 70) return { label: "🥈 ウエルネスエキスパート", color: "text-gray-600", bg: "from-gray-400 to-gray-500" };
    if (percentage >= 50) return { label: "🥉 ウエルネスアドバイザー", color: "text-amber-700", bg: "from-amber-500 to-amber-600" };
    return { label: "📚 もっと勉強しよう！", color: "text-blue-600", bg: "from-blue-400 to-blue-500" };
  };

  const rank = getRank();

  const handleRetry = () => {
    localStorage.removeItem("quizSession");
    router.push("/");
  };

  return (
    <main className="min-h-screen py-6 px-4">
      <ConfettiEffect trigger={showConfetti} />
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-gray-800 mb-1">クイズ終了！</h1>
          <p className="text-gray-500">{session.store.name}　社員番号：{session.employeeNumber}</p>
        </div>

        {/* Score Card */}
        <div className={`bg-gradient-to-br ${rank.bg} rounded-3xl p-8 text-white text-center shadow-2xl mb-6`}>
          <div className="text-5xl mb-2">{rank.label.split(" ")[0]}</div>
          <div className="text-2xl font-black mb-1">{rank.label.split(" ").slice(1).join(" ")}</div>
          <div className="text-6xl font-black my-4">{session.totalScore}<span className="text-2xl">pt</span></div>
          <div className="text-lg opacity-90">
            {correctCount} / {questions.length} 問正解　({percentage}%)
          </div>
        </div>

        {/* Gauge */}
        <div className="bg-white rounded-2xl p-4 shadow mb-6 border-2 border-gray-100">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>正答率</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0pt</span>
            <span>{MAX_SCORE}pt</span>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-3xl shadow-xl p-5 mb-6 border-2 border-gray-100">
          <h2 className="font-black text-gray-700 mb-4 text-lg">📋 回答まとめ</h2>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const answer = session.answers.find((a) => a.questionId === q.id);
              const isCorrect = answer?.isCorrect ?? false;
              const noAnswer = !answer;
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <span className="text-xl">{noAnswer ? "⌛" : isCorrect ? "✅" : "❌"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-500">Q{i + 1}. </span>
                    <span className="text-xs font-semibold text-gray-700 line-clamp-1">
                      {q.category}
                    </span>
                  </div>
                  <span className={`text-sm font-black shrink-0 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
                    {isCorrect ? `+${q.points}pt` : "0pt"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <a
            href="/ranking"
            target="_blank"
            className="block w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black text-lg rounded-2xl shadow-xl text-center hover:shadow-2xl transition-all hover:scale-105"
          >
            📊 ランキングを確認する
          </a>
          <button
            onClick={handleRetry}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 font-bold text-lg rounded-2xl shadow hover:shadow-md transition-all hover:scale-105"
          >
            🔄 もう一度挑戦する
          </button>
        </div>
      </div>
    </main>
  );
}
