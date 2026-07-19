"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { playAuthTransition } from "@/lib/auth-transition";
import { signOut } from "@/app/(auth)/login/actions";

/** Plays the logo draw-out transition, then signs out and navigates to /login. */
export function useLogout() {
  const router = useRouter();
  const pending = useRef(false);

  return async function logout() {
    if (pending.current) return;
    pending.current = true;
    await playAuthTransition("out");
    await signOut();
    router.push("/login");
    router.refresh();
  };
}
