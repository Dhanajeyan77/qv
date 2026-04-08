import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "N-Queen Visualizer | Interactive Algorithm",
  description: "A dynamic visualization of the N-Queens backtracking algorithm. Support for 8x8 and custom board sizes with manual and auto-solve modes.",
  keywords: ["N-Queens", "Algorithm Visualization", "Backtracking", "React", "Next.js", "Dhanajeyan"],
  authors: [{ name: "Dhanajeyan" }],
  openGraph: {
    title: "N-Queen Algorithm Visualizer",
    description: "Watch the N-Queens algorithm solve puzzles in real-time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N-Queen Visualizer",
    description: "Interactive algorithm visualization for the N-Queens problem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}