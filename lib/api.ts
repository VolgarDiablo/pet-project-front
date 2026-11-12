import { getToken } from "./session";

export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;
  resendsLeft?: number;

  constructor(
    status: number,
    message: string,
    extra?: { retryAfterSeconds?: number; resendsLeft?: number },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = extra?.retryAfterSeconds;
    this.resendsLeft = extra?.resendsLeft;
  }
}

type ErrorBody = {
  message?: string | string[];
  retryAfterSeconds?: number;
  resendsLeft?: number;
};

const OFFLINE =
  "Can't reach the API. Start the Nest server on port 3000.";

function messageFrom(body: ErrorBody | null, fallback: string) {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(" ") : body.message;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`/backend${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, OFFLINE);
  }

  const text = await response.text();

  if (text.trimStart().startsWith("<")) {
    throw new ApiError(response.status, OFFLINE);
  }

  let body: ErrorBody | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ErrorBody;
    } catch {
      body = { message: text.slice(0, 200) };
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const proxyFailure =
      response.status >= 500 &&
      !contentType.includes("json") &&
      text.trim() === "Internal Server Error";
    const gatewayDown =
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;
    const offline = proxyFailure || (gatewayDown && !body?.message);
    throw new ApiError(
      response.status,
      offline
        ? OFFLINE
        : messageFrom(body, response.statusText || "Request failed"),
      {
        retryAfterSeconds: body?.retryAfterSeconds,
        resendsLeft: body?.resendsLeft,
      },
    );
  }

  return (body ?? undefined) as T;
}
