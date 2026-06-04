import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CPUspec",
  description: "A handbook to understanding processor naming conventions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
