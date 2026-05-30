import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { ROLES } from "../constants/roles.js";

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

const createCommentSchema = z
  .object({
    content: z.string().trim().min(1).max(2000),
    selectedText: z.string().default(""),
    fromPos: z.number().int().nonnegative().nullable().optional(),
    toPos: z.number().int().nonnegative().nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.fromPos == null ||
      value.toPos == null ||
      value.fromPos < value.toPos,
    {
      message: "Invalid comment range.",
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

  // Priority: Manual permission explicitly granted to the user
  const manualPermission = document.permissions?.find(
    (permission) => permission.userId === userId
  );
  if (manualPermission) {
    return manualPermission.role;
  }

  // Fallback: Link-based public permission
  if (document.isPublic && document.publicRole) {
    return document.publicRole;
  }

  return null;
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
    openedAt: document.openedAt,
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
    openedAt: document.openedAt,
    snapshot: snapshotToBase64(document.snapshot),
    snapshotVersion: document.snapshotVersion,
  };
}

function formatComment(comment) {
  return {
    id: comment.id,
    documentId: comment.documentId,
    content: comment.content,
    selectedText: comment.selectedText || "",
    fromPos: comment.fromPos,
    toPos: comment.toPos,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: {
      id: comment.user.id,
      email: comment.user.email,
      username: comment.user.username,
      firstname: comment.user.firstname,
      lastname: comment.user.lastname,
      avatar: comment.user.avatar ?? null,
      displayName: userName(comment.user),
    },
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
    const search = String(req.query.search || "").trim();

    if (!["me", "shared", "all"].includes(owner)) {
      return failure(res, 400, "Invalid owner filter.");
    }
    if (!["createdAt", "updatedAt", "openedAt", "title"].includes(sortField)) {
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
    const where = {
      AND: [
        accessWhere,
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

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
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
        openedAt: document.openedAt,
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

    const openedDocument = await prisma.document.update({
      where: { id: req.params.documentId },
      data: { openedAt: new Date() },
      include: {
        owner: true,
        permissions: {
          include: { user: true },
          orderBy: { grantedAt: "asc" },
        },
      },
    });

    return success(res, 200, {
      document: formatDetailedDocument(openedDocument),
      myPermission: getPermissionFlags(role),
      collaborators: openedDocument.permissions.map(formatCollaborator),
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

export const listDocumentPermissions = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!documentId) return failure(res, 400, "documentId is required");

    const permissions = await prisma.permission.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    return success(
      res,
      200,
      permissions.map((p) => ({
        id: p.id,
        role: p.role,
        grantedAt: p.grantedAt,
        userId: p.userId,
        user: p.user,
      })),
    );
  } catch (err) {
    console.error("[listDocumentPermissions] error:", err);
    return failure(res, 500, "Internal server error");
  }
};

export const shareDocument = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { documentId } = req.params;
    const { email, role } = req.body;

    if (!documentId) return failure(res, 400, "documentId is required");
    if (!email) return failure(res, 400, "email is required");
    if (!role) return failure(res, 400, "role is required");

    const validRoles = [ROLES.VIEWER, ROLES.COMMENTER, ROLES.EDITOR];
    if (!validRoles.includes(role)) {
      return failure(
        res,
        400,
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });
    if (!document) return failure(res, 404, "Document not found");

    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
        username: true,
      },
    });
    if (!targetUser) return failure(res, 404, "User not found");

    if (targetUser.id === document.ownerId) {
      return failure(res, 400, "Cannot share document with the owner");
    }

    const permission = await prisma.permission.upsert({
      where: {
        userId_documentId: {
          userId: targetUser.id,
          documentId,
        },
      },
      update: { role },
      create: {
        role,
        userId: targetUser.id,
        documentId,
      },
      include: {
        user: true,
      },
    });

    return success(
      res,
      201,
      {
        id: permission.id,
        role: permission.role,
        grantedAt: permission.grantedAt,
        userId: permission.userId,
        user: targetUser,
      },
      "Document shared successfully",
    );
  } catch (err) {
    console.error("[shareDocument] error:", err);
    return failure(res, 500, "Internal server error");
  }
};

