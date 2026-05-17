import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  listTemplates,
  updateDocumentMetadata,
} from "../controllers/document.controller.js";

const router = Router();

router.get("/templates", listTemplates);
router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:documentId", getDocument);
router.put("/:documentId", updateDocumentMetadata);
router.patch("/:documentId", updateDocumentMetadata);
router.delete("/:documentId", deleteDocument);

export default router;
