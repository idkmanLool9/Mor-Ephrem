import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./theme.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {
    default: "Antioch Administration",
    template: "%s | Antioch Administration",
  },
  description:
    "Nederlandstalige administratie voor leden en gezinnen. Fictieve demonstratieomgeving.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
