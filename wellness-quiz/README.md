# ウエルネスアドバイザー特訓クイズ 💊

ドラッグストア従業員向けチーム対抗リアルタイムクイズアプリ

## セットアップ手順

### 1. Node.js のインストール
https://nodejs.org/ja/ から LTS 版をダウンロードしてインストール

### 2. 依存パッケージのインストール
```bash
cd wellness-quiz
npm install
```

### 3. Supabase の設定（任意・Supabaseなしでもデモ動作可）

1. https://supabase.com でプロジェクト作成（無料）
2. SQL Editor で `supabase_schema.sql` を実行
3. Database > Replication で `answers` と `participants` テーブルのRealtimeを有効化
4. `.env.local.example` をコピーして `.env.local` を作成し、URLとANON KEYを入力

```bash
cp .env.local.example .env.local
# .env.local を編集してSupabaseの値を入力
```

### 4. 開発サーバー起動
```bash
npm run dev
```
→ http://localhost:3000 でアクセス

### 5. Vercelへのデプロイ
```bash
npm install -g vercel
vercel
# Vercel Dashboardで環境変数を設定
```

## 画面構成

| パス | 内容 |
|------|------|
| `/` | ログイン（店舗選択 + 社員番号） |
| `/quiz` | クイズ画面（タイマー・4択・解説） |
| `/result` | 結果画面（スコア・正答率・ランク） |
| `/ranking` | リアルタイムランキング（スクリーン投影用） |

## 技術スタック

- **Next.js 15** (App Router)
- **Tailwind CSS** (ビタミンカラー系ポップUI)
- **Supabase** (PostgreSQL + Realtime Subscriptions)
- **Recharts** (棒グラフ)
- **canvas-confetti** (正解時の紙吹雪)
- **Framer Motion** (アニメーション)
- **Vercel** (無料ホスティング)

## Supabaseなしのデモモード

`.env.local` が未設定の場合、ランキング画面はモックデータで動作します。
クイズの回答はlocalStorageに保存されます。
