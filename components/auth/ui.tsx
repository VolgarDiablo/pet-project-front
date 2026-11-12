import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertIcon } from "./icons";

export const solidButtonClass =
  "inline-flex h-11 items-center justify-center rounded-md bg-[#d32f2f] px-4 text-sm font-medium text-white transition hover:bg-[#b71c1c] disabled:cursor-not-allowed disabled:opacity-60";

export const outlineButtonClass =
  "inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60";

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-[420px] rounded-lg border border-zinc-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="text-center text-[28px] font-semibold tracking-tight text-zinc-950">
        {title}
      </h1>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function TextField({
  icon,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="relative block">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400">
          {icon}
        </span>
        <input
          {...props}
          aria-invalid={error ? true : undefined}
          className={`h-11 w-full rounded-md border bg-white pr-3 pl-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 ${
            error ? "border-[#d32f2f]" : "border-zinc-300"
          }`}
        />
      </span>
      {error ? <FieldError>{error}</FieldError> : null}
    </label>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-1.5 flex items-start gap-1.5 text-left text-xs leading-5 text-[#d32f2f]"
      role="alert"
    >
      <AlertIcon />
      <span>{children}</span>
    </p>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded-md bg-red-50 px-3 py-2 text-left text-sm text-[#d32f2f]"
      role="alert"
    >
      {children}
    </p>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-400">
      <span className="h-px flex-1 bg-zinc-200" />
      Or
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
