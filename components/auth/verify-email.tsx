"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  resendVerification,
  verificationStatus,
  verifyCode,
  verifyEmail,
} from "@/lib/auth";
import { AuthCard, FormError, solidButtonClass } from "./ui";

export function VerifyEmail() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email")?.trim().toLowerCase() ?? "";

  if (token) return <TokenVerify token={token} />;
  return <CodeVerify email={email} />;
}

function TokenVerify({ token }: { token: string }) {
  const [message, setMessage] = useState("Checking the link…");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setVerified(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 409) {
          setVerified(true);
          return;
        }
        const text = error instanceof Error ? error.message : "This link is not valid.";
        setMessage(
          text.toLowerCase().includes("expired")
            ? "This code has expired."
            : text,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (verified) return <VerifiedNotice />;

  return (
    <AuthCard title="Confirm">
      <p className="text-center text-sm leading-6 text-zinc-600">{message}</p>
    </AuthCard>
  );
}

function CodeVerify({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [resendsLeft, setResendsLeft] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    verificationStatus(email)
      .then((status) => {
        if (cancelled) return;
        if (status.verified) {
          setVerified(true);
          return;
        }
        setResendsLeft(status.resendsLeft);
        setSecondsLeft(status.retryAfterSeconds);
        if (status.expired) setError("This code has expired.");
        setReady(true);
      })
      .catch((statusError: unknown) => {
        if (cancelled) return;
        setError(
          statusError instanceof Error
            ? statusError.message
            : "Could not open verification.",
        );
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the letter.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyCode(email, code);
      setVerified(true);
    } catch (submitError) {
      setError(readVerifyError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await resendVerification(email);
      setResendsLeft(result.resendsLeft);
      setSecondsLeft(result.retryAfterSeconds);
    } catch (resendError) {
      if (resendError instanceof ApiError) {
        if (typeof resendError.retryAfterSeconds === "number") {
          setSecondsLeft(resendError.retryAfterSeconds);
        }
        if (typeof resendError.resendsLeft === "number") {
          setResendsLeft(resendError.resendsLeft);
        }
        setError(resendError.message);
      } else {
        setError("Could not send another letter.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (verified) return <VerifiedNotice />;

  if (email && !ready) {
    return (
      <AuthCard title="Confirm">
        <p className="text-center text-sm leading-6 text-zinc-600">
          Checking this email…
        </p>
      </AuthCard>
    );
  }

  if (!email) {
    return (
      <AuthCard title="Confirm">
        <p className="text-center text-sm leading-6 text-zinc-600">
          Open this page after registration. The letter contains a 6-digit code.
        </p>
      </AuthCard>
    );
  }

  const wait = formatWait(secondsLeft);
  const canResend = ready && secondsLeft === 0 && resendsLeft > 0 && !submitting;

  return (
    <AuthCard title="Confirm">
      <p className="text-center text-sm leading-6 text-zinc-600">
        Enter the code sent to{" "}
        <span className="font-medium text-zinc-900">{email}</span>. It expires
        in 15 minutes.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-label="Verification code"
          placeholder="000000"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
          className="h-12 w-full rounded-md border border-zinc-300 bg-white text-center text-lg tracking-[0.4em] text-zinc-900 outline-none focus:border-zinc-400"
        />
        {error ? <FormError>{error}</FormError> : null}
        <button
          type="submit"
          className={`${solidButtonClass} w-full`}
          disabled={submitting}
        >
          {submitting ? "Please wait…" : "Confirm"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-zinc-500">
        {resendsLeft === 0 ? (
          <p>You already asked for two more letters.</p>
        ) : (
          <button
            type="button"
            className="font-medium text-[#d32f2f] disabled:cursor-not-allowed disabled:text-zinc-400"
            disabled={!canResend}
            onClick={() => void resend()}
          >
            {secondsLeft > 0 ? `Send again in ${wait}` : "Send the letter again"}
          </button>
        )}
        {resendsLeft > 0 ? (
          <p className="mt-2">{resendsLeft} more {resendsLeft === 1 ? "letter" : "letters"}</p>
        ) : null}
      </div>
    </AuthCard>
  );
}

function VerifiedNotice() {
  return (
    <AuthCard title="Email verified">
      <p className="text-center text-sm leading-6 text-zinc-600">
        Your email is verified. You can sign in now.
      </p>
      <Link href="/auth/signin" className={`${solidButtonClass} mt-6 w-full`}>
        Sign in
      </Link>
    </AuthCard>
  );
}

function readVerifyError(error: unknown) {
  if (error instanceof ApiError && error.message.toLowerCase().includes("expired")) {
    return "This code has expired.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "This email is already verified.";
  }
  return error instanceof Error ? error.message : "Could not verify the code.";
}

function formatWait(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
