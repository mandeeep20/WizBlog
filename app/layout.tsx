import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WizBlog",
  description: "Mini blogging app template built with Next.js and Supabase-ready structure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${jetBrainsMono.variable} antialiased bg-[url('/wallpaper.jpg')] bg-cover bg-center bg-fixed`}
      >
        {children}
      </body>
    </html>
  );
}