"use client";

import { useSyncExternalStore } from "react";
import { getToken, subscribeToken } from "./session";

export function useToken() {
  return useSyncExternalStore(subscribeToken, getToken, () => null);
}
