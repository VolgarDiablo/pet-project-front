"use client";

import Link from "next/link";
import { useState } from "react";
import { EMAIL_REQUIRED, isEmail } from "@/lib/validators";
import { MailIcon } from "./icons";
import { AuthCard, solidButtonClass, TextField } from "./ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEmail(email)) {
      setNotice(null);
      setEmailError(EMAIL_REQUIRED);
      return;
    }
    setEmailError(null);
    setNotice(
      "This screen is ready, but the API has no reset-password route yet. The mail service already has an otp letter type waiting for it.",
    );
  }

  return (
    <AuthCard title="Forgot Password">
      <p className="text-center text-sm leading-6 text-zinc-500">
        Enter your current email to reset your password
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
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
        {notice ? (
          <p className="text-left text-sm leading-6 text-zinc-600">{notice}</p>
        ) : null}
        <button type="submit" className={`${solidButtonClass} w-full`}>
          Reset Password
        </button>
      </form>
      <Link
        href="/auth/signin"
        className="mt-4 block text-center text-sm font-medium text-[#d32f2f]"
      >
        Go back to Sign in
      </Link>
    </AuthCard>
  );
}
