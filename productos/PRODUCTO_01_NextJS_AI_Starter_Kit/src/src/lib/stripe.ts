import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
  appInfo: {
    name: "NextJS AI Starter Kit",
    version: "1.0.0",
  },
});

export const PLANS = {
  monthly: {
    name: "Monthly Pro",
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? "",
    amount: 29,
    interval: "month" as const,
    credits: 500,
  },
  yearly: {
    name: "Yearly Pro",
    priceId: process.env.STRIPE_PRICE_YEARLY ?? "",
    amount: 249,
    interval: "year" as const,
    credits: 6000,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanId | null {
  for (const [id, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return id as PlanId;
  }
  return null;
}

export function createStripeCustomer(args: {
  email: string;
  name?: string;
  userId: string;
}) {
  return stripe.customers.create({
    email: args.email,
    name: args.name,
    metadata: { userId: args.userId },
  });
}

export function createCheckoutSession(args: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: args.customerId,
    mode: "subscription",
    line_items: [{ price: args.priceId, quantity: 1 }],
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: { priceId: args.priceId },
  });
}

export function createPortalSession(args: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: args.customerId,
    return_url: args.returnUrl,
  });
}
