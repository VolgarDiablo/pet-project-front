"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { login, loginWithGoogle } from "@/lib/auth";
import { getToken } from "@/lib/session";
import { EMAIL_REQUIRED, isEmail } from "@/lib/validators";
import { GoogleButton } from "./google-button";
import { LockIcon, MailIcon } from "./icons";
import {
  AuthCard,
  FormError,
  OrDivider,
  outlineButtonClass,
  solidButtonClass,
  TextField,
} from "./ui";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/menu");
  }, [router]);

  function validate() {
    const nextEmail = isEmail(email) ? null : EMAIL_REQUIRED;
    const nextPassword = password ? null : "Enter your password.";
    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    return !nextEmail && !nextPassword;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push("/menu");
    } catch (error) {
      setFormError(readError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle(idToken: string) {
    setFormError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(idToken);
      router.push("/menu");
    } catch (error) {
      setFormError(readGoogleError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign in">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <TextField
          icon={<MailIcon />}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
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
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(null);
            }}
            error={passwordError}
          />
          <Link
            href="/auth/forgot-password"
            className="mt-3 inline-block text-sm font-medium text-[#d32f2f]"
          >
            Forgot your password
          </Link>
        </div>
        {formError ? <FormError>{formError}</FormError> : null}
        {formError === "Confirm your email before signing in." ? (
          <Link
            href={`/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`}
            className="block text-sm font-medium text-[#d32f2f]"
          >
            Enter the code from the letter
          </Link>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/auth/signup" className={outlineButtonClass}>
            Sign up
          </Link>
          <button type="submit" className={solidButtonClass} disabled={submitting}>
            {submitting ? "Please wait…" : "Sign in"}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <OrDivider />
      </div>
      <div className="mt-4">
        <GoogleButton
          label="Sign in with Google"
          text="signin_with"
          onCredential={onGoogle}
          disabled={submitting}
        />
      </div>
    </AuthCard>
  );
}

function readError(error: unknown) {
  if (error instanceof ApiError && error.message.includes("Google")) {
    return "This account uses Google. Use the Google button.";
  }
  if (error instanceof ApiError && error.status === 403) {
    return "Confirm your email before signing in.";
  }
  if (error instanceof ApiError && error.status === 401) {
    return "Wrong email or password.";
  }
  return error instanceof Error ? error.message : "Could not sign in.";
}

function readGoogleError(error: unknown) {
  return error instanceof Error ? error.message : "Google sign-in failed.";
}
