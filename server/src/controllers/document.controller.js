import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const SHARE_ROLES = new Set(["viewer", "commenter", "editor"]);
const SNAPSHOT_RETENTION_LIMIT = 50;

const DOCUMENT_TEMPLATES = [
  {
    id: "blank",
    title: "Tài liệu trống",
    subtitle: "Bắt đầu từ trang trắng",
    accent: "emerald",
    preview: "blank",
  },
  {
    id: "meeting-notes",
    title: "Ghi chú cuộc họp",
    subtitle: "Agenda, quyết định, việc cần làm",
    accent: "sky",
    preview: "notes",
  },
  {
    id: "project-proposal",
    title: "Đề xuất dự án",
    subtitle: "Mục tiêu, phạm vi, ngân sách",
    accent: "amber",
    preview: "proposal",
  },
  {
    id: "product-brief",
    title: "Tóm tắt sản phẩm",
    subtitle: "Thông tin sản phẩm, insight, kế hoạch",
    accent: "rose",
    preview: "brief",
  },
  {
    id: "report",
    title: "Báo cáo",
    subtitle: "Tổng hợp kết quả và số liệu",
    accent: "violet",
    preview: "report",
  },
  {
    id: "resume",
    title: "Sơ yếu lý lịch",
    subtitle: "Hồ sơ cá nhân gọn gàng",
    accent: "slate",
    preview: "resume",
  },
];

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1] || null;
}

