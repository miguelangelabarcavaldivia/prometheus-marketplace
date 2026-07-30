import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const priceId = session.metadata?.priceId;

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            status: "ACTIVE",
            currentPeriodStart: new Date(session.created * 1000),
            currentPeriodEnd: new Date(session.expires_at * 1000),
          },
        });

        await prisma.user.update({
          where: {
            id: (await prisma.subscription.findUnique({
              where: { stripeCustomerId: customerId },
              select: { userId: true },
            }))?.userId,
          },
          data: { credits: { increment: 500 } },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status.toUpperCase() as any,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: deletedSub.id },
          data: {
            status: "CANCELED",
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subId = invoice.subscription as string;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subId },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
