import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBM · God Mode",
  description: "Panel de plataforma — The Business Multiplier",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
