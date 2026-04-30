import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean (order matters due to FKs)
  await prisma.comment.deleteMany();
  await prisma.snapshot.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // --- Users ---
  const [alice, bob, charlie] = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        username: "alice",
        firstname: "Alice",
        lastname: "Anderson",
        hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        username: "bob",
        firstname: "Bob",
        lastname: "Brown",
        hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: "charlie@example.com",
        username: "charlie",
        firstname: "Charlie",
        lastname: "Clark",
        hashedPassword,
      },
    }),
  ]);

  console.log(
    `✅ Created users: ${alice.username}, ${bob.username}, ${charlie.username}`,
  );

  // --- Documents (owned by Alice) ---
  const doc1 = await prisma.document.create({
    data: {
      title: "Project Roadmap 2026",
      ownerId: alice.id,
      isPublic: false,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: "Team Meeting Notes",
      ownerId: alice.id,
      isPublic: true,
      publicRole: "viewer",
    },
  });

  console.log(`✅ Created documents: "${doc1.title}", "${doc2.title}"`);

  // --- Permissions ---
  await prisma.permission.createMany({
    data: [
      { userId: bob.id, documentId: doc1.id, role: "editor" },
      { userId: charlie.id, documentId: doc2.id, role: "viewer" },
    ],
  });

  console.log(
    "✅ Granted permissions (Bob → doc1 editor, Charlie → doc2 viewer)",
  );

  // --- Comments on Document 1 ---
  await prisma.comment.createMany({
    data: [
      {
        content: "Great outline! Can we expand the Q2 section?",
        documentId: doc1.id,
        userId: bob.id,
        fromPos: 10,
        toPos: 45,
      },
      {
        content: "Agreed — and let’s add owners per milestone.",
        documentId: doc1.id,
        userId: alice.id,
        fromPos: 50,
        toPos: 90,
      },
    ],
  });

  console.log("✅ Created 2 comments on Document 1");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
