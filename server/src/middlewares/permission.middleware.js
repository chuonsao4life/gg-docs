import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { ROLES, ROLE_WEIGHTS } from "../constants/roles.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const checkPermission = (requiredRole) => async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!req.user || !userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { documentId } = req.params;
    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, message: "documentId is required" });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        ownerId: true,
        isPublic: true,
        publicRole: true,
        permissions: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    let currentRole = null;

    if (userId === document.ownerId) {
      currentRole = ROLES.OWNER;
    } else if (document.permissions.length > 0) {
      currentRole = document.permissions[0].role.toLowerCase();
    } else if (document.isPublic && document.publicRole) {
      currentRole = document.publicRole.toLowerCase();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: No access to this document",
      });
    }

    if (!ROLE_WEIGHTS[currentRole] || !ROLE_WEIGHTS[requiredRole]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified" });
    }

    if (ROLE_WEIGHTS[currentRole] >= ROLE_WEIGHTS[requiredRole]) {
      req.documentRole = currentRole;
      req.userId = userId;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires ${requiredRole} role or higher`,
      });
    }
  } catch (err) {
    console.error("[checkPermission] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