function getAuthUser(req) {
  const token = req.cookies?.accessToken || getBearerToken(req);
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function sanitizeTitle(title) {
  const trimmed = String(title || "").trim();
  return trimmed.slice(0, 200);
}

function getDefaultTitle(templateId) {
  if (!templateId || templateId === "blank") return "Tài liệu không có tiêu đề";
  const template = DOCUMENT_TEMPLATES.find((item) => item.id === templateId);
  return template ? `${template.title} mới` : "Tài liệu không có tiêu đề";
}

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar,
    displayName: [user.firstname, user.lastname].filter(Boolean).join(" "),
    initials: `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase() || user.username?.slice(0, 2).toUpperCase(),
  };
}

function formatDocument(document, currentUserId = null) {
  const owner = formatUser(document.owner);
  const permission = document.permissions?.find((item) => item.userId === currentUserId);
  const collaborators = document.permissions?.map((item) => formatUser(item.user)).filter(Boolean) || [];
  const role = document.ownerId === currentUserId ? "owner" : permission?.role || document.publicRole || "viewer";

  return {
    id: document.id,
    title: document.title,
    type: "document",
    role,
    owner,
    collaborators,
    collaboratorCount: collaborators.length,
    isPublic: document.isPublic,
    publicRole: document.publicRole,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    openedAt: document.updatedAt,
    preview: "document",
  };
}

function formatPermission(permission) {
  return {
    id: permission.id,
    role: permission.role,
    grantedAt: permission.grantedAt,
    user: formatUser(permission.user),
  };
}

function formatComment(comment) {
  return {
    id: comment.id,
    content: comment.content,
    selectedText: comment.selectedText || "",
    fromPos: comment.fromPos,
    toPos: comment.toPos,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    documentId: comment.documentId,
    user: formatUser(comment.user),
  };
}

function formatSnapshot(snapshot) {
  if (!snapshot) {
    return {
      snapshot: null,
      version: 0,
      createdAt: null,
    };
  }

  return {
    snapshot: Buffer.from(snapshot.snapshotData).toString("base64"),
    version: snapshot.version,
    createdAt: snapshot.createdAt,
  };
}

function canReadDocument(document, authUser) {
  return (
    document.isPublic ||
    document.ownerId === authUser?.id ||
    document.permissions.some((permission) => permission.userId === authUser?.id)
  );
}

function getRoleForUser(document, authUser) {
  if (document.ownerId === authUser?.id) return "owner";
  const permission = document.permissions.find((item) => item.userId === authUser?.id);
  return permission?.role || document.publicRole || null;
}

function canCommentDocument(document, authUser) {
  const role = getRoleForUser(document, authUser);
  return role === "owner" || role === "editor" || role === "commenter";
}

function canEditDocument(document, authUser) {
  const role = getRoleForUser(document, authUser);
  return role === "owner" || role === "editor";
}

async function pruneOldSnapshots(tx, documentId, keep = SNAPSHOT_RETENTION_LIMIT) {
  const oldSnapshots = await tx.snapshot.findMany({
    where: { documentId },
    orderBy: [
      { version: "desc" },
      { createdAt: "desc" },
    ],
    skip: keep,
    select: { id: true },
  });

  if (oldSnapshots.length === 0) return;

  await tx.snapshot.deleteMany({
    where: {
      id: {
        in: oldSnapshots.map((snapshot) => snapshot.id),
      },
    },
  });
}

export const listTemplates = async (_req, res) => {
  return res.json({ data: DOCUMENT_TEMPLATES });
};

export const listDocuments = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const search = String(req.query.search || "").trim();
    const ownerFilter = String(req.query.owner || "all");
    const sort = String(req.query.sort || "updatedAt");
    const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    const visibilityWhere = authUser
      ? ownerFilter === "me"
        ? { ownerId: authUser.id }
        : {
            OR: ownerFilter === "shared"
              ? [{ permissions: { some: { userId: authUser.id } } }]
              : [
                  { ownerId: authUser.id },
                  { isPublic: true },
                  { permissions: { some: { userId: authUser.id } } },
                ],
          }
      : { isPublic: true };

    const where = {
      AND: [
        visibilityWhere,
        search
          ? {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
      ],
    };

    const orderBy =
      sort === "title"
        ? { title: order }
        : { updatedAt: order };

    const documents = await prisma.document.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        owner: true,
        permissions: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.json({
      data: documents.map((document) => formatDocument(document, authUser?.id)),
    });
  } catch (err) {
    console.error("[listDocuments] error:", err);
    return res.status(500).json({ message: "Unable to load documents." });
  }
};

export const getDocument = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        owner: true,
        permissions: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canReadDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have access to this document." });
    }

    return res.json({ data: formatDocument(document, authUser?.id) });
  } catch (err) {
    console.error("[getDocument] error:", err);
    return res.status(500).json({ message: "Unable to load document." });
  }
};

export const createDocument = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to create a document." });
    }

    const title = sanitizeTitle(req.body.title) || getDefaultTitle(req.body.templateId);
    const document = await prisma.document.create({
      data: {
        title,
        ownerId: authUser.id,
        isPublic: false,
      },
      include: {
        owner: true,
        permissions: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(201).json({ data: formatDocument(document, authUser.id) });
  } catch (err) {
    console.error("[createDocument] error:", err);
    return res.status(500).json({ message: "Unable to create document." });
  }
};

export const renameDocument = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to rename a document." });
    }

    const title = sanitizeTitle(req.body.title);
    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const current = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!current) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canEditDocument(current, authUser)) {
      return res.status(403).json({ message: "You do not have permission to rename this document." });
    }

    const document = await prisma.document.update({
      where: { id: req.params.documentId },
      data: { title },
      include: {
        owner: true,
        permissions: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.json({ data: formatDocument(document, authUser.id) });
  } catch (err) {
    console.error("[renameDocument] error:", err);
    return res.status(500).json({ message: "Unable to rename document." });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to delete a document." });
    }

    const current = await prisma.document.findUnique({
      where: { id: req.params.documentId },
    });

    if (!current) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (current.ownerId !== authUser.id) {
      return res.status(403).json({ message: "Only the owner can delete this document." });
    }

    await prisma.document.delete({
      where: { id: req.params.documentId },
    });

    return res.json({ data: { id: req.params.documentId } });
  } catch (err) {
    console.error("[deleteDocument] error:", err);
    return res.status(500).json({ message: "Unable to delete document." });
  }
};

export const getDocumentSnapshot = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canReadDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have access to this document." });
    }

    const snapshot = await prisma.snapshot.findFirst({
      where: { documentId: req.params.documentId },
      orderBy: [
        { version: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.json({ data: formatSnapshot(snapshot) });
  } catch (err) {
    console.error("[getDocumentSnapshot] error:", err);
    return res.status(500).json({ message: "Unable to load document snapshot." });
  }
};

export const saveDocumentSnapshot = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to save this document." });
    }

    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canEditDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have permission to save this document." });
    }

    const snapshotBase64 = String(req.body.snapshot || "");
    if (!snapshotBase64) {
      return res.status(400).json({ message: "Snapshot payload is required." });
    }

    let snapshotData;
    try {
      snapshotData = Buffer.from(snapshotBase64, "base64");
    } catch {
      return res.status(400).json({ message: "Snapshot payload is invalid." });
    }

    if (snapshotData.length === 0) {
      return res.status(400).json({ message: "Snapshot payload is empty." });
    }

    const latest = await prisma.snapshot.findFirst({
      where: { documentId: req.params.documentId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const version = (latest?.version || 0) + 1;
    const savedSnapshot = await prisma.$transaction(async (tx) => {
      const snapshot = await tx.snapshot.create({
        data: {
          version,
          snapshotData,
          documentId: req.params.documentId,
          createdBy: authUser.id,
        },
      });

      await tx.document.update({
        where: { id: req.params.documentId },
        data: { updatedAt: new Date() },
      });

      await pruneOldSnapshots(tx, req.params.documentId);

      return snapshot;
    });

    return res.status(201).json({ data: formatSnapshot(savedSnapshot) });
  } catch (err) {
    console.error("[saveDocumentSnapshot] error:", err);
    return res.status(500).json({ message: "Unable to save document snapshot." });
  }
};

export const getShareSettings = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to view sharing settings." });
    }

    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        owner: true,
        permissions: {
          include: {
            user: true,
          },
          orderBy: { grantedAt: "desc" },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canReadDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have access to this document." });
    }

    return res.json({
      data: {
        document: formatDocument(document, authUser.id),
        permissions: document.permissions.map(formatPermission),
        isPublic: document.isPublic,
        publicRole: document.publicRole,
        shareUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/documents/${document.id}`,
      },
    });
  } catch (err) {
    console.error("[getShareSettings] error:", err);
    return res.status(500).json({ message: "Unable to load sharing settings." });
  }
};

