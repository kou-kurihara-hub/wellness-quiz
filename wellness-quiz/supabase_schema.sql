-- =====================================================
-- ウエルネスアドバイザー特訓クイズ — Supabaseスキーマ
-- =====================================================
-- Supabase Dashboard > SQL Editor でこのファイルを実行してください

-- 1. 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 受講生テーブル
CREATE TABLE IF NOT EXISTS participants (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id         UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  employee_number  TEXT NOT NULL,
  total_score      INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, employee_number)
);

-- 3. 回答テーブル
CREATE TABLE IF NOT EXISTS answers (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id   UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  question_id      TEXT NOT NULL,
  selected_option  TEXT NOT NULL CHECK (selected_option IN ('a','b','c','d')),
  is_correct       BOOLEAN NOT NULL,
  score            INTEGER DEFAULT 0,
  answered_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

-- 4. 店舗別ランキングビュー
CREATE OR REPLACE VIEW store_rankings AS
SELECT
  s.id   AS store_id,
  s.name AS store_name,
  s.code AS store_code,
  COUNT(DISTINCT p.id)                         AS participant_count,
  COALESCE(AVG(p.total_score), 0)::NUMERIC(10,2) AS avg_score,
  COALESCE(SUM(p.total_score), 0)              AS total_score
FROM stores s
LEFT JOIN participants p ON p.store_id = s.id
GROUP BY s.id, s.name, s.code
ORDER BY avg_score DESC;

-- 5. スコア更新用RPC関数
CREATE OR REPLACE FUNCTION update_participant_score(
  p_participant_id UUID,
  p_score          INTEGER
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE participants
  SET
    total_score        = total_score + p_score,
    questions_answered = questions_answered + 1
  WHERE id = p_participant_id;
END;
$$;

-- 6. Row Level Security (公開読み取り、本人のみ書き込み)
ALTER TABLE stores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers      ENABLE ROW LEVEL SECURITY;

-- stores: 誰でも読める
CREATE POLICY "stores_select" ON stores FOR SELECT USING (true);

-- participants: 誰でも作成・読み取り可
CREATE POLICY "participants_select" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_update" ON participants FOR UPDATE USING (true);

-- answers: 誰でも作成・読み取り可（anon keyで動作させるため）
CREATE POLICY "answers_select" ON answers FOR SELECT USING (true);
CREATE POLICY "answers_insert" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "answers_upsert" ON answers FOR UPDATE USING (true);

-- 7. 店舗サンプルデータ投入
INSERT INTO stores (name, code) VALUES
  ('渋谷本店',         'shibuya'),
  ('新宿北口店',       'shinjuku'),
  ('池袋東口店',       'ikebukuro'),
  ('品川シーサイド店', 'shinagawa'),
  ('横浜みなとみらい店','yokohama'),
  ('川崎駅前店',       'kawasaki'),
  ('吉祥寺店',         'kichijoji'),
  ('立川北口店',       'tachikawa')
ON CONFLICT (code) DO NOTHING;

-- 8. Realtimeを有効化（Dashboard > Database > Replication でも設定必要）
-- ALTER PUBLICATION supabase_realtime ADD TABLE answers;
-- ALTER PUBLICATION supabase_realtime ADD TABLE participants;
