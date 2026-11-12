import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/components/auth/verify-email";
import { AuthCard } from "@/components/auth/ui";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Confirm">
          <p className="text-center text-sm text-zinc-600">Checking the link…</p>
        </AuthCard>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}
