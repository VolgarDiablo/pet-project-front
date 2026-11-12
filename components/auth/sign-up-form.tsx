"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { loginWithGoogle, signup } from "@/lib/auth";
import { getToken } from "@/lib/session";
import {
  EMAIL_REQUIRED,
  EMAIL_TAKEN,
  PASSWORD_RULE,
  fullName,
  isEmail,
  isStrongPassword,
} from "@/lib/validators";
import { GoogleButton } from "./google-button";
import { LockIcon, MailIcon, UserIcon } from "./icons";
import {
  AuthCard,
  FormError,
  OrDivider,
  outlineButtonClass,
  solidButtonClass,
  TextField,
} from "./ui";

type Pending = "email" | "google" | null;

export function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [firstError, setFirstError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/menu");
  }, [router]);

  useEffect(() => {
    if (!pending) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPending(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  function validate() {
    const name = fullName(firstName, lastName);
    const nextFirst = firstName.trim() ? null : "Enter your first name.";
    const nextLast = lastName.trim() ? null : "Enter your last name.";
    const nextName =
      !nextFirst && !nextLast && name.length < 3
        ? "Name must be at least 3 characters."
        : null;
    const nextEmail = isEmail(email) ? null : EMAIL_REQUIRED;
    const nextPassword = isStrongPassword(password) ? null : PASSWORD_RULE;
    setFirstError(nextFirst ?? nextName);
    setLastError(nextLast);
    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    return !nextFirst && !nextLast && !nextName && !nextEmail && !nextPassword;
  }

  async function send() {
    setFormError(null);
    setSubmitting(true);
    const normalized = email.trim().toLowerCase();
    try {
      await signup({
        name: fullName(firstName, lastName),
        email: normalized,
        password,
        confirmPassword: password,
      });
      router.push(`/auth/verify?email=${encodeURIComponent(normalized)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setEmailError(EMAIL_TAKEN);
      } else {
        setFormError(
          error instanceof Error ? error.message : "Could not create the account.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    if (!acceptTerms) {
      setModalError(null);
      setPending("email");
      return;
    }
    void send();
  }

  function confirmAndContinue() {
    if (!acceptTerms) {
      setModalError("Accept the terms to continue.");
      return;
    }
    const action = pending;
    setPending(null);
    if (action === "email") void send();
  }

  async function onGoogle(idToken: string) {
    setFormError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(idToken);
      router.push("/menu");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Google sign-up failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign up">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            icon={<UserIcon />}
            name="firstName"
            autoComplete="given-name"
            placeholder="First Name"
            aria-label="First name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              setFirstError(null);
            }}
            error={firstError}
          />
          <TextField
            icon={<UserIcon />}
            name="lastName"
            autoComplete="family-name"
            placeholder="Last Name"
            aria-label="Last name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              setLastError(null);
            }}
            error={lastError}
          />
        </div>
        <TextField
          icon={<MailIcon />}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter email"
          aria-label="Email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(null);
          }}
          error={emailError}
        />
        <div>
          <TextField
            icon={<LockIcon />}
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(null);
            }}
            error={passwordError}
          />
          {passwordError ? null : (
            <p className="mt-1.5 text-left text-xs leading-5 text-zinc-400">
              8+ characters, one uppercase letter, one number, one symbol.
            </p>
          )}
        </div>
        <div className="space-y-3 pt-1">
          <CheckLine checked={acceptTerms} onChange={setAcceptTerms}>
            I accept the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms & Conditions
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
          </CheckLine>
          <CheckLine checked={marketing} onChange={setMarketing}>
            I agree to get marketing emails
          </CheckLine>
        </div>
        {formError ? <FormError>{formError}</FormError> : null}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/auth/signin" className={outlineButtonClass}>
            Sign in
          </Link>
          <button type="submit" className={solidButtonClass} disabled={submitting}>
            {submitting ? "Please wait…" : "Sign up"}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <OrDivider />
      </div>
      <div className="mt-4">
        <GoogleButton
          label="Sign up with Google"
          text="signup_with"
          onCredential={onGoogle}
          blocked={!acceptTerms}
          onBlocked={() => {
            setModalError(null);
            setPending("google");
          }}
          disabled={submitting}
        />
      </div>
      {pending ? (
        <ConfirmDialog
          acceptTerms={acceptTerms}
          marketing={marketing}
          error={modalError}
          onAcceptTerms={(value) => {
            setAcceptTerms(value);
            if (value) setModalError(null);
          }}
          onMarketing={setMarketing}
          onClose={() => setPending(null)}
          onContinue={confirmAndContinue}
        />
      ) : null}
    </AuthCard>
  );
}

function CheckLine({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2.5 text-left text-sm leading-5 text-zinc-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#d32f2f]"
      />
      <span>{children}</span>
    </label>
  );
}

function ConfirmDialog({
  acceptTerms,
  marketing,
  error,
  onAcceptTerms,
  onMarketing,
  onClose,
  onContinue,
}: {
  acceptTerms: boolean;
  marketing: boolean;
  error: string | null;
  onAcceptTerms: (value: boolean) => void;
  onMarketing: (value: boolean) => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/55 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[420px] rounded-lg bg-white px-8 py-8 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-2xl font-semibold text-zinc-950">
          Confirm
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Please confirm that you agree with the rules of the company and want
          to receive an email newsletter
        </p>
        <div className="mt-5 space-y-3 text-left">
          <CheckLine checked={acceptTerms} onChange={onAcceptTerms}>
            I accept the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms & Conditions
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
          </CheckLine>
          <CheckLine checked={marketing} onChange={onMarketing}>
            I agree to get marketing emails
          </CheckLine>
        </div>
        {error ? <p className="mt-3 text-sm text-[#d32f2f]">{error}</p> : null}
        <button
          type="button"
          className={`${solidButtonClass} mt-6 w-40`}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
