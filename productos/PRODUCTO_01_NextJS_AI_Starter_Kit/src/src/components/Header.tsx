import Link from "next/link";
import { auth } from "@/lib/auth";
import { AuthButton } from "./AuthButton";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold text-surface-900">
              AI Starter Kit
            </span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/chat"
              className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
            >
              Chat
            </Link>
            <Link
              href="/prompts"
              className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
            >
              Prompts
            </Link>
            {session?.user && (
              <Link
                href="/pricing"
                className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
              >
                Pricing
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="hidden text-sm text-surface-700 sm:block">
                {session.user.name ?? session.user.email}
              </span>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-surface-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                  {session.user.name?.charAt(0) ?? "U"}
                </div>
              )}
            </Link>
          ) : (
            <AuthButton />
          )}
        </div>
      </div>
    </header>
  );
}
