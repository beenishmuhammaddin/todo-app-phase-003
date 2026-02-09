import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Benish - Productivity Reimagined",
  description: "A clean, modern task management application with a focus on simplicity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className} ${poppins.variable} bg-rose-50/20 text-slate-800 min-h-screen flex flex-col`}>
        <div className="flex-grow">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="w-full py-6 text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm border-t border-rose-100">
          <p className="flex items-center justify-center gap-1">
            Designed & Developed for
            <span className="font-semibold text-rose-700">Benish</span>
            <span className="text-red-500">❤️</span>
          </p>
        </footer>

        {/* Chat Widget */}
        <ChatWidget />
      </body>
    </html>
  );
}