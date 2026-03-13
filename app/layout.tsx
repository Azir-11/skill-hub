import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Skill Hub - 发现与管理 AI 技能",
  description: "面向开源社区的 AI 技能发现与导航平台，聚合脚本、智能体、提示词与工具资源。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
