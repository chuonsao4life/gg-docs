"use client";

import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";

import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  LexicalEditor as LexicalEditorType,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { MarkNode, $isMarkNode } from "@lexical/mark";

import { LexicalAdapter } from "./adapters/LexicalAdapter";
import type { DocumentComment } from "@/types/comment";
import type { EditorSelectionRange } from "@/types/editor-selection";
import type { PageMargins } from "@/types/page-layout";
import { FloatingCommentButton } from "@/components/comments/FloatingCommentButton";
import { getStableColor, getHighlightColor } from "@/lib/colors";

import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

// Custom Lexical Theme
const theme = {
  paragraph: "relative mb-2 leading-7",
  heading: {
    h1: "text-2xl font-bold mb-4 mt-6",
    h2: "text-xl font-semibold mb-3 mt-4",
    h3: "text-lg font-medium mb-2 mt-4",
  },
  list: {
    ol: "list-decimal list-inside mb-4",
    ul: "list-disc list-inside mb-4",
    listitem: "ml-4 mb-1",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  mark: "comment-highlight",
};

interface LexicalEditorProps {
  documentId: string;
  doc: Y.Doc;
  yProvider: LiveblocksYjsProvider | null;
  onReady?: (adapter: LexicalAdapter) => void;
  selectedRange?: EditorSelectionRange | null;
  draftRange?: EditorSelectionRange | null;
  comments?: DocumentComment[];
  activeCommentId?: string | null;
  pageMargins?: PageMargins;
  onSelectionChange?: (range: EditorSelectionRange | null) => void;
  onStartComment?: () => void;
  onSelectComment?: (commentId: string) => void;
  onCommentMarksChange?: (commentIds: string[]) => void;
  canEdit?: boolean;
  currentUserInfo?: { name: string; color: string };
}

function getDescendants(node: any): any[] {
  const descendants: any[] = [];
  if (typeof node.getChildren === "function") {
    const children = node.getChildren();
    for (const child of children) {
      descendants.push(child);
      descendants.push(...getDescendants(child));
    }
  }
  return descendants;
}

// 1. Helper to register LexicalAdapter with parent page component
function RegisterEditorPlugin({ onReady }: { onReady?: (adapter: LexicalAdapter) => void }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (onReady && !hasInitialized.current) {
      onReady(new LexicalAdapter(editor));
      hasInitialized.current = true;
    }
  }, [editor, onReady]);

  return null;
}

// Helper to get selection indices from selection
function getGlobalSelectionRange(editor: LexicalEditorType): EditorSelectionRange | null {
  let range: EditorSelectionRange | null = null;
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      return;
    }

    const anchor = selection.anchor;
    const focus = selection.focus;

    const root = $getRoot();
    const textNodes = root.getAllTextNodes();

    let startOffset = -1;
    let endOffset = -1;
    let currentOffset = 0;

    const anchorKey = anchor.key;
    const focusKey = focus.key;

    let firstNodeKey = anchorKey;
    let firstOffset = anchor.offset;
    let secondNodeKey = focusKey;
    let secondOffset = focus.offset;

    const anchorIdx = textNodes.findIndex((n) => n.getKey() === anchorKey);
    const focusIdx = textNodes.findIndex((n) => n.getKey() === focusKey);

    if (anchorIdx > focusIdx || (anchorIdx === focusIdx && anchor.offset > focus.offset)) {
      firstNodeKey = focusKey;
      firstOffset = focus.offset;
      secondNodeKey = anchorKey;
      secondOffset = anchor.offset;
    }

    for (const node of textNodes) {
      const key = node.getKey();
      const len = node.getTextContentSize();

      if (key === firstNodeKey) {
        startOffset = currentOffset + firstOffset;
      }
      if (key === secondNodeKey) {
        endOffset = currentOffset + secondOffset;
        break;
      }
      currentOffset += len;
    }

    if (startOffset !== -1 && endOffset !== -1) {
      const text = selection.getTextContent();
      range = { from: startOffset, to: endOffset, text };
    }
  });
  return range;
}

// 2. Plugin to handle Selection states and updates
function LexicalSelectionPlugin({
  onSelectionChange,
}: {
  onSelectionChange?: (range: EditorSelectionRange | null) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const range = getGlobalSelectionRange(editor);
      onSelectionChange?.(range);
    });
  }, [editor, onSelectionChange]);

  return null;
}

// 3. Plugin to handle Comment Highlight actions and database sync
function LexicalCommentPlugin({
  comments = [],
  activeCommentId,
  onSelectComment,
  onCommentMarksChange,
}: {
  comments?: DocumentComment[];
  activeCommentId?: string | null;
  onSelectComment?: (commentId: string) => void;
  onCommentMarksChange?: (commentIds: string[]) => void;
}) {
  const [editor] = useLexicalComposerContext();

  // Scan and report all Comment ID Marks
  const emitCommentMarks = useCallback(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const commentIds = new Set<string>();
      getDescendants(root).forEach((node) => {
        if ($isMarkNode(node)) {
          node.getIDs().forEach((id) => {
            if (id !== "draft") {
              commentIds.add(id);
            }
          });
        }
      });
      onCommentMarksChange?.([...commentIds]);
    });
  }, [editor, onCommentMarksChange]);

  useEffect(() => {
    emitCommentMarks();
    return editor.registerUpdateListener(() => {
      emitCommentMarks();
    });
  }, [editor, emitCommentMarks]);

  // Sync active comment ID visual state
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const syncHighlights = () => {
      rootElement.querySelectorAll("[data-comment-id]").forEach((el) => {
        const commentId = el.getAttribute("data-comment-id");
        
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            const identifier = comment.user.id || comment.user.username;
            const baseColor = getStableColor(identifier);
            const bgColor = getHighlightColor(identifier);
            (el as HTMLElement).style.setProperty("--comment-color", bgColor);
            (el as HTMLElement).style.setProperty("--comment-base-color", baseColor);
        }

        if (activeCommentId && commentId === activeCommentId) {
          el.setAttribute("data-active-comment", "true");
        } else {
          el.removeAttribute("data-active-comment");
        }
      });
    };

    syncHighlights();
    const observer = new MutationObserver(syncHighlights);
    observer.observe(rootElement, { subtree: true, childList: true, attributes: true });
    return () => observer.disconnect();
  }, [editor, activeCommentId, comments]);

  return null;
}

// 4. Custom CSS-margin A4 Pagination Simulation
function LexicalPaginationPlugin({
  margins,
  pageWidth = 794,
  pageHeight = 1123,
}: {
  margins?: PageMargins;
  pageWidth?: number;
  pageHeight?: number;
}) {
  const [editor] = useLexicalComposerContext();

  const recalculatePagination = useCallback(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement || !margins) return;

    const children = rootElement.children;
    const usableHeight = pageHeight - margins.top - margins.bottom;
    const gap = 32; // vertical spacing between A4 pages in UI (gap-8 = 32px)

    // Phase 1: Reset styles (Invalidates layout once)
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      child.style.marginTop = "";
    }

    // Phase 2: Read DOM metrics (Forces exactly ONE synchronous layout)
    const metrics: { h: number; mt: number; mb: number; element: HTMLElement }[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      // Use getBoundingClientRect().height instead of offsetHeight to preserve sub-pixel accuracy 
      // and prevent accumulated margin drift on later pages.
      const h = child.getBoundingClientRect().height;
      const style = window.getComputedStyle(child);
      const mt = parseFloat(style.marginTop || "0");
      const mb = parseFloat(style.marginBottom || "0");
      metrics.push({ h, mt, mb, element: child });
    }

    // Phase 3: Calculate & Write new styles
    let physicalY = 0; // Relative to the start of Page 1's usable area
    const jumpDistance = margins.bottom + gap + margins.top;
    const cycleLength = usableHeight + jumpDistance;

    for (let i = 0; i < metrics.length; i++) {
      const { h, mt, mb, element } = metrics[i];

      const elementStart = physicalY + mt;
      const positionInCycle = elementStart % cycleLength;

      let pushDistance = 0;

      // If the element starts inside the gap
      if (positionInCycle >= usableHeight) {
          pushDistance = cycleLength - positionInCycle;
      } 
      // Or if it starts in the usable area, but its content ends inside the gap 
      // (and it's not already at the very top of the page!)
      else if (positionInCycle > 1 && positionInCycle + h > usableHeight) {
          pushDistance = cycleLength - positionInCycle;
      }

      if (pushDistance > 0) {
          element.style.marginTop = `${mt + pushDistance}px`;
          physicalY += pushDistance;
      }

      physicalY += h + mt + mb;
    }
  }, [editor, margins, pageHeight]);

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      window.requestAnimationFrame(recalculatePagination);
    });

    window.addEventListener("resize", recalculatePagination);
    recalculatePagination();

    return () => {
      removeUpdateListener();
      window.removeEventListener("resize", recalculatePagination);
    };
  }, [editor, recalculatePagination, margins]);

  return null;
}

function LexicalEditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

export default function LexicalEditor({
  documentId,
  doc,
  yProvider,
  onReady,
  selectedRange,
  draftRange,
  comments,
  activeCommentId,
  pageMargins,
  onSelectionChange,
  onStartComment,
  onSelectComment,
  onCommentMarksChange,
  canEdit,
  currentUserInfo,
}: LexicalEditorProps) {
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const initialConfig = {
    editorState: null,
    namespace: "GoogleDocsClone",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, MarkNode],
    editable: canEdit ?? false,
    onError: (error: Error) => console.error("[Lexical Error]", error),
  };

  const handlePointerDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const markElement = target.closest<HTMLElement>("[data-comment-id]");
      const isDraft = markElement?.getAttribute("data-comment-draft") === "true";
      const commentId = markElement?.getAttribute("data-comment-id");

      if (commentId && !isDraft) {
        event.preventDefault();
        event.stopPropagation();
        onSelectComment?.(commentId);
      }
    },
    [onSelectComment]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        ref={editorWrapperRef}
        className="relative h-full w-full"
        onMouseDownCapture={handlePointerDown}
      >
        <FloatingCommentButton
          visible={Boolean(selectedRange)}
          onClick={onStartComment ?? (() => undefined)}
        />

        <RichTextPlugin
          contentEditable={
            <ContentEditable className="focus:outline-none min-h-full prose prose-sm max-w-none editor-content" />
          }
          placeholder={
            <div className="absolute top-0 left-0 pointer-events-none text-muted-foreground text-sm pl-1 pt-1 opacity-50">
              Start writing here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />

        {/* Real-time Collaboration */}
        {yProvider && (
          <LexicalCollaboration>
            <CollaborationPlugin
              id={documentId}
              providerFactory={useCallback(
                (id, yjsDocMap) => {
                  yjsDocMap.set(id, doc);
                  return yProvider as any;
                },
                [doc, yProvider]
              )}
              shouldBootstrap={false}
              username={currentUserInfo?.name}
              cursorColor={currentUserInfo?.color}
              awarenessData={useMemo(
                () =>
                  currentUserInfo
                    ? { name: currentUserInfo.name, color: currentUserInfo.color }
                    : undefined,
                [currentUserInfo?.name, currentUserInfo?.color]
              )}
            />
          </LexicalCollaboration>
        )}

        {/* State bridges */}
        <LexicalEditablePlugin editable={canEdit ?? false} />
        <RegisterEditorPlugin onReady={onReady} />
        <LexicalSelectionPlugin onSelectionChange={onSelectionChange} />
        <LexicalCommentPlugin
          comments={comments}
          activeCommentId={activeCommentId}
          onSelectComment={onSelectComment}
          onCommentMarksChange={onCommentMarksChange}
        />

        {/* Pagination simulation */}
        <LexicalPaginationPlugin margins={pageMargins} />
      </div>
    </LexicalComposer>
  );
}
