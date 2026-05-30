import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $getRoot,
  $createRangeSelection,
  $setSelection,
  $isElementNode,
  $isParagraphNode,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isHeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $wrapSelectionInMarkNode,
  $unwrapMarkNode,
  $isMarkNode,
  MarkNode,
} from "@lexical/mark";

import type { EditorAdapter } from "@/types/editor-adapter";
import type { EditorSelectionRange } from "@/types/editor-selection";

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

export class LexicalAdapter implements EditorAdapter {
  public readonly editor: LexicalEditor;

  private _canUndo = false;
  private _canRedo = false;
  private _activeMarks = { bold: false, italic: false, underline: false };
  private _fontFamily = "Arial";
  private _fontSize = "11";
  private _textColor = "#000000";
  private _highlightColor = "transparent";
  private _alignment: "left" | "center" | "right" = "left";
  private _style: "paragraph" | "h1" | "h2" | "h3" = "paragraph";
  private _isEmpty = true;

  private listeners = new Set<() => void>();

  constructor(editor: LexicalEditor) {
    this.editor = editor;

    // Listen to history commands to update undo/redo status
    this.editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        this._canUndo = payload;
        this.notifyListeners();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    this.editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        this._canRedo = payload;
        this.notifyListeners();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Watch for updates to keep formatting attributes in sync
    this.editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        this.updateState();
      });
      this.notifyListeners();
    });
  }

  private updateState() {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      try {
        this._activeMarks = {
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
        };

        this._fontFamily = $getSelectionStyleValueForProperty(
          selection,
          "font-family",
          "Arial"
        );
        this._fontSize = $getSelectionStyleValueForProperty(
          selection,
          "font-size",
          "11px"
        ).replace("px", "");
        this._textColor = $getSelectionStyleValueForProperty(
          selection,
          "color",
          "#000000"
        );
        this._highlightColor = $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "transparent"
        );

        const nodes = selection.getNodes();
        let alignment: "left" | "center" | "right" = "left";
        let style: "paragraph" | "h1" | "h2" | "h3" = "paragraph";

        if (nodes.length > 0) {
          const firstNode = nodes[0];
          const parent = firstNode.getParent();
          
          if ($isElementNode(parent)) {
            const format = parent.getFormatType();
            if (format === "left" || format === "center" || format === "right") {
              alignment = format;
            }
            
            const type = parent.getType();
            if (type === "heading") {
              const tag = (parent as HeadingNode).getTag();
              if (tag === "h1" || tag === "h2" || tag === "h3") {
                style = tag;
              }
            }
          }
        }
        
        this._alignment = alignment;
        this._style = style;
      } catch (error) {
        // Ignore stale selection offset errors during complex node mutations (like wrapping text in a comment MarkNode)
        console.warn("Ignored stale selection error during formatting extraction.");
      }
    }

    const root = $getRoot();
    this._isEmpty = root.getTextContentSize() === 0;
  }

  get canUndo() {
    return this._canUndo;
  }
  get canRedo() {
    return this._canRedo;
  }
  get activeMarks() {
    return this._activeMarks;
  }
  get fontFamily() {
    return this._fontFamily;
  }
  get fontSize() {
    return this._fontSize;
  }
  get textColor() {
    return this._textColor;
  }
  get highlightColor() {
    return this._highlightColor;
  }
  get alignment() {
    return this._alignment;
  }
  get style() {
    return this._style;
  }
  get isEmpty() {
    return this._isEmpty;
  }

  undo() {
    this.editor.dispatchCommand(UNDO_COMMAND, undefined);
  }

  redo() {
    this.editor.dispatchCommand(REDO_COMMAND, undefined);
  }

  toggleBold() {
    this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }

  toggleItalic() {
    this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }

  toggleUnderline() {
    this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }

  setStyle(style: "paragraph" | "h1" | "h2" | "h3") {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (style === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(style));
        }
      }
    });
  }

  setFontFamily(font: string) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-family": font });
      }
    });
  }

  setFontSize(size: string) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const pxValue = size.endsWith("px") ? size : `${size}px`;
        $patchStyleText(selection, { "font-size": pxValue });
      }
    });
  }

  setColor(color: string) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
  }

  setHighlight(color: string) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": color });
      }
    });
  }

  setTextAlign(alignment: "left" | "center" | "right") {
    this.editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  }

  toggleBulletList() {
    // Standard list toggling in Lexical uses commands
    const isBulletList = this._style as string === "bullet"; // Simple check
    if (isBulletList) {
      this.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      this.editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }

  toggleOrderedList() {
    const isOrderedList = this._style as string === "number";
    if (isOrderedList) {
      this.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      this.editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }

  toggleTaskList() {
    // Custom task list command if defined, otherwise insert bullet list
    this.toggleBulletList();
  }

  liftListItem() {
    this.editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }

  sinkListItem() {
    this.editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }

  // Comment implementation in Lexical
  applyDraftCommentMark(range: EditorSelectionRange) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapSelectionInMarkNode(selection, selection.isBackward(), "draft");
      }
    });
  }

  removeCommentMark(range: EditorSelectionRange | null) {
    // Unwrap all mark nodes containing draft ID
    this.editor.update(() => {
      const root = $getRoot();
      getDescendants(root).forEach((node) => {
        if ($isMarkNode(node) && node.hasID("draft")) {
          $unwrapMarkNode(node as any);
        }
      });
    });
  }

  removeCommentMarkById(commentId: string) {
    // Unwrap all mark nodes matching the specific commentId
    this.editor.update(() => {
      const root = $getRoot();
      getDescendants(root).forEach((node) => {
        if ($isMarkNode(node) && node.hasID(commentId)) {
          $unwrapMarkNode(node as any);
        }
      });
    });
  }

  addCommentMark(from: number, to: number, commentId: string) {
    this.editor.update(() => {
      const prevSelection = $getSelection();
      let currentOffset = 0;
      const root = $getRoot();
      let startNode = null;
      let startOffset = 0;
      let endNode = null;
      let endOffset = 0;

      const textNodes = root.getAllTextNodes();
      for (const node of textNodes) {
        const len = node.getTextContentSize();
        if (startNode === null && currentOffset + len >= from) {
          startNode = node;
          startOffset = from - currentOffset;
        }
        if (endNode === null && currentOffset + len >= to) {
          endNode = node;
          endOffset = to - currentOffset;
          break;
        }
        currentOffset += len;
      }

      if (startNode && endNode) {
        const selection = $createRangeSelection();
        selection.anchor.set(startNode.getKey(), startOffset, "text");
        selection.focus.set(endNode.getKey(), endOffset, "text");
        $setSelection(selection);
        $wrapSelectionInMarkNode(selection, false, commentId);
      }

      if (prevSelection) {
        $setSelection(prevSelection.clone());
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  updateUser(user: { name: string; color: string }) {
    // Handles collaborative cursor identification. Managed inside CollaborationPlugin context,
    // so we can expose this to update awareness if needed, but standard CollaborationPlugin
    // handles awareness state directly via its props.
  }
}
