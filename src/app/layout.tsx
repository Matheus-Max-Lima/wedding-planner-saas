import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Noiva sem Crise - Planejamento de Casamento",
  description: "Plataforma completa para planejar o casamento dos seus sonhos",
  keywords: ["casamento", "noiva", "planejamento", "wedding planner"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="antialiased min-h-full">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
