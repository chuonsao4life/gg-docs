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

  // --- 10 Users ---
  const usersToCreate = Array.from({ length: 10 }).map((_, i) => ({
    email: `user${i + 1}@example.com`,
    username: `user${i + 1}`,
    firstname: `User`,
    lastname: `${i + 1}`,
    hashedPassword,
  }));

  const createdUsers = [];
  for (const u of usersToCreate) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }

  console.log(`✅ Created 10 users: user1 to user10 (password: password123)`);

  // --- 3 Documents ---
  // Doc 1: Owner=user1, Editor=user2, Commenter=user3
  // Doc 2: Owner=user4, Editor=user5, Commenter=user6
  // Doc 3: Owner=user7, Editor=user8, Commenter=user9
  
  const doc1 = await prisma.document.create({
    data: {
      title: "Project Roadmap 2026",
      ownerId: createdUsers[0].id, // user1
      isPublic: false,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: "Team Meeting Notes",
      ownerId: createdUsers[3].id, // user4
      isPublic: false,
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      title: "Product Launch Plan",
      ownerId: createdUsers[6].id, // user7
      isPublic: true,
      publicRole: "viewer",
    },
  });

  console.log(`✅ Created 3 documents: "${doc1.title}", "${doc2.title}", "${doc3.title}"`);

  // --- Permissions (1 editor, 1 commenter per document) ---
  await prisma.permission.createMany({
    data: [
      // Doc 1
      { userId: createdUsers[1].id, documentId: doc1.id, role: "editor" },      // user2
      { userId: createdUsers[2].id, documentId: doc1.id, role: "commenter" },   // user3
      
      // Doc 2
      { userId: createdUsers[4].id, documentId: doc2.id, role: "editor" },      // user5
      { userId: createdUsers[5].id, documentId: doc2.id, role: "commenter" },   // user6
      
      // Doc 3
      { userId: createdUsers[7].id, documentId: doc3.id, role: "editor" },      // user8
      { userId: createdUsers[8].id, documentId: doc3.id, role: "commenter" },   // user9
    ],
  });

  console.log("✅ Granted permissions (1 editor, 1 commenter for each document)");

  // --- Comments on Document 1 ---
  await prisma.comment.createMany({
    data: [
      {
        content: "Great outline! Can we expand the Q2 section?",
        documentId: doc1.id,
        userId: createdUsers[1].id, // user2 (editor)
        fromPos: 10,
        toPos: 45,
      },
      {
        content: "Agreed — and let’s add owners per milestone.",
        documentId: doc1.id,
        userId: createdUsers[0].id, // user1 (owner)
        fromPos: 50,
        toPos: 90,
      },
      {
        content: "I can help with the design tasks.",
        documentId: doc1.id,
        userId: createdUsers[2].id, // user3 (commenter)
        fromPos: 100,
        toPos: 120,
      }
    ],
  });

  console.log("✅ Created 3 comments on Document 1");
  console.log("🎉 Seeding complete! You can now test document and permission routes.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });