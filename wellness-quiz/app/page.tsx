"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MOCK_STORES = [
  { id: "s01", name: "渋谷本店", code: "shibuya" },
  { id: "s02", name: "新宿北口店", code: "shinjuku" },
  { id: "s03", name: "池袋東口店", code: "ikebukuro" },
  { id: "s04", name: "品川シーサイド店", code: "shinagawa" },
  { id: "s05", name: "横浜みなとみらい店", code: "yokohama" },
  { id: "s06", name: "川崎駅前店", code: "kawasaki" },
  { id: "s07", name: "吉祥寺店", code: "kichijoji" },
  { id: "s08", name: "立川北口店", code: "tachikawa" },
];

export default function LoginPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !employeeNumber.trim()) {
      setError("所属店舗と社員番号を入力してください");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const store = MOCK_STORES.find((s) => s.id === storeId);
      if (!store) throw new Error("店舗が見つかりません");

      // Try Supabase; fall back to localStorage-only mode if not configured
      let participantId: string;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && supabaseUrl !== "https://your-project.supabase.co") {
        const { data, error: dbError } = await supabase
          .from("participants")
          .upsert(
            { store_id: storeId, employee_number: employeeNumber.trim() },
            { onConflict: "store_id,employee_number" }
          )
          .select()
          .single();
        if (dbError) throw dbError;
        participantId = data.id;
      } else {
        participantId = `local_${storeId}_${employeeNumber}_${Date.now()}`;
      }

      localStorage.setItem(
        "quizSession",
        JSON.stringify({
          participantId,
          store,
          employeeNumber: employeeNumber.trim(),
          currentQuestionIndex: 0,
          answers: [],
          totalScore: 0,
        })
      );

      router.push("/quiz");
    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💊</div>
          <h1 className="text-3xl font-black text-green-700 leading-tight">
            ウエルネスアドバイザー
            <br />
            <span className="text-orange-500">特訓クイズ！</span>
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            チーム対抗・リアルタイムランキング
          </p>
          {/* Stars decoration */}
          <div className="flex justify-center gap-1 mt-2 text-yellow-400 text-xl">
            ⭐⭐⭐⭐⭐
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-green-200">
          <h2 className="text-xl font-bold text-center text-gray-700 mb-6">
            🏪 参加登録
          </h2>
          <form onSubmit={handleStart} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                所属店舗
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none bg-green-50 text-gray-700 font-medium text-sm transition-colors"
                required
              >
                <option value="">店舗を選択してください</option>
                {MOCK_STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                社員番号
              </label>
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="例：1234567"
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none bg-orange-50 text-gray-700 font-medium transition-colors"
                required
                maxLength={20}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  登録中...
                </span>
              ) : (
                "🚀 クイズスタート！"
              )}
            </button>
          </form>
        </div>

        {/* Ranking link */}
        <div className="text-center mt-6">
          <a
            href="/ranking"
            target="_blank"
            className="text-sm text-green-600 hover:text-green-800 font-medium underline"
          >
            📊 リアルタイムランキングを表示（スクリーン投影用）
          </a>
        </div>
      </div>
    </main>
  );
}
