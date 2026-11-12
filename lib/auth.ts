import { api } from "./api";
import { setToken } from "./session";

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function signup(input: SignupInput) {
  await api<void>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(email: string, password: string) {
  const result = await api<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(result.token);
}

export async function loginWithGoogle(idToken: string) {
  const result = await api<{ token: string }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  setToken(result.token);
}

export function fetchMe() {
  return api<{ id: number }>("/auth/me");
}

export function verifyEmail(token: string) {
  return api<{ message: string }>(
    `/auth/verify?token=${encodeURIComponent(token)}`,
  );
}

export type VerificationStatus = {
  verified: boolean;
  resendsLeft: number;
  retryAfterSeconds: number;
  expired: boolean;
};

export function verificationStatus(email: string) {
  return api<VerificationStatus>("/auth/verification-status", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyCode(email: string, code: string) {
  return api<{ message: string }>("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function resendVerification(email: string) {
  return api<{ retryAfterSeconds: number; resendsLeft: number }>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}
