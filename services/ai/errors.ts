/**
 * Classified, user-facing AI errors — every failure mode the UI needs to
 * render a distinct, honest state for (see components consuming these
 * actions). Never let a raw SDK/provider error string reach the client.
 */
export type AIErrorCode =
  | "config_missing"
  | "authentication"
  | "rate_limited"
  | "timeout"
  | "provider_error"
  | "invalid_response"
  | "unknown";

const MESSAGES: Record<AIErrorCode, string> = {
  config_missing: "Fonctionnalité IA non configurée. Contactez un administrateur.",
  authentication: "Configuration IA invalide (clé API refusée). Contactez un administrateur.",
  rate_limited: "Le service IA est temporairement surchargé. Réessayez dans un instant.",
  timeout: "Le service IA met trop de temps à répondre. Réessayez.",
  provider_error: "Le service IA est indisponible pour le moment. Réessayez.",
  invalid_response: "Le service IA a renvoyé une réponse inattendue. Réessayez.",
  unknown: "Une erreur inattendue est survenue. Réessayez.",
};

export class AIError extends Error {
  code: AIErrorCode;
  retryable: boolean;

  constructor(code: AIErrorCode, cause?: unknown) {
    super(MESSAGES[code]);
    this.name = "AIError";
    this.code = code;
    this.retryable = code !== "config_missing" && code !== "authentication";
    if (cause instanceof Error) {
      // Keep the technical detail for server logs without exposing it to the UI.
      console.error(`[AIError:${code}]`, cause.message);
    }
  }
}

/**
 * Server actions return this instead of throwing — Next.js redacts thrown
 * error messages from Server Actions in production, which would silently
 * destroy the careful classification above. The client always gets a real,
 * typed result.
 */
export type AIActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AIErrorCode; message: string; retryable: boolean };

export function aiActionError(error: unknown): { ok: false; code: AIErrorCode; message: string; retryable: boolean } {
  const err = toAIError(error);
  return { ok: false, code: err.code, message: err.message, retryable: err.retryable };
}

/** Normalizes any thrown value (OpenAI SDK error, JSON.parse failure, ...) into an AIError. */
export function toAIError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403) return new AIError("authentication", error);
    if (status === 429) return new AIError("rate_limited", error);
    if (typeof status === "number" && status >= 500) return new AIError("provider_error", error);
  }

  if (error instanceof Error) {
    if (error.name === "APIConnectionTimeoutError" || error.message.toLowerCase().includes("timeout")) {
      return new AIError("timeout", error);
    }
    if (error.message.toLowerCase().includes("json") || error.message.includes("Réponse IA vide")) {
      return new AIError("invalid_response", error);
    }
  }

  return new AIError("unknown", error);
}
