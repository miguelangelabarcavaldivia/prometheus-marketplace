import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, createStripeCustomer, createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: session.user.email,
        name: session.user.name ?? undefined,
        userId: session.user.id,
      });
      customerId = customer.id;

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: session.user.id,
            status: "INCOMPLETE",
            stripeCustomerId: customerId,
          },
        });
      }
    }

    const checkout = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeSessionId: checkout.id, stripePriceId: priceId },
      });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
