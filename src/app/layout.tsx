import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: { default: "Até o Altar", template: "%s | Até o Altar" },
  description: "Transformando planos em memórias. Plataforma completa para planejar o casamento dos seus sonhos.",
  keywords: ["planejamento de casamento", "casamento", "checklist casamento", "orçamento casamento"],
  authors: [{ name: "Até o Altar" }],
  creator: "Até o Altar",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXTAUTH_URL || "https://ateoaltar.com",
    siteName: "Até o Altar",
    title: "Até o Altar — Transformando planos em memórias.",
    description: "Plataforma completa para planejar o casamento dos seus sonhos.",
  },
  twitter: { card: "summary_large_image", title: "Até o Altar", description: "Transformando planos em memórias." },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f43f5e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased min-h-full">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.error('Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
