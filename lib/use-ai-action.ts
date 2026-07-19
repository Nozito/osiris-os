"use client";

import { useState, useTransition } from "react";
import type { AIActionResult } from "@/services/ai";

export type AIActionState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string; retryable: boolean };

/** Drives the loading/ready/error states for a generative AI server action — never a raw throw. */
export function useAIAction<T>(action: () => Promise<AIActionResult<T>>) {
  const [state, setState] = useState<AIActionState<T>>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function run() {
    setState({ status: "loading" });
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setState({ status: "ready", data: result.data });
      } else {
        setState({ status: "error", message: result.message, retryable: result.retryable });
      }
    });
  }

  return { state, run, isPending };
}
