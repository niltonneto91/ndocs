import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "NDOCS",
  description: "Gestão documental e conformidade regulatória para terminais de combustíveis",
  icons: {
    icon: "/brand/ndocs-icon.png",
    apple: "/brand/ndocs-icon.png"
  }
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
