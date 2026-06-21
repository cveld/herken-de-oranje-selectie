import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Herken de Oranje Selectie",
  description:
    "Een webapp om je kennis van het Nederlands elftal te testen — mini-games met spelersfoto's en avatars.",
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
