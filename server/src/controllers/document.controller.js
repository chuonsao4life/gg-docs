import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";

const EDIT_ROLES = new Set(["owner", "editor"]);
const COMMENT_ROLES = new Set(["owner", "editor", "commenter"]);

const DOCUMENT_TEMPLATES = [
  { id: "blank", title: "Blank document", subtitle: "Start from a blank page", accent: "emerald", preview: "blank" },
  { id: "meeting-notes", title: "Meeting notes", subtitle: "Agenda, decisions, and next steps", accent: "sky", preview: "notes" },
  { id: "project-proposal", title: "Project proposal", subtitle: "Goals, scope, and budget", accent: "amber", preview: "proposal" },
  { id: "report", title: "Report", subtitle: "Summaries and findings", accent: "violet", preview: "report" },
];

const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().optional(),
  folderId: z.string().uuid().nullable().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  folderId: z.string().uuid().nullable().optional(),
}).strict().refine((value) => value.title !== undefined || value.folderId !== undefined, {
  message: "At least one updatable field is required.",
});

function success(res, status, data, message) {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
  });
}

function failure(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1] || null;
}

function getAuthenticatedUser(req) {
  const existingUser = req.user;
  if (existingUser?.userId || existingUser?.id) {
    return {
      userId: existingUser.userId || existingUser.id,
      ...existingUser,
    };
  }

  const token = req.cookies?.accessToken || getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.userId || decoded.id,
      ...decoded,
    };
  } catch {
    return null;
  }
}

function requireUser(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser?.userId) {
    failure(res, 401, "Unauthorized");
    return null;
  }
  return authUser;
}

function snapshotToBase64(snapshot) {
  if (!snapshot) return null;
  return Buffer.from(snapshot).toString("base64");
}

function userName(user) {
  return [user?.firstname, user?.lastname].filter(Boolean).join(" ") || user?.username || user?.email || "";
}

function formatCollaborator(permission) {
  return {
    id: permission.id,
    userId: permission.userId,
    role: permission.role,
    name: userName(permission.user),
    email: permission.user?.email,
    username: permission.user?.username,
  };
}

function getMyRole(document, userId) {
  if (document.ownerId === userId) return "owner";
  return document.permissions?.find((permission) => permission.userId === userId)?.role || null;
}

function getPermissionFlags(role) {
  return {
    role,
    canEdit: EDIT_ROLES.has(role),
    canComment: COMMENT_ROLES.has(role),
    canShare: role === "owner",
  };
}

function formatListDocument(document, userId) {
  return {
    id: document.id,
    title: document.title,
    ownerId: document.ownerId,
    ownerName: userName(document.owner),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    myRole: getMyRole(document, userId),
    collaborators: document.permissions?.map(formatCollaborator) || [],
    isStarred: document.isStarred,
  };
}

function formatDetailedDocument(document) {
  return {
    id: document.id,
    title: document.title,
    ownerId: document.ownerId,
    ownerName: userName(document.owner),
    folderId: document.folderId,
    isStarred: document.isStarred,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    snapshot: snapshotToBase64(document.snapshot),
    snapshotVersion: document.snapshotVersion,
  };
}

async function findAccessibleDocument(documentId, userId) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: true,
      permissions: {
        include: { user: true },
        orderBy: { grantedAt: "asc" },
      },
    },
  });

  if (!document) return { document: null, role: null };
  return { document, role: getMyRole(document, userId) };
}

export const listTemplates = async (_req, res) => {
  return success(res, 200, DOCUMENT_TEMPLATES);
};

export const listDocuments = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || "20", 10), 1), 100);
    const sort = String(req.query.sort || "-createdAt");
    const filter = String(req.query.filter || "all");

    if (!["owned", "shared", "all"].includes(filter)) {
      return failure(res, 400, "Invalid filter.");
    }
    if (!["createdAt", "-createdAt"].includes(sort)) {
      return failure(res, 400, "Invalid sort.");
    }

    const userId = authUser.userId;
    const accessWhere = filter === "owned"
      ? { ownerId: userId }
      : filter === "shared"
        ? { ownerId: { not: userId }, permissions: { some: { userId } } }
        : {
            OR: [
              { ownerId: userId },
              { permissions: { some: { userId } } },
            ],
          };

    const [total, documents] = await Promise.all([
      prisma.document.count({ where: accessWhere }),
      prisma.document.findMany({
        where: accessWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: sort === "createdAt" ? "asc" : "desc" },
        include: {
          owner: true,
          permissions: {
            include: { user: true },
            orderBy: { grantedAt: "asc" },
          },
        },
      }),
    ]);

    return success(res, 200, {
      documents: documents.map((document) => formatListDocument(document, userId)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[listDocuments] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const createDocument = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return failure(res, 400, "Invalid input");
    }

    const { title, content, folderId } = parsed.data;
    const snapshot = content ? Buffer.from(content, "utf8") : null;

    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          title,
          folderId: folderId || null,
          snapshot,
          snapshotVersion: 1,
          ownerId: authUser.userId,
        },
      });

      await tx.permission.create({
        data: {
          documentId: created.id,
          userId: authUser.userId,
          role: "owner",
        },
      });

      return created;
    });

    return success(res, 201, {
      document: {
        id: document.id,
        title: document.title,
        ownerId: document.ownerId,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    }, "Document created");
  } catch (err) {
    console.error("[createDocument] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const getDocument = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const { document, role } = await findAccessibleDocument(req.params.documentId, authUser.userId);
    if (!document) {
      return failure(res, 404, "Not found");
    }
    if (!role) {
      return failure(res, 403, "No permission");
    }

    return success(res, 200, {
      document: formatDetailedDocument(document),
      myPermission: getPermissionFlags(role),
      collaborators: document.permissions.map(formatCollaborator),
    });
  } catch (err) {
    console.error("[getDocument] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const updateDocumentMetadata = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const parsed = updateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return failure(res, 400, "Invalid input");
    }

    const { document, role } = await findAccessibleDocument(req.params.documentId, authUser.userId);
    if (!document) {
      return failure(res, 404, "Not found");
    }
    if (!EDIT_ROLES.has(role)) {
      return failure(res, 403, "No edit permission");
    }

    const data = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.folderId !== undefined) data.folderId = parsed.data.folderId;

    const updated = await prisma.document.update({
      where: { id: req.params.documentId },
      data,
      include: {
        owner: true,
        permissions: {
          include: { user: true },
          orderBy: { grantedAt: "asc" },
        },
      },
    });

    return success(res, 200, {
      document: formatDetailedDocument(updated),
    }, "Document updated");
  } catch (err) {
    console.error("[updateDocumentMetadata] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const { document, role } = await findAccessibleDocument(req.params.documentId, authUser.userId);
    if (!document) {
      return failure(res, 404, "Not found");
    }
    if (role !== "owner") {
      return failure(res, 403, "Only owner can delete");
    }

    await prisma.document.delete({ where: { id: req.params.documentId } });
    return success(res, 200, undefined, "Document deleted");
  } catch (err) {
    console.error("[deleteDocument] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};
