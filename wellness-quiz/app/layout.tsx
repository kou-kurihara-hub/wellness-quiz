import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ウエルネスアドバイザー特訓クイズ",
  description: "ドラッグストア従業員向け チーム対抗リアルタイムクイズ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-orange-50">
        {children}
      </body>
    </html>
  );
}
