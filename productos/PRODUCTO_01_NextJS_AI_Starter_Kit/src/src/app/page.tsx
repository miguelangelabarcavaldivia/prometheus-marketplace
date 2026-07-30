import Link from "next/link";

const features = [
  {
    title: "Multi-Model AI Chat",
    description: "Support for GPT-4o, GPT-4o-mini, GPT-4 Turbo, and GPT-3.5 Turbo with automatic fallback.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: "Streaming Responses",
    description: "Real-time token-by-token streaming with server-sent events for instant AI feedback.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "10 Pre-Configured Prompts",
    description: "Ready-to-use AI prompts for code generation, debugging, code review, testing, and more.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Stripe Subscriptions",
    description: "Monetize your AI app with monthly and yearly subscription plans via Stripe.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    title: "Auth.js Authentication",
    description: "GitHub and Google OAuth out of the box, with JWT sessions and Prisma adapter.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "PostgreSQL + Redis",
    description: "Docker Compose setup with PostgreSQL for data and Redis for rate limiting.",
    icon: (
      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.08),transparent)]" />
        <div className="text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm text-surface-600 shadow-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            Production Ready — Next.js 15 + TypeScript
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-surface-900 sm:text-6xl lg:text-7xl">
            Build AI Apps
            <span className="block text-primary-600">Faster Than Ever</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-surface-600">
            A production-ready Next.js starter kit with multi-model AI chat,
            Stripe subscriptions, authentication, and 10 pre-configured developer prompts.
            Deploy to Vercel in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/chat" className="btn-primary px-8 py-3 text-base">
              Start Chatting
            </Link>
            <a
              href="#features"
              className="btn-secondary px-8 py-3 text-base"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            Carefully designed to accelerate your AI product development.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card group transition-all hover:shadow-md hover:border-primary-200"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 ring-1 ring-primary-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-surface-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-surface-200 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            Pre-Configured Prompts
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            10 specialized AI prompts for common development tasks.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            "Code Generator", "Debug Assistant", "Code Review",
            "Test Writer", "Docs Generator", "Refactor Suggestor",
            "API Designer", "DB Query Helper", "Deploy Checker",
            "Commit Writer",
          ].map((prompt) => (
            <div
              key={prompt}
              className="rounded-lg border border-surface-200 bg-white px-4 py-3 text-center text-sm font-medium text-surface-700 shadow-sm transition-all hover:border-primary-300 hover:text-primary-700"
            >
              {prompt}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-surface-200 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            Ready to Deploy
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            From local development to production in minutes.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-lg space-y-4 rounded-xl border border-surface-200 bg-white p-8 shadow-sm">
          {[
            "git clone && npm install",
            "docker compose up -d",
            "cp .env.example .env",
            "npm run db:migrate",
            "npm run dev",
          ].map((cmd) => (
            <div
              key={cmd}
              className="rounded-lg bg-surface-900 px-4 py-3 font-mono text-sm text-green-400"
            >
              $ {cmd}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-surface-200 py-8 text-center text-sm text-surface-500">
        <p>&copy; {new Date().getFullYear()} NextJS AI Starter Kit. MIT License.</p>
      </footer>
    </div>
  );
}
