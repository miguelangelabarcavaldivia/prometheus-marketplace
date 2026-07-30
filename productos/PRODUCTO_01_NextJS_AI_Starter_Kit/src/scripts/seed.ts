import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedPrompts = [
  {
    title: "Code Generator",
    content: `# Code Generator

Generate production-ready code following these rules:
1. Complete, functional code — no placeholders or TODO
2. Error handling and input validation
3. Type safety throughout
4. Language-specific best practices`,
    category: "development",
    icon: "code",
    isPreset: true,
  },
  {
    title: "Debug Assistant",
    content: `# Debug Assistant

Help me debug this issue:
1. Error message and stack trace
2. Relevant code
3. What I've tried so far`,
    category: "development",
    icon: "bug",
    isPreset: true,
  },
  {
    title: "Code Review",
    content: `# Code Review

Review this code for:
1. Correctness and logic errors
2. Performance bottlenecks
3. Security vulnerabilities
4. Code quality and maintainability`,
    category: "development",
    icon: "review",
    isPreset: true,
  },
  {
    title: "Test Writer",
    content: `# Test Writer

Write tests covering:
1. Normal operation (happy path)
2. Edge cases and boundaries
3. Error handling and failure modes
4. Integration points`,
    category: "testing",
    icon: "test",
    isPreset: true,
  },
  {
    title: "Docs Generator",
    content: `# Documentation Generator

Generate documentation including:
1. Overview and purpose
2. Setup and installation
3. Usage examples with code
4. API reference
5. Troubleshooting guide`,
    category: "documentation",
    icon: "docs",
    isPreset: true,
  },
];

async function main() {
  console.log("Seeding database...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
    },
  });

  console.log(`  ✓ Created admin user: ${adminUser.email}`);

  for (const prompt of seedPrompts) {
    await prisma.savedPrompt.upsert({
      where: { id: `${prompt.title.toLowerCase().replace(/\s+/g, "-")}-preset` },
      update: {},
      create: {
        id: `${prompt.title.toLowerCase().replace(/\s+/g, "-")}-preset`,
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        icon: prompt.icon,
        isPreset: prompt.isPreset,
        userId: adminUser.id,
      },
    });
  }

  console.log(`  ✓ Seeded ${seedPrompts.length} preset prompts`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
