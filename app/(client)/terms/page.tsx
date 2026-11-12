import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms & Conditions</h1>
      <p className="mt-4 leading-7 text-zinc-600">
        Placeholder. The real terms of the venue will go here before launch.
      </p>
      <Link href="/auth/signup" className="mt-6 text-sm font-medium text-[#d32f2f]">
        Back to sign up
      </Link>
    </main>
  );
}
