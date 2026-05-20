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
  {
    id: "blank",
    title: "Blank document",
    subtitle: "Start from a blank page",
    accent: "emerald",
    preview: "blank",
  },
  {
    id: "meeting-notes",
    title: "Meeting notes",
    subtitle: "Agenda, decisions, and next steps",
    accent: "sky",
    preview: "notes",
  },
  {
    id: "project-proposal",
    title: "Project proposal",
    subtitle: "Goals, scope, and budget",
    accent: "amber",
    preview: "proposal",
  },
  {
    id: "report",
    title: "Report",
    subtitle: "Summaries and findings",
    accent: "violet",
    preview: "report",
  },
];

const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
  folderId: z.string().uuid().nullable().optional(),
  templateId: z.string().optional(),
});

const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    folderId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => value.title !== undefined || value.folderId !== undefined,
    {
      message: "At least one updatable field is required.",
    },
  );

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

function sanitizeTitle(title) {
  const trimmed = String(title || "").trim();
  return trimmed.slice(0, 200);
}

function getDefaultTitle(templateId) {
  if (!templateId || templateId === "blank") return "Untitled document";
  const template = DOCUMENT_TEMPLATES.find((item) => item.id === templateId);
  return template ? template.title : "Untitled document";
}

function snapshotToBase64(snapshot) {
  if (!snapshot) return null;
  return Buffer.from(snapshot).toString("base64");
}

function userName(user) {
  return (
    [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    ""
  );
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
  return (
    document.permissions?.find((permission) => permission.userId === userId)
      ?.role || null
  );
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
  const ownerData = {
    id: document.owner.id,
    email: document.owner.email,
    username: document.owner.username,
    firstname: document.owner.firstname,
    lastname: document.owner.lastname,
    avatar: document.owner.avatar,
    displayName: [document.owner.firstname, document.owner.lastname]
      .filter(Boolean)
      .join(" "),
    initials:
      `${document.owner.firstname?.[0] || ""}${document.owner.lastname?.[0] || ""}`.toUpperCase() ||
      document.owner.username?.slice(0, 2).toUpperCase(),
  };

  const collaboratorsList =
    document.permissions
      ?.filter((p) => p.userId !== userId)
      .map((p) => ({
        id: p.user.id,
        email: p.user.email,
        username: p.user.username,
        firstname: p.user.firstname,
        lastname: p.user.lastname,
        avatar: p.user.avatar,
        displayName: [p.user.firstname, p.user.lastname]
          .filter(Boolean)
          .join(" "),
        initials:
          `${p.user.firstname?.[0] || ""}${p.user.lastname?.[0] || ""}`.toUpperCase() ||
          p.user.username?.slice(0, 2).toUpperCase(),
      })) || [];

  return {
    id: document.id,
    title: document.title,
    type: "document",
    role: getMyRole(document, userId),
    owner: ownerData,
    collaborators: collaboratorsList,
    collaboratorCount: collaboratorsList.length,
    isPublic: document.isPublic ?? false,
    publicRole: document.publicRole ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    openedAt: document.updatedAt,
    preview: "document",
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
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const sortField = String(req.query.sort || "updatedAt");
    const order = String(req.query.order || "desc");
    const owner = String(req.query.owner || "all");

    if (!["me", "shared", "all"].includes(owner)) {
      return failure(res, 400, "Invalid owner filter.");
    }
    if (!["createdAt", "updatedAt", "title"].includes(sortField)) {
      return failure(res, 400, "Invalid sort field.");
    }
    if (!["asc", "desc"].includes(order)) {
      return failure(res, 400, "Invalid order.");
    }

    const userId = authUser.userId;
    const accessWhere =
      owner === "me"
        ? { ownerId: userId }
        : owner === "shared"
          ? { ownerId: { not: userId }, permissions: { some: { userId } } }
          : {
              OR: [{ ownerId: userId }, { permissions: { some: { userId } } }],
            };

    const [total, documents] = await Promise.all([
      prisma.document.count({ where: accessWhere }),
      prisma.document.findMany({
        where: accessWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: order },
        include: {
          owner: true,
          permissions: {
            include: { user: true },
            orderBy: { grantedAt: "asc" },
          },
        },
      }),
    ]);

    return success(
      res,
      200,
      documents.map((document) => formatListDocument(document, userId)),
    );
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

    const { title, content, folderId, templateId } = parsed.data;
    const finalTitle = sanitizeTitle(title || getDefaultTitle(templateId));
    const snapshot = content ? Buffer.from(content, "utf8") : null;

    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          title: finalTitle,
          folderId: folderId || null,
          snapshot,
          snapshotVersion: 1,
          ownerId: authUser.userId,
          isPublic: false,
        },
        include: {
          owner: true,
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

    const ownerData = {
      id: document.owner.id,
      email: document.owner.email,
      username: document.owner.username,
      firstname: document.owner.firstname,
      lastname: document.owner.lastname,
      avatar: document.owner.avatar,
      displayName: [document.owner.firstname, document.owner.lastname]
        .filter(Boolean)
        .join(" "),
      initials:
        `${document.owner.firstname?.[0] || ""}${document.owner.lastname?.[0] || ""}`.toUpperCase() ||
        document.owner.username?.slice(0, 2).toUpperCase(),
    };

    return res.status(201).json({
      success: true,
      data: {
        id: document.id,
        title: document.title,
        type: "document",
        role: "owner",
        owner: ownerData,
        collaborators: [],
        collaboratorCount: 0,
        isPublic: document.isPublic ?? false,
        publicRole: document.publicRole ?? null,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        openedAt: document.updatedAt,
        preview: "document",
      },
      message: "Document created",
    });
  } catch (err) {
    console.error("[createDocument] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const getDocument = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const { document, role } = await findAccessibleDocument(
      req.params.documentId,
      authUser.userId,
    );
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

    const { document, role } = await findAccessibleDocument(
      req.params.documentId,
      authUser.userId,
    );
    if (!document) {
      return failure(res, 404, "Not found");
    }
    if (!EDIT_ROLES.has(role)) {
      return failure(res, 403, "No edit permission");
    }

    const data = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.folderId !== undefined)
      data.folderId = parsed.data.folderId;

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

    return success(
      res,
      200,
      {
        document: formatDetailedDocument(updated),
      },
      "Document updated",
    );
  } catch (err) {
    console.error("[updateDocumentMetadata] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const { document, role } = await findAccessibleDocument(
      req.params.documentId,
      authUser.userId,
    );
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
