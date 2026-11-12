"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { clearToken } from "@/lib/session";
import { useToken } from "@/lib/use-token";
import { outlineButtonClass, solidButtonClass } from "./ui";

type Remote =
  | { status: "idle" }
  | { status: "user"; id: number }
  | { status: "offline" };

export function HomeGate() {
  const router = useRouter();
  const token = useToken();
  const [remote, setRemote] = useState<Remote>({ status: "idle" });

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (!cancelled) setRemote({ status: "user", id: me.id });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          router.replace("/auth/signin");
          return;
        }
        setRemote({ status: "offline" });
      });

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  const phase = !token
    ? "guest"
    : remote.status === "user"
      ? "user"
      : remote.status === "offline"
        ? "offline"
        : "loading";

  function signOut() {
    clearToken();
    router.replace("/auth/signin");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-[#d32f2f]">Client</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        Menu
      </h1>
      {phase === "loading" ? (
        <p className="mt-4 text-zinc-500">Loading…</p>
      ) : null}
      {phase === "guest" ? (
        <>
          <p className="mt-4 leading-7 text-zinc-600">
            The menu will live on this page. Sign in if you already have an
            account.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/auth/signin" className={`${solidButtonClass} px-5`}>
              Sign in
            </Link>
            <Link href="/auth/signup" className={`${outlineButtonClass} px-5`}>
              Sign up
            </Link>
          </div>
        </>
      ) : null}
      {phase === "user" ? (
        <>
          <p className="mt-4 leading-7 text-zinc-600">
            Signed in. User id {remote.status === "user" ? remote.id : ""}.
            Dishes will replace this page.
          </p>
          <button
            type="button"
            className={`${outlineButtonClass} mt-6 w-fit px-5`}
            onClick={signOut}
          >
            Sign out
          </button>
        </>
      ) : null}
      {phase === "offline" ? (
        <>
          <p className="mt-4 leading-7 text-zinc-600">
            A session is saved on this browser, but the API is not responding.
          </p>
          <button
            type="button"
            className={`${outlineButtonClass} mt-6 w-fit px-5`}
            onClick={signOut}
          >
            Sign out
          </button>
        </>
      ) : null}
    </main>
  );
}
