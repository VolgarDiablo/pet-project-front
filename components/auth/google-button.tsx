"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { GoogleMark } from "./icons";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type: string;
              theme: string;
              size: string;
              text: string;
              shape: string;
              width: number;
              logo_alignment: string;
            },
          ) => void;
        };
      };
    };
  }
}

type GoogleText = "signin_with" | "signup_with";

type GoogleButtonProps = {
  label: string;
  text: GoogleText;
  onCredential: (idToken: string) => Promise<void>;
  blocked?: boolean;
  onBlocked?: () => void;
  disabled?: boolean;
};

export function GoogleButton({
  label,
  text,
  onCredential,
  blocked = false,
  onBlocked,
  disabled = false,
}: GoogleButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [help, setHelp] = useState(false);
  const interactive = Boolean(CLIENT_ID) && !blocked && !disabled;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!interactive) return;
    paint(hostRef.current, text, (idToken) => {
      void onCredentialRef.current(idToken);
    });
  }, [interactive, text]);

  function onVisualClick() {
    if (disabled) return;
    if (blocked) {
      onBlocked?.();
      return;
    }
    setHelp(true);
  }

  return (
    <div>
      {CLIENT_ID ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            if (!hostRef.current || blocked || disabled) return;
            paint(hostRef.current, text, (idToken) => {
              void onCredentialRef.current(idToken);
            });
          }}
        />
      ) : null}
      <div className="relative h-11">
        <div
          aria-hidden="true"
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-800 ${
            disabled ? "opacity-60" : ""
          }`}
        >
          <GoogleMark />
          {label}
        </div>
        {interactive ? (
          <div
            ref={hostRef}
            className="absolute inset-0 z-10 overflow-hidden opacity-0"
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d32f2f]"
            aria-label={label}
            onClick={onVisualClick}
            disabled={disabled}
          />
        )}
      </div>
      {help ? (
        <p className="mt-2 text-left text-xs leading-5 text-zinc-500">
          Google needs a Client ID in{" "}
          <code className="text-zinc-700">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
          Until then this button cannot open the account picker.
        </p>
      ) : null}
    </div>
  );
}

function paint(
  host: HTMLDivElement | null,
  text: GoogleText,
  onCredential: (idToken: string) => void,
) {
  if (!host || !window.google || !CLIENT_ID) return;
  const width = Math.max(200, Math.floor(host.getBoundingClientRect().width));
  host.replaceChildren();
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    auto_select: false,
    callback: (response) => {
      if (response.credential) onCredential(response.credential);
    },
  });
  window.google.accounts.id.renderButton(host, {
    type: "standard",
    theme: "outline",
    size: "large",
    text,
    shape: "rectangular",
    width,
    logo_alignment: "center",
  });
}
