import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [chats, subscription] = await Promise.all([
    prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { _count: { select: { messages: true } } },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  async function createPortalSession() {
    "use server";
    if (!subscription?.stripeCustomerId) return { url: null };

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return { url: portal.url };
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-surface-600">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm text-surface-500">AI Credits</div>
          <div className="mt-1 text-2xl font-bold text-surface-900">
            {session.user.role === "premium" ? "Unlimited" : "100"}
          </div>
          <div className="mt-1 text-xs text-surface-400">
            {session.user.role === "premium"
              ? "Premium plan"
              : "Free tier"}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-surface-500">Chats</div>
          <div className="mt-1 text-2xl font-bold text-surface-900">
            {chats.length}
          </div>
          <Link
            href="/chat"
            className="mt-1 inline-block text-xs font-medium text-primary-600 hover:text-primary-500"
          >
            Start new chat →
          </Link>
        </div>
        <div className="card">
          <div className="text-sm text-surface-500">Subscription</div>
          <div className="mt-1 text-2xl font-bold text-surface-900">
            {subscription?.status === "ACTIVE"
              ? "Active"
              : "Free"}
          </div>
          {subscription?.status === "ACTIVE" ? (
            <form action={createPortalSession}>
              <button
                type="submit"
                className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-500"
              >
                Manage billing →
              </button>
            </form>
          ) : (
            <Link
              href="/pricing"
              className="mt-1 inline-block text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-surface-900">
          Recent Chats
        </h2>
        {chats.length === 0 ? (
          <p className="mt-4 text-sm text-surface-500">
            No chats yet.{' '}
            <Link
              href="/chat"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Start your first conversation
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?chatId=${chat.id}`}
                className="card flex items-center justify-between transition-colors hover:border-primary-200"
              >
                <div>
                  <div className="font-medium text-surface-900">
                    {chat.title}
                  </div>
                  <div className="mt-0.5 text-xs text-surface-400">
                    {chat._count.messages} messages ·{" "}
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
