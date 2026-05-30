"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navbar } from "@/components/layout/Navbar";
import EditorMenuBar from "@/components/editor/EditorMenuBar";
import EditorDynamicToolbar from "@/components/editor/EditorDynamicToolbar";
import { MarginControls } from "@/components/editor/MarginControls";
import { PaginatedEditorShell, VerticalPageRuler } from "@/components/editor/PaginatedEditorShell";
import { PageRuler } from "@/components/editor/PageRuler";
import type { EditorMenuKey } from "@/types/editor-menu";
import type {
  EditorToolbarActions,
  EditorToolbarState,
} from "@/types/editor-toolbar";
import type { EditorSelectionRange } from "@/types/editor-selection";
import type { DocumentComment } from "@/types/comment";
import { DEFAULT_PAGE_MARGINS, type PageMargins } from "@/types/page-layout";
import { CommentPanel } from "@/components/comments/CommentPanel";
import { EditorAdapter } from "@/types/editor-adapter";
import {
  createDocumentComment,
  deleteDocumentComment,
  listDocumentComments,
  renameDashboardDocument,
} from "@/services/document.service";

function getCommentErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function AppLayout({
  children,
  documentId,
  title,
  editor,
  canEdit = true,
}: {
  children: ReactNode;
  documentId: string;
  title?: string;
  editor: EditorAdapter | null;
  canEdit?: boolean;
}) {
  const [activeMenu, setActiveMenu] = useState<EditorMenuKey>("format");
  const [selectedRange, setSelectedRange] =
    useState<EditorSelectionRange | null>(null);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentDraftRange, setCommentDraftRange] =
    useState<EditorSelectionRange | null>(null);
  const [pageMargins, setPageMargins] =
    useState<PageMargins>(DEFAULT_PAGE_MARGINS);
  const [showMarginControls, setShowMarginControls] = useState(false);
  const commentLoadRequestRef = useRef(0);
  const syncedCommentMarkIdsRef = useRef<Set<string>>(new Set());
  const recentlyCreatedCommentIdsRef = useRef<Set<string>>(new Set());
  const deletingCommentIdsRef = useRef<Set<string>>(new Set());

  const loadComments = useCallback(async () => {
    const requestId = commentLoadRequestRef.current + 1;
    commentLoadRequestRef.current = requestId;
    setIsLoadingComments(true);
    setCommentError(null);

    try {
      const nextComments = await listDocumentComments(documentId);
      if (commentLoadRequestRef.current !== requestId) return;
      setComments(nextComments);
    } catch (error) {
      if (commentLoadRequestRef.current !== requestId) return;
      const isForbidden =
        error instanceof Error &&
        (error.message.toLowerCase().includes("forbidden") ||
          error.message.toLowerCase().includes("no access"));
      if (!isForbidden) {
        console.warn("Unable to load comments", error);
        setCommentError(
          getCommentErrorMessage(error, "Unable to load comments."),
        );
      }
    } finally {
      if (commentLoadRequestRef.current === requestId) {
        setIsLoadingComments(false);
      }
    }
  }, [documentId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadComments();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadComments]);

  const handleChangeMenu = (menu: EditorMenuKey) => {
    console.log("Active menu:", menu);
    setActiveMenu(menu);
  };

  const hasValidRange = (
    range: EditorSelectionRange | null,
  ): range is EditorSelectionRange => {
    return Boolean(range && range.from < range.to && range.text.trim());
  };

  const removeCommentMark = useCallback(
    (range: EditorSelectionRange | null) => {
      if (!editor || !hasValidRange(range)) return;
      editor.removeCommentMark(range);
    },
    [editor],
  );

  const applyDraftCommentMark = (range: EditorSelectionRange | null) => {
    if (!editor || !hasValidRange(range)) return;
    editor.applyDraftCommentMark(range);
  };

  const clearDraftComment = useCallback(() => {
    removeCommentMark(commentDraftRange);
    setIsComposerOpen(false);
    setCommentDraftRange(null);
  }, [commentDraftRange, removeCommentMark]);

  const removeCommentMarkById = useCallback(
    (commentId: string) => {
      if (!editor) return;
      editor.removeCommentMarkById(commentId);
    },
    [editor],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setCommentError(null);
        await deleteDocumentComment(documentId, commentId);
        removeCommentMarkById(commentId);
        syncedCommentMarkIdsRef.current.delete(commentId);
        recentlyCreatedCommentIdsRef.current.delete(commentId);
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        );
        setActiveCommentId((current) =>
          current === commentId ? null : current,
        );
        clearDraftComment();
      } catch (error) {
        console.warn("Unable to delete comment", error);
        setCommentError(
          getCommentErrorMessage(error, "Unable to delete comment."),
        );
      }
    },
    [clearDraftComment, documentId, removeCommentMarkById],
  );

  useEffect(() => {
    if (!editor || comments.length === 0) return;

    comments.forEach((comment) => {
      if (
        typeof comment.fromPos === "number" &&
        typeof comment.toPos === "number" &&
        comment.fromPos < comment.toPos
      ) {
        editor.addCommentMark(comment.fromPos, comment.toPos, comment.id);
        syncedCommentMarkIdsRef.current.add(comment.id);
      }
    });
  }, [editor, comments]);

  const handleCommentMarksChange = useCallback(
    (existingCommentIds: string[]) => {
      const existingIds = new Set(existingCommentIds);
      existingCommentIds.forEach((commentId) => {
        syncedCommentMarkIdsRef.current.add(commentId);
        recentlyCreatedCommentIdsRef.current.delete(commentId);
        deletingCommentIdsRef.current.delete(commentId);
      });

      const removedIds = comments
        .filter((comment) => {
          if (
            !syncedCommentMarkIdsRef.current.has(comment.id) ||
            existingIds.has(comment.id)
          ) {
            return false;
          }

          return (
            !recentlyCreatedCommentIdsRef.current.has(comment.id) &&
            !deletingCommentIdsRef.current.has(comment.id)
          );
        })
        .map((comment) => comment.id);

      // [FEATURE]: Real-time Broadcast.
      // Nếu có một người khác vừa tạo comment, Yjs sẽ đồng bộ Mark sang máy này.
      // Máy này nhận được ID lạ (chưa có trong state comments) thì sẽ tự động fetch DB.
      const knownIds = new Set(comments.map(c => c.id));
      const hasUnknownIds = existingCommentIds.some(id => id !== "draft" && !knownIds.has(id));
      if (hasUnknownIds) {
        void loadComments();
      }

      // [FIX]: Vô hiệu hoá tính năng tự động dọn rác (auto-delete orphaned comments).
      // Việc tự động xoá sẽ gây ra race-condition khi Yjs chưa kịp tải xong text, 
      // dẫn đến việc Editor báo cáo thiếu mark và Frontend tự động xoá nhầm comment của Owner.
      // Bình luận mồ côi (khi text bị xoá) sẽ vẫn được giữ lại trong Comment Panel để user tự quyết định xoá bằng tay.
      
      // if (removedIds.length === 0) return;
      // const removedIdSet = new Set(removedIds);
      // removedIds.forEach((commentId) => {
      //   deletingCommentIdsRef.current.add(commentId);
      //   syncedCommentMarkIdsRef.current.delete(commentId);
      //   recentlyCreatedCommentIdsRef.current.delete(commentId);
      // });
      // setComments((prev) =>
      //   prev.filter((comment) => !removedIdSet.has(comment.id)),
      // );
      // setActiveCommentId((current) =>
      //   current && removedIdSet.has(current) ? null : current,
      // );
      // void Promise.allSettled(
      //   removedIds.map((commentId) =>
      //     deleteDocumentComment(documentId, commentId),
      //   ),
      // ).then((results) => {
      //   removedIds.forEach((commentId) => {
      //     deletingCommentIdsRef.current.delete(commentId);
      //   });
      //   if (results.some((result) => result.status === "rejected")) {
      //     setCommentError("Unable to delete removed comments.");
      //     void loadComments();
      //   }
      // });
    },
    [comments, documentId, loadComments],
  );

  const handleStartCommentFromSelection = () => {
    const browserSelection =
      typeof window !== "undefined"
        ? window.getSelection()?.toString().trim()
        : "";
    const fallbackRange: EditorSelectionRange = {
      from: 0,
      to: browserSelection?.length || 0,
      text: browserSelection || "Toàn bộ tài liệu",
    };
    const nextRange = selectedRange || fallbackRange;

    removeCommentMark(commentDraftRange);
    applyDraftCommentMark(nextRange);
    setIsCommentPanelOpen(true);
    setIsComposerOpen(true);
    setCommentDraftRange(nextRange);
    setSelectedRange(null);
    setActiveCommentId(null);
  };

  const handleSubmitComment = async (content: string) => {
    const trimmedContent = content.trim();
    if (!commentDraftRange || !trimmedContent) return;

    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      const commentPayload = {
        content: trimmedContent,
        selectedText: commentDraftRange.text,
        fromPos: commentDraftRange.from,
        toPos: commentDraftRange.to,
      };
      const newComment = await createDocumentComment(
        documentId,
        commentPayload,
      );

      if (
        editor &&
        newComment.fromPos !== null &&
        newComment.toPos !== null &&
        newComment.fromPos < newComment.toPos
      ) {
        recentlyCreatedCommentIdsRef.current.add(newComment.id);
        editor.removeCommentMark(commentDraftRange);
        editor.addCommentMark(newComment.fromPos, newComment.toPos, newComment.id);
        syncedCommentMarkIdsRef.current.add(newComment.id);
        window.setTimeout(() => {
          recentlyCreatedCommentIdsRef.current.delete(newComment.id);
        }, 500);
      } else {
        removeCommentMark(commentDraftRange);
      }

      setComments((prev) => [...prev, newComment]);
      setActiveCommentId(newComment.id);
      setIsComposerOpen(false);
      setIsCommentPanelOpen(true);
      setSelectedRange(null);
      setCommentDraftRange(null);
    } catch (error) {
      console.warn("Unable to create comment", error);
      setCommentError(
        getCommentErrorMessage(error, "Unable to create comment."),
      );
      throw error;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSelectComment = (commentId: string) => {
    clearDraftComment();
    setActiveCommentId(commentId);
    setIsCommentPanelOpen(true);
    setSelectedRange(null);
  };

  // Subscribe to editor adapter changes to re-render toolbar state
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (!editor) return;
    return editor.subscribe(() => {
      forceUpdate({});
    });
  }, [editor]);

  const toolbarActions: EditorToolbarActions = {
    onSave: () => console.log("save"),
    onUndo: canEdit ? () => editor?.undo() : undefined,
    onRedo: canEdit ? () => editor?.redo() : undefined,
    onBold: canEdit ? () => editor?.toggleBold() : undefined,
    onItalic: canEdit ? () => editor?.toggleItalic() : undefined,
    onUnderline: canEdit ? () => editor?.toggleUnderline() : undefined,
    onStyleChange: canEdit
      ? (style: string) => {
          const styleMap: { [key: string]: "paragraph" | "h1" | "h2" | "h3" } = {
            "Normal text": "paragraph",
            "Heading 1": "h1",
            "Heading 2": "h2",
            "Heading 3": "h3",
          };
          const val = styleMap[style] || style;
          if (val === "paragraph" || val === "h1" || val === "h2" || val === "h3") {
            editor?.setStyle(val);
          }
        }
      : undefined,
    onFontChange: canEdit ? (font: string) => editor?.setFontFamily(font) : undefined,
    onFontSizeChange: canEdit ? (size: string) => editor?.setFontSize(size) : undefined,
    onTextColor: canEdit ? (color: string) => editor?.setColor(color) : undefined,
    onHighlightColor: canEdit ? (color: string) => editor?.setHighlight(color) : undefined,
    onAlignLeft: canEdit ? () => editor?.setTextAlign("left") : undefined,
    onAlignCenter: canEdit ? () => editor?.setTextAlign("center") : undefined,
    onAlignRight: canEdit ? () => editor?.setTextAlign("right") : undefined,
    onBulletList: canEdit ? () => editor?.toggleBulletList() : undefined,
    onNumberedList: canEdit ? () => editor?.toggleOrderedList() : undefined,
    onChecklist: canEdit ? () => editor?.toggleTaskList() : undefined,
    onDecreaseIndent: canEdit ? () => editor?.liftListItem() : undefined,
    onIncreaseIndent: canEdit ? () => editor?.sinkListItem() : undefined,
    onInsertImage: () => console.log("insert image"),
    onInsertLink: () => console.log("insert link"),
    onAddComment: handleStartCommentFromSelection,
    onToggleMarginControls: () => setShowMarginControls((visible) => !visible),
  };

  const toolbarState: EditorToolbarState = {
    zoom: "100%",
    style: editor?.style || "paragraph",
    font: editor?.fontFamily || "Arial",
    fontSize: editor?.fontSize || "11",
    showRuler: false,
    showOutline: false,
    showMarginControls,
    canUndo: editor?.canUndo || false,
    canRedo: editor?.canRedo || false,
    activeMarks: {
      bold: editor?.activeMarks.bold || false,
      italic: editor?.activeMarks.italic || false,
      underline: editor?.activeMarks.underline || false,
    },
    activeAlignment: editor?.alignment || "left",
  };

  const editorChildren = React.isValidElement<Record<string, unknown>>(children)
    ? React.cloneElement(children, {
        selectedRange: isComposerOpen ? null : selectedRange,
        draftRange: commentDraftRange,
        comments,
        activeCommentId,
        pageMargins,
        onSelectionChange: (range: EditorSelectionRange | null) => {
          if (!isComposerOpen) setSelectedRange(range);
        },
        onStartComment: handleStartCommentFromSelection,
        onSelectComment: handleSelectComment,
        onCommentMarksChange: handleCommentMarksChange,
      })
    : children;

  return (
    <div className="flex h-screen flex-col print:h-auto print:block">
      <Navbar
        key={`${documentId}-${title}`}
        documentId={documentId}
        title={title}
        onExportPdf={() => window.print()}
        onRename={async (nextTitle) => {
          await renameDashboardDocument(documentId, nextTitle);
        }}
        onToggleComments={() => {
          setIsCommentPanelOpen((open) => !open);
          clearDraftComment();
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible print:block">
        <div className="print:hidden">
          {/* Menu bar + dynamic toolbar */}
          <EditorMenuBar
            activeMenu={activeMenu}
            onChangeMenu={handleChangeMenu}
          />
          <EditorDynamicToolbar
            activeMenu={activeMenu}
            actions={toolbarActions}
            state={toolbarState}
          />
        </div>

        <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
          <main className="flex-1 overflow-hidden bg-gray-100 print:overflow-visible print:bg-transparent print:block">
            <div className="flex h-full flex-col print:overflow-visible print:block">
              <div className="print:hidden">
                <PageRuler
                  margins={pageMargins}
                  onMarginsChange={setPageMargins}
                />
                {showMarginControls && (
                  <MarginControls
                    margins={pageMargins}
                    onChange={setPageMargins}
                  />
                )}
              </div>
              <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
                <div className="h-full shrink-0 z-10 print:hidden">
                  <VerticalPageRuler
                    margins={pageMargins}
                    onMarginsChange={setPageMargins}
                  />
                </div>
                <div className="flex-1 overflow-auto print:overflow-visible print:block">
                  <PaginatedEditorShell
                    margins={pageMargins}
                    onMarginsChange={setPageMargins}
                  >
                    {editorChildren}
                  </PaginatedEditorShell>
                </div>
              </div>
            </div>
          </main>

          {isCommentPanelOpen && (
            <div className="hidden w-80 shrink-0 md:block">
              <CommentPanel
                documentId={documentId}
                comments={comments}
                errorMessage={commentError}
                draftRange={commentDraftRange}
                isComposerOpen={isComposerOpen}
                isLoading={isLoadingComments}
                isSubmitting={isSubmittingComment}
                activeCommentId={activeCommentId}
                onRetry={loadComments}
                onClose={() => {
                  setIsCommentPanelOpen(false);
                  clearDraftComment();
                }}
                onSubmitComment={handleSubmitComment}
                onCancelComposer={clearDraftComment}
                onSelectComment={handleSelectComment}
                onDeleteComment={deleteComment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
