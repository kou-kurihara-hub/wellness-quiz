"use client";

import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface StoreRanking {
  store_id: string;
  store_name: string;
  store_code: string;
  participant_count: number;
  avg_score: number;
  total_score: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const BAR_COLORS = [
  "#FFD700", "#C0C0C0", "#CD7F32",
  "#4CAF50", "#FF9800", "#2196F3", "#E91E63", "#9C27B0",
];

// Mock data for demo (used when Supabase is not configured)
const MOCK_DATA: StoreRanking[] = [
  { store_id: "s01", store_name: "渋谷本店", store_code: "shibuya", participant_count: 14, avg_score: 820, total_score: 11480 },
  { store_id: "s02", store_name: "新宿北口店", store_code: "shinjuku", participant_count: 12, avg_score: 790, total_score: 9480 },
  { store_id: "s03", store_name: "池袋東口店", store_code: "ikebukuro", participant_count: 11, avg_score: 750, total_score: 8250 },
  { store_id: "s04", store_name: "品川シーサイド店", store_code: "shinagawa", participant_count: 10, avg_score: 720, total_score: 7200 },
  { store_id: "s05", store_name: "横浜みなとみらい店", store_code: "yokohama", participant_count: 13, avg_score: 680, total_score: 8840 },
  { store_id: "s06", store_name: "川崎駅前店", store_code: "kawasaki", participant_count: 9, avg_score: 640, total_score: 5760 },
  { store_id: "s07", store_name: "吉祥寺店", store_code: "kichijoji", participant_count: 11, avg_score: 600, total_score: 6600 },
  { store_id: "s08", store_name: "立川北口店", store_code: "tachikawa", participant_count: 10, avg_score: 550, total_score: 5500 },
];

function useIsMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url === "https://your-project.supabase.co";
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<StoreRanking[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set());
  const prevRankingsRef = useRef<StoreRanking[]>([]);
  const isMock = useIsMockMode();

  const fetchRankings = async () => {
    if (isMock) {
      // Simulate slight random variation in demo mode
      const varied = MOCK_DATA.map((s) => ({
        ...s,
        avg_score: s.avg_score + Math.floor(Math.random() * 20 - 10),
      })).sort((a, b) => b.avg_score - a.avg_score);
      updateRankings(varied);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("store_rankings")
        .select("*")
        .order("avg_score", { ascending: false });
      if (error) throw error;
      updateRankings(data ?? []);
    } catch (e) {
      console.error("Ranking fetch error:", e);
    }
  };

  const updateRankings = (newData: StoreRanking[]) => {
    const prev = prevRankingsRef.current;
    const changed = new Set<string>();
    newData.forEach((r, i) => {
      const prevIdx = prev.findIndex((p) => p.store_id === r.store_id);
      if (prevIdx !== i || (prev[prevIdx] && prev[prevIdx].avg_score !== r.avg_score)) {
        changed.add(r.store_id);
      }
    });
    if (changed.size > 0) {
      setPulseIds(changed);
      setTimeout(() => setPulseIds(new Set()), 1500);
    }
    prevRankingsRef.current = newData;
    setRankings(newData);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchRankings();

    if (isMock) {
      const interval = setInterval(fetchRankings, 5000);
      return () => clearInterval(interval);
    }

    // Supabase realtime
    const channel = supabase
      .channel("ranking-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "answers" }, () => {
        fetchRankings();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalParticipants = rankings.reduce((s, r) => s + r.participant_count, 0);
  const maxScore = rankings[0]?.avg_score ?? 1000;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: StoreRanking }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 shadow-xl text-sm">
        <p className="font-black text-gray-800 mb-1">{d.store_name}</p>
        <p className="text-green-600 font-bold">平均: {Math.round(d.avg_score)}pt</p>
        <p className="text-gray-500">{d.participant_count}名参加</p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white p-4 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-4xl">🏆</span>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-orange-300">
            リアルタイムランキング
          </h1>
          <span className="text-4xl">🏆</span>
        </div>
        <p className="text-green-300 text-sm">ウエルネスアドバイザー特訓クイズ　店舗対抗戦</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
          <span>参加者合計: <strong className="text-white">{totalParticipants}名</strong></span>
          <span>最終更新: <strong className="text-white">{lastUpdated.toLocaleTimeString("ja-JP")}</strong></span>
          {isMock && <span className="bg-yellow-600/40 text-yellow-300 px-2 py-0.5 rounded-full">デモモード</span>}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white/5 backdrop-blur rounded-3xl p-4 mb-6 border border-white/10">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={rankings}
            margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="store_name"
              tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: "bold" }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              domain={[0, Math.ceil(maxScore / 100) * 100 + 100]}
              tickFormatter={(v) => `${v}pt`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avg_score" radius={[10, 10, 0, 0]} animationDuration={600}>
              {rankings.map((entry, index) => (
                <Cell
                  key={entry.store_id}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  opacity={pulseIds.has(entry.store_id) ? 1 : 0.85}
                  style={
                    pulseIds.has(entry.store_id)
                      ? { filter: "drop-shadow(0 0 12px rgba(255,215,0,0.8))" }
                      : undefined
                  }
                />
              ))}
              <LabelList
                dataKey="avg_score"
                position="top"
                formatter={(v: number) => `${Math.round(v)}pt`}
                style={{ fill: "white", fontSize: 11, fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking List */}
      <div className="space-y-2 max-w-2xl mx-auto">
        {rankings.map((r, i) => (
          <div
            key={r.store_id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-500 ${
              i === 0
                ? "bg-gradient-to-r from-yellow-900/60 to-yellow-700/40 border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                : i === 1
                ? "bg-gradient-to-r from-gray-700/60 to-gray-600/40 border-gray-400/50"
                : i === 2
                ? "bg-gradient-to-r from-amber-900/60 to-amber-700/40 border-amber-600/50"
                : "bg-white/5 border-white/10"
            } ${pulseIds.has(r.store_id) ? "scale-102 ring-2 ring-yellow-400" : ""}`}
          >
            <span className="text-2xl w-8 text-center">{MEDAL[i] ?? `${i + 1}`}</span>
            <div className="flex-1">
              <span className="font-bold text-white text-sm">{r.store_name}</span>
              <span className="ml-2 text-xs text-gray-400">{r.participant_count}名</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-green-300">
                {Math.round(r.avg_score)}pt
              </div>
              <div className="text-xs text-gray-400">平均スコア</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-800/90 backdrop-blur py-2 px-4">
        <p className="text-center text-xs text-green-200 font-medium animate-pulse">
          🔄 リアルタイム更新中 — 回答が記録されると自動でランキングが変動します
        </p>
      </div>
    </main>
  );
}
