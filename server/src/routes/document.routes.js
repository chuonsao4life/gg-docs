import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  listTemplates,
  updateDocumentMetadata,
  listDocumentPermissions,
  shareDocument,
  updateDocumentPermission,
  deleteDocumentPermission,
  createDocumentComment,
  deleteDocumentComment,
  listDocumentComments,
  updateDocumentComment,
  updateDocumentCommentPosition,
  getDocumentShareSettings,
  updateDocumentShareSettings,
} from "../controllers/document.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/templates", listTemplates);
router.get("/", verifyToken, listDocuments);
router.post("/", verifyToken, createDocument);

router.get(
  "/:documentId",
  verifyToken,
  checkPermission(ROLES.VIEWER),
  getDocument,
);
router.put(
  "/:documentId",
  verifyToken,
  checkPermission(ROLES.EDITOR),
  updateDocumentMetadata,
);
router.patch(
  "/:documentId",
  verifyToken,
  checkPermission(ROLES.EDITOR),
  updateDocumentMetadata,
);
router.delete(
  "/:documentId",
  verifyToken,
  checkPermission(ROLES.OWNER),
  deleteDocument,
);

router.get(
  "/:documentId/permissions",
  verifyToken,
  checkPermission(ROLES.VIEWER),
  listDocumentPermissions,
);
router.post(
  "/:documentId/permissions",
  verifyToken,
  checkPermission(ROLES.OWNER),
  shareDocument,
);
router.patch(
  "/:documentId/permissions/:userId",
  verifyToken,
  checkPermission(ROLES.OWNER),
  updateDocumentPermission,
);
router.delete(
  "/:documentId/permissions/:userId",
  verifyToken,
  checkPermission(ROLES.OWNER),
  deleteDocumentPermission,
);

router.get(
  "/:documentId/share",
  verifyToken,
  checkPermission(ROLES.VIEWER),
  getDocumentShareSettings,
);
router.patch(
  "/:documentId/share",
  verifyToken,
  checkPermission(ROLES.OWNER),
  updateDocumentShareSettings,
);

router.get(
  "/:documentId/comments",
  verifyToken,
  checkPermission(ROLES.VIEWER),
  listDocumentComments,
);
router.post(
  "/:documentId/comments",
  verifyToken,
  checkPermission(ROLES.COMMENTER),
  createDocumentComment,
);
router.patch(
  "/:documentId/comments/:commentId/position",
  verifyToken,
  checkPermission(ROLES.COMMENTER),
  updateDocumentCommentPosition,
);
router.patch(
  "/:documentId/comments/:commentId",
  verifyToken,
  checkPermission(ROLES.VIEWER),
  updateDocumentComment,
);
router.delete(
  "/:documentId/comments/:commentId",
  verifyToken,
  checkPermission(ROLES.COMMENTER),
  deleteDocumentComment,
);

export default router;
