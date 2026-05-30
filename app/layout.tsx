import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laptop CPU Guide — Intel vs AMD Decoded",
  description: "The complete guide to Intel and AMD laptop processors. Understand every suffix, generation, and tier before you buy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
