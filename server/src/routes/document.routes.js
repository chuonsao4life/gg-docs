import { Router } from "express";
import {
  createComment,
  createDocument,
  deleteComment,
  deleteDocument,
  getDocument,
  getShareSettings,
  listComments,
  listDocuments,
  listTemplates,
  renameDocument,
  updateShareSettings,
} from "../controllers/document.controller.js";

const router = Router();

router.get("/templates", listTemplates);
router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:documentId", getDocument);
router.patch("/:documentId", renameDocument);
router.delete("/:documentId", deleteDocument);
router.get("/:documentId/share", getShareSettings);
router.patch("/:documentId/share", updateShareSettings);
router.get("/:documentId/comments", listComments);
router.post("/:documentId/comments", createComment);
router.delete("/:documentId/comments/:commentId", deleteComment);

export default router;