export const updateDocumentPermission = async (req, res) => {
  try {
    const { documentId, userId } = req.params;
    const { role } = req.body;

    if (!documentId) return failure(res, 400, "documentId is required");
    if (!userId) return failure(res, 400, "userId is required");
    if (!role) return failure(res, 400, "role is required");

    const validRoles = [ROLES.VIEWER, ROLES.COMMENTER, ROLES.EDITOR];
    if (!validRoles.includes(role)) {
      return failure(
        res,
        400,
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });
    if (!document) return failure(res, 404, "Document not found");

    if (userId === document.ownerId) {
      return failure(res, 400, "Cannot update owner's permission");
    }

    const updatedPermission = await prisma.permission.update({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    return success(
      res,
      200,
      {
        id: updatedPermission.id,
        role: updatedPermission.role,
        grantedAt: updatedPermission.grantedAt,
        userId: updatedPermission.userId,
        user: updatedPermission.user,
      },
      "Permission updated successfully",
    );
  } catch (err) {
    console.error("[updateDocumentPermission] error:", err);
    if (err.code === "P2025") {
      return failure(res, 404, "Permission not found");
    }
    return failure(res, 500, "Internal server error");
  }
};

export const deleteDocumentPermission = async (req, res) => {
  try {
    const { documentId, userId } = req.params;

    if (!documentId) return failure(res, 400, "documentId is required");
    if (!userId) return failure(res, 400, "userId is required");

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });
    if (!document) return failure(res, 404, "Document not found");

    if (userId === document.ownerId) {
      return failure(res, 400, "Cannot revoke owner's access");
    }

    await prisma.permission.delete({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });

    return success(res, 200, undefined, "Access revoked successfully");
  } catch (err) {
    console.error("[deleteDocumentPermission] error:", err);
    if (err.code === "P2025") {
      return failure(res, 404, "Permission not found");
    }
    return failure(res, 500, "Internal server error");
  }
};

