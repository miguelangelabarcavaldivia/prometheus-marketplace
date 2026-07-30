import Link from "next/link";
import fs from "fs";
import path from "path";

interface PromptMeta {
  slug: string;
  title: string;
  description: string;
}

const promptMeta: PromptMeta[] = [
  { slug: "code-generator", title: "Code Generator", description: "Generate production-ready code in any language with error handling and type safety." },
  { slug: "debug-assistant", title: "Debug Assistant", description: "Systematic debugging with root cause analysis and exact fixes." },
  { slug: "code-review", title: "Code Review", description: "Thorough code review covering correctness, performance, security, and best practices." },
  { slug: "test-writer", title: "Test Writer", description: "Comprehensive unit and integration tests for any codebase." },
  { slug: "docs-generator", title: "Docs Generator", description: "Generate READMEs, API references, architecture guides, and more." },
  { slug: "refactor-suggestor", title: "Refactor Suggestor", description: "Identify code smells and suggest structured refactoring plans." },
  { slug: "api-designer", title: "API Designer", description: "Design RESTful or GraphQL APIs with proper conventions and error handling." },
  { slug: "db-query-helper", title: "DB Query Helper", description: "Write optimized SQL and ORM queries with index recommendations." },
  { slug: "deploy-checker", title: "Deploy Checker", description: "Review deployment readiness across environment, security, and monitoring." },
  { slug: "commit-writer", title: "Commit Writer", description: "Generate conventional commit messages from diffs or descriptions." },
];

export default function PromptsPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900">
          Pre-Configured Prompts
        </h1>
        <p className="mt-4 text-lg text-surface-600">
          10 specialized prompts designed to accelerate your development workflow.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
        {promptMeta.map((prompt) => (
          <Link
            key={prompt.slug}
            href={`/chat`}
            className="card group transition-all hover:border-primary-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-surface-900 group-hover:text-primary-700">
              {prompt.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-surface-600">
              {prompt.description}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
              Use this prompt →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
