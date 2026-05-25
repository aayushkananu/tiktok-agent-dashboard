import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@lalmooon — TikTok Agent",
  description: "AI-powered TikTok audience analysis and weekly content briefs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
