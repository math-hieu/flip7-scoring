import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/game-store";

export const metadata: Metadata = {
  title: "Flip7 - Scoring",
  description: "Application de calcul de score pour le jeu Flip7",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light" data-theme="light">
      <body className="antialiased bg-background text-foreground min-h-screen">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
