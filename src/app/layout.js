import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "SkilizeeAI — Social Media & Marketing Intelligence",
  description: "AI-powered social media research, content generation, and marketing automation platform. Powered by Gemini 3.1 Pro.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