export const updateShareSettings = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to share this document." });
    }

    const current = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!current) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (current.ownerId !== authUser.id) {
      return res.status(403).json({ message: "Only the owner can change sharing settings." });
    }

    const data = {};
    if (typeof req.body.isPublic === "boolean") {
      data.isPublic = req.body.isPublic;
    }
    if (req.body.publicRole !== undefined) {
      const publicRole = req.body.publicRole || null;
      if (publicRole && !SHARE_ROLES.has(publicRole)) {
        return res.status(400).json({ message: "Invalid public role." });
      }
      data.publicRole = publicRole;
    }

    if (Object.keys(data).length > 0) {
      await prisma.document.update({
        where: { id: req.params.documentId },
        data,
      });
    }

    const inviteEmail = String(req.body.inviteEmail || "").trim().toLowerCase();
    const role = String(req.body.role || "viewer");
    if (inviteEmail) {
      if (!SHARE_ROLES.has(role)) {
        return res.status(400).json({ message: "Invalid invite role." });
      }

      const invitedUser = await prisma.user.findUnique({ where: { email: inviteEmail } });
      if (!invitedUser) {
        return res.status(404).json({ message: "No user found with that email." });
      }
      if (invitedUser.id === authUser.id) {
        return res.status(400).json({ message: "Owner already has full access." });
      }

      await prisma.permission.upsert({
        where: {
          userId_documentId: {
            userId: invitedUser.id,
            documentId: req.params.documentId,
          },
        },
        create: {
          userId: invitedUser.id,
          documentId: req.params.documentId,
          role,
        },
        update: { role },
      });
    }

    const removePermissionId = String(req.body.removePermissionId || "").trim();
    if (removePermissionId) {
      await prisma.permission.deleteMany({
        where: {
          id: removePermissionId,
          documentId: req.params.documentId,
        },
      });
    }

    return getShareSettings(req, res);
  } catch (err) {
    console.error("[updateShareSettings] error:", err);
    return res.status(500).json({ message: "Unable to update sharing settings." });
  }
};

export const listComments = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canReadDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have access to this document." });
    }

    const comments = await prisma.comment.findMany({
      where: { documentId: req.params.documentId },
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });

    return res.json({ data: comments.map(formatComment) });
  } catch (err) {
    console.error("[listComments] error:", err);
    return res.status(500).json({ message: "Unable to load comments." });
  }
};

export const createComment = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to comment." });
    }

    const document = await prisma.document.findUnique({
      where: { id: req.params.documentId },
      include: {
        permissions: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!canCommentDocument(document, authUser)) {
      return res.status(403).json({ message: "You do not have permission to comment on this document." });
    }

    const content = String(req.body.content || "").trim();
    if (!content) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        selectedText: String(req.body.selectedText || "").slice(0, 1000),
        fromPos: Number.isFinite(Number(req.body.fromPos)) ? Number(req.body.fromPos) : null,
        toPos: Number.isFinite(Number(req.body.toPos)) ? Number(req.body.toPos) : null,
        documentId: req.params.documentId,
        userId: authUser.id,
      },
      include: { user: true },
    });

    return res.status(201).json({ data: formatComment(comment) });
  } catch (err) {
    console.error("[createComment] error:", err);
    return res.status(500).json({ message: "Unable to create comment." });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in to delete comments." });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
      include: { document: true },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.userId !== authUser.id && comment.document.ownerId !== authUser.id) {
      return res.status(403).json({ message: "You do not have permission to delete this comment." });
    }

    await prisma.comment.delete({ where: { id: req.params.commentId } });

    return res.json({ data: { id: req.params.commentId } });
  } catch (err) {
    console.error("[deleteComment] error:", err);
    return res.status(500).json({ message: "Unable to delete comment." });
  }
};
