"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  priceId: string;
  signedIn: boolean;
  className?: string;
}

export function CheckoutButton({ priceId, signedIn, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!signedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) throw new Error("Checkout failed");

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`btn-primary w-full justify-center ${className ?? ""}`}
    >
      {loading ? "Redirecting..." : signedIn ? "Subscribe" : "Sign in to Subscribe"}
    </button>
  );
}
