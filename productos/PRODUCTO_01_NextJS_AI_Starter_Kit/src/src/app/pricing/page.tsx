import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/stripe";
import { CheckoutButton } from "./CheckoutButton";

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-surface-600">
          Choose the plan that fits your needs. All plans include access to all AI models.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl gap-8 lg:grid-cols-2">
        {Object.entries(PLANS).map(([id, plan]) => (
          <div
            key={id}
            className={`card relative flex flex-col ${
              id === "yearly"
                ? "border-primary-300 ring-2 ring-primary-100"
                : ""
            }`}
          >
            {id === "yearly" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
                Best Value
              </span>
            )}
            <h2 className="text-xl font-semibold text-surface-900">
              {plan.name}
            </h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-surface-900">
                ${plan.amount}
              </span>
              <span className="ml-1 text-sm text-surface-500">
                /{plan.interval === "month" ? "month" : "year"}
              </span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {[
                `Up to ${plan.credits} AI requests per ${plan.interval}`,
                "Access to GPT-4o, GPT-4o-mini, GPT-4 Turbo",
                "Streaming responses",
                "Pre-configured developer prompts",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-surface-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <CheckoutButton
              priceId={plan.priceId}
              signedIn={!!session?.user}
              className="mt-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
