"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn-secondary text-sm"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/chat" })}
      className="btn-primary text-sm"
    >
      Sign In
    </button>
  );
}
