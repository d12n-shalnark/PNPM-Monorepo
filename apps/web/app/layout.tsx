import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

export const metadata: Metadata = {
  title: "Web App",
  description: "A Next.js application in a monorepo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseProvider initialSession={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}