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
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ImageNode } from "./nodes/ImageNodes";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
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
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalAdapter } from "./adapters/LexicalAdapter";
import type { DocumentComment } from "@/types/comment";
import type { EditorSelectionRange } from "@/types/editor-selection";
import type { PageMargins } from "@/types/page-layout";
import { FloatingCommentButton } from "@/components/comments/FloatingCommentButton";
import { getStableColor, getHighlightColor } from "@/lib/colors";

import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";

// Custom Lexical Theme
const theme = {
  paragraph: "relative mb-2 leading-normal",
  heading: {
    h1: "text-[36px] font-bold mb-4 mt-6 leading-tight", 
    h2: "text-[30px] font-semibold mb-3 mt-4 leading-tight",
    h3: "text-[24px] font-medium mb-2 mt-4 leading-tight", 
  },
  list: {
    ol: "list-decimal list-inside ml-6 mb-4",
    ul: "list-disc list-inside ml-6 mb-4",
    listitem: "mb-1 ml-2",
    listitemUnchecked: "relative !list-none pl-6 !ml-0 mb-1 cursor-pointer before:absolute before:left-0 before:top-[0.6em] before:-translate-y-1/2 before:w-3.5 before:h-3.5 before:border before:border-slate-500 before:bg-white before:rounded-none before:content-['']",
    listitemChecked: "relative !list-none pl-6 !ml-0 mb-1 line-through text-slate-400 cursor-pointer before:absolute before:left-0 before:top-[0.6em] before:-translate-y-1/2 before:w-3.5 before:h-3.5 before:bg-blue-500 before:rounded-none before:content-['✓'] before:text-white before:text-[10px] before:font-bold before:flex before:items-center before:justify-center",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  link: "text-blue-600 underline cursor-pointer",
  mark: "comment-highlight",
  table: "border-collapse border border-slate-300 w-full my-4 table-fixed bg-white",
  tableCell: "border border-slate-300 p-2 min-w-[75px] align-top relative bg-white",
  tableCellHeader: "bg-white font-bold border border-slate-300 p-2",
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

  const syncCommentDom = useCallback(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    rootElement.querySelectorAll(".comment-highlight").forEach((el) => {
      el.removeAttribute("data-comment-id");
      el.removeAttribute("data-comment-draft");
      el.removeAttribute("data-active-comment");
      (el as HTMLElement).style.removeProperty("--comment-color");
      (el as HTMLElement).style.removeProperty("--comment-base-color");
    });

    editor.getEditorState().read(() => {
      const root = $getRoot();
      getDescendants(root).forEach((node) => {
        if (!$isMarkNode(node)) return;

        const element = editor.getElementByKey(node.getKey());
        if (!element) return;

        const ids = node.getIDs();
        const commentId = ids.find((id) => id !== "draft") ?? ids[0];
        if (!commentId) return;

        element.setAttribute("data-comment-id", commentId);
        if (commentId === "draft" || node.hasID("draft")) {
          element.setAttribute("data-comment-draft", "true");
        }

        const comment = comments.find((item) => item.id === commentId);
        if (comment) {
          const identifier = comment.user.id || comment.user.username;
          element.style.setProperty("--comment-color", getHighlightColor(identifier));
          element.style.setProperty("--comment-base-color", getStableColor(identifier));
        }

        if (activeCommentId && ids.includes(activeCommentId)) {
          element.setAttribute("data-active-comment", "true");
        }
      });
    });
  }, [activeCommentId, comments, editor]);

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
    syncCommentDom();
    emitCommentMarks();
    return editor.registerUpdateListener(() => {
      syncCommentDom();
      emitCommentMarks();
    });
  }, [editor, emitCommentMarks, syncCommentDom]);

  useEffect(() => {
    syncCommentDom();
  }, [syncCommentDom]);

  useEffect(() => {
    if (!activeCommentId) return;

    const frameId = window.requestAnimationFrame(() => {
      const rootElement = editor.getRootElement();
      const activeElement = rootElement?.querySelector<HTMLElement>(
        `[data-comment-id="${CSS.escape(activeCommentId)}"]`,
      );

      if (!activeElement) return;

      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      editor.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeCommentId, editor]);

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

      if (element.tagName === "TABLE" || element.getAttribute('data-lexical-table') === 'true') {
        physicalY += h + mt + mb;
        continue;
      }

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

// 5. Plugin tự động đồng bộ Style của chữ lên Dấu chấm/Số (THÊM MỚI Ở ĐÂY)
function LexicalListStylePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      window.requestAnimationFrame(() => {
        const rootElement = editor.getRootElement();
        if (!rootElement) return;

        const listItems = rootElement.querySelectorAll("li");
        listItems.forEach((li) => {
          const firstText = li.querySelector("span");
          if (firstText) {
            li.style.fontSize = firstText.style.fontSize;
            li.style.fontFamily = firstText.style.fontFamily;
            li.style.color = firstText.style.color;
          }
        });
      });
    });

    return () => {
      removeUpdateListener();
    };
  }, [editor]);

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
    nodes: [
      HeadingNode, 
      QuoteNode, 
      TableNode,
      TableRowNode,
      TableCellNode,
      ListNode, 
      ListItemNode, 
      LinkNode, 
      MarkNode,
      ImageNode,
      HorizontalRuleNode,
    ],
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
            <ContentEditable className="focus:outline-none min-h-full prose prose-sm max-w-none editor-content" 
            style={{ fontSize: "11px", fontFamily: "Arial, sans-serif" }}/>
            
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ListPlugin />
        <CheckListPlugin />
        
        {/* Kích hoạt plugin đồng bộ ở đây */}
        <LexicalListStylePlugin />
        
        <LinkPlugin />
        <ClickableLinkPlugin />
        <TablePlugin />
        <HorizontalRulePlugin />
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