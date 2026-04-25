import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  variable: "--font-plus-jakarta", 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: "Skilizee Edu — Educational Content Engine",
  description: "AI-powered educational content, research, and communication strategy for schools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} font-sans h-full antialiased`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--txt)]">{children}</body>
    </html>
  );
}
