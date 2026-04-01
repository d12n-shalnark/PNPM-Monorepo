import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web App",
  description: "A Next.js application in a monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}