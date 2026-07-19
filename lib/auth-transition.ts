"use client";

import { useSyncExternalStore } from "react";

type AuthTransitionState = { visible: boolean; mode: "in" | "out" };

const DRAW_MS = 2300;
const ERASE_MS = 2300;

let state: AuthTransitionState = { visible: false, mode: "in" };
const listeners = new Set<() => void>();

function setState(next: AuthTransitionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): AuthTransitionState {
  return { visible: false, mode: "in" };
}

export function useAuthTransition() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Plays the logo draw-in (login) or draw-out (logout) overlay and resolves once it's done. */
export function playAuthTransition(mode: "in" | "out") {
  setState({ visible: true, mode });
  const duration = mode === "in" ? DRAW_MS : ERASE_MS;
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      setState({ visible: false, mode });
      resolve();
    }, duration);
  });
}