export const getDocumentShareSettings = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!documentId) return failure(res, 400, "documentId is required");

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: true,
        permissions: {
          include: { user: true },
        },
      },
    });

    if (!document) return failure(res, 404, "Document not found");

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

    const permissionsList = document.permissions
      .filter((p) => p.userId !== document.ownerId)
      .map((p) => ({
        id: p.id,
        role: p.role,
        grantedAt: p.grantedAt,
        user: {
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
        },
      }));

    return success(res, 200, {
      document: {
        id: document.id,
        title: document.title,
        type: "document",
        role: "owner",
        owner: ownerData,
        collaborators: permissionsList.map((p) => p.user),
        collaboratorCount: permissionsList.length,
        isPublic: document.isPublic,
        publicRole: document.publicRole,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        openedAt: document.openedAt || document.updatedAt,
        preview: "document",
      },
      permissions: permissionsList,
      isPublic: document.isPublic,
      publicRole: document.publicRole,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/documents/${documentId}`,
    });
  } catch (err) {
    console.error("[getDocumentShareSettings] error:", err);
    return failure(res, 500, "Internal server error");
  }
};

export const updateDocumentShareSettings = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { isPublic, publicRole, inviteEmail, role, removePermissionId } =
      req.body;

    if (!documentId) return failure(res, 400, "documentId is required");

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: true,
        permissions: {
          include: { user: true },
        },
      },
    });

    if (!document) return failure(res, 404, "Document not found");

    const updateData = {};
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (publicRole !== undefined) updateData.publicRole = publicRole;

    if (inviteEmail && role) {
      const targetUser = await prisma.user.findUnique({
        where: { email: inviteEmail },
      });
      if (!targetUser) return failure(res, 404, "User not found");

      if (targetUser.id !== document.ownerId) {
        await prisma.permission.upsert({
          where: {
            userId_documentId: {
              userId: targetUser.id,
              documentId,
            },
          },
          update: { role },
          create: {
            role,
            userId: targetUser.id,
            documentId,
          },
        });
      }
    }

    if (removePermissionId) {
      await prisma.permission.delete({
        where: { id: removePermissionId },
      });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: updateData,
      });
    }

    const updatedDoc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: true,
        permissions: {
          include: { user: true },
        },
      },
    });

    const ownerData = {
      id: updatedDoc.owner.id,
      email: updatedDoc.owner.email,
      username: updatedDoc.owner.username,
      firstname: updatedDoc.owner.firstname,
      lastname: updatedDoc.owner.lastname,
      avatar: updatedDoc.owner.avatar,
      displayName: [updatedDoc.owner.firstname, updatedDoc.owner.lastname]
        .filter(Boolean)
        .join(" "),
      initials:
        `${updatedDoc.owner.firstname?.[0] || ""}${updatedDoc.owner.lastname?.[0] || ""}`.toUpperCase() ||
        updatedDoc.owner.username?.slice(0, 2).toUpperCase(),
    };

    const permissionsList = updatedDoc.permissions
      .filter((p) => p.userId !== updatedDoc.ownerId)
      .map((p) => ({
        id: p.id,
        role: p.role,
        grantedAt: p.grantedAt,
        user: {
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
        },
      }));

    return success(res, 200, {
      document: {
        id: updatedDoc.id,
        title: updatedDoc.title,
        type: "document",
        role: "owner",
        owner: ownerData,
        collaborators: permissionsList.map((p) => p.user),
        collaboratorCount: permissionsList.length,
        isPublic: updatedDoc.isPublic,
        publicRole: updatedDoc.publicRole,
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
        openedAt: updatedDoc.openedAt || updatedDoc.updatedAt,
        preview: "document",
      },
      permissions: permissionsList,
      isPublic: updatedDoc.isPublic,
      publicRole: updatedDoc.publicRole,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/documents/${documentId}`,
    });
  } catch (err) {
    console.error("[updateDocumentShareSettings] error:", err);
    return failure(res, 500, "Internal server error");
  }
};

export const listDocumentComments = async (req, res) => {
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

    const comments = await prisma.comment.findMany({
      where: { documentId: req.params.documentId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return success(res, 200, comments.map(formatComment));
  } catch (err) {
    console.error("[listDocumentComments] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const createDocumentComment = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const parsed = createCommentSchema.safeParse(req.body);
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
    if (!COMMENT_ROLES.has(role)) {
      return failure(res, 403, "No comment permission");
    }

    const comment = await prisma.comment.create({
      data: {
        documentId: req.params.documentId,
        userId: authUser.userId,
        content: parsed.data.content,
        selectedText: parsed.data.selectedText,
        fromPos: parsed.data.fromPos ?? null,
        toPos: parsed.data.toPos ?? null,
      },
      include: { user: true },
    });

    return success(res, 201, formatComment(comment), "Comment created");
  } catch (err) {
    console.error("[createDocumentComment] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};

export const deleteDocumentComment = async (req, res) => {
  try {
    const authUser = requireUser(req, res);
    if (!authUser) return;

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
      include: {
        document: {
          include: {
            owner: true,
            permissions: {
              include: { user: true },
              orderBy: { grantedAt: "asc" },
            },
          },
        },
      },
    });

    if (!comment || comment.documentId !== req.params.documentId) {
      return failure(res, 404, "Not found");
    }

    const role = getMyRole(comment.document, authUser.userId);
    if (!role) {
      return failure(res, 403, "No permission");
    }

    const canDelete =
      comment.userId === authUser.userId ||
      comment.document.ownerId === authUser.userId;
    if (!canDelete) {
      return failure(res, 403, "Permission denied");
    }

    await prisma.comment.delete({ where: { id: req.params.commentId } });

    return success(res, 200, { id: req.params.commentId }, "Comment deleted");
  } catch (err) {
    console.error("[deleteDocumentComment] error:", err);
    return failure(res, 500, "Internal server error.");
  }
};
