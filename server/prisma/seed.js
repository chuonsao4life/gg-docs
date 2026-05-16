import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function snapshot(content) {
  return Buffer.from(content, "utf8");
}

async function createDocumentWithPermissions({
  title,
  owner,
  content,
  folderId = null,
  isStarred = false,
  collaborators = [],
}) {
  const document = await prisma.document.create({
    data: {
      title,
      ownerId: owner.id,
      folderId,
      isStarred,
      snapshot: snapshot(content),
      snapshotVersion: 1,
      permissions: {
        create: [
          {
            userId: owner.id,
            role: "owner",
          },
          ...collaborators.map((collaborator) => ({
            userId: collaborator.user.id,
            role: collaborator.role,
          })),
        ],
      },
    },
  });

  console.log(`Created document "${document.title}" for ${owner.username}`);
  return document;
}

async function main() {
  console.log("Starting database seed...");

  console.log("Cleaning existing records...");
  await prisma.comment.deleteMany();
  await prisma.snapshot.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating mock users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
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

  console.log(`Created users: ${alice.username}, ${bob.username}, ${charlie.username}`);

  console.log("Creating documents and permissions...");
  const folderPlanning = "11111111-1111-4111-8111-111111111111";
  const folderReports = "22222222-2222-4222-8222-222222222222";

  const roadmap = await createDocumentWithPermissions({
    title: "Project Roadmap 2026",
    owner: alice,
    folderId: folderPlanning,
    isStarred: true,
    content: "Project Roadmap 2026\nQ1: discovery\nQ2: implementation\nQ3: launch",
    collaborators: [
      { user: bob, role: "editor" },
      { user: charlie, role: "viewer" },
    ],
  });

  const meetingNotes = await createDocumentWithPermissions({
    title: "Team Meeting Notes",
    owner: bob,
    content: "Weekly sync notes\n- Review blockers\n- Confirm owners\n- Update timeline",
    collaborators: [
      { user: alice, role: "viewer" },
    ],
  });

  const report = await createDocumentWithPermissions({
    title: "Release Report",
    owner: charlie,
    folderId: folderReports,
    isStarred: true,
    content: "Release Report\nStatus: green\nRisks: low\nNext steps: monitor feedback",
    collaborators: [
      { user: alice, role: "editor" },
      { user: bob, role: "viewer" },
    ],
  });

  await createDocumentWithPermissions({
    title: "Private Draft",
    owner: alice,
    content: "Private draft content that only Alice can access.",
  });

  console.log("Creating optional snapshot history records...");
  await prisma.snapshot.createMany({
    data: [
      {
        documentId: roadmap.id,
        createdBy: alice.id,
        version: 1,
        snapshotData: snapshot("Roadmap initial version"),
      },
      {
        documentId: meetingNotes.id,
        createdBy: bob.id,
        version: 1,
        snapshotData: snapshot("Meeting notes initial version"),
      },
      {
        documentId: report.id,
        createdBy: charlie.id,
        version: 1,
        snapshotData: snapshot("Release report initial version"),
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
