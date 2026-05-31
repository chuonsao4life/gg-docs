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
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import {
  $wrapSelectionInMarkNode,
  $unwrapMarkNode,
  $isMarkNode,
  MarkNode,
} from "@lexical/mark";

import {
  INSERT_TABLE_COMMAND,
  $insertTableRowAtSelection,
  $insertTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
} from "@lexical/table";

import type { EditorAdapter } from "@/types/editor-adapter";
import type { EditorSelectionRange } from "@/types/editor-selection";

import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $createImageNode } from "../nodes/ImageNodes";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";

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
  
  private _alignment: "left" | "center" | "right" | "justify" = "left";
  private _style: "paragraph" | "h1" | "h2" | "h3" | "bullet" | "number" | "check" = "paragraph";
  
  private _isEmpty = true;
  
  private _lastSelection: any = null;

  private listeners = new Set<() => void>();

  constructor(editor: LexicalEditor) {
    this.editor = editor;

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

    this.editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          this._lastSelection = selection.clone();
        }
        
        this.updateState();
      });
      this.notifyListeners();
    });
  }

  private _restoreSelection() {
    let selection = $getSelection();
    if (!$isRangeSelection(selection) && this._lastSelection !== null) {
      $setSelection(this._lastSelection.clone());
      return $getSelection();
    }
    return selection;
  }

  private updateState() {
    const root = $getRoot();
    this._isEmpty = root.getTextContentSize() === 0;
    const selection = $getSelection();
    
    if ($isRangeSelection(selection)) {
      try {
        this._activeMarks = {
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
        };

        let rawFontFamily = $getSelectionStyleValueForProperty(selection, "font-family", "Arial");
        let rawFontSize = $getSelectionStyleValueForProperty(selection, "font-size", "11px");

        this._fontFamily = rawFontFamily.replace(/['"]/g, "");
        this._fontSize = rawFontSize.replace(/[^0-9.]/g, "");

        this._textColor = $getSelectionStyleValueForProperty(selection, "color", "#000000");
        this._highlightColor = $getSelectionStyleValueForProperty(selection, "background-color", "transparent");

        const nodes = selection.getNodes();
        let alignment: "left" | "center" | "right" | "justify" = "left";
        let style: "paragraph" | "h1" | "h2" | "h3" | "bullet" | "number" | "check" = "paragraph";

        if (nodes.length > 0) {
          const firstNode = nodes[0];
          let currentNode: any = firstNode.getParent();
          
          if ($isElementNode(currentNode)) {
            const format = currentNode.getFormatType();
            if (format === "left" || format === "center" || format === "right" || format === "justify") alignment = format;
          }

          while (currentNode !== null && currentNode !== root) {
            if ($isListNode(currentNode)) {
              const listType = (currentNode as ListNode).getListType();
              style = listType === "number" ? "number" : listType === "check" ? "check" : "bullet";
              break;
            }
            if (currentNode.getType() === "heading") {
              style = (currentNode as HeadingNode).getTag() as any;
              break;
            }
            currentNode = currentNode.getParent();
          }
        }
        
        this._alignment = alignment;
        this._style = style as any;

        // Xử lý bật sáng nút Bold trên thanh Toolbar nếu đang ở chế độ Heading
        if (style === "h1" || style === "h2" || style === "h3") {
          this._activeMarks.bold = true;
        }

        // Bù trừ size UI cho Heading
        if (rawFontSize === "11px" || rawFontSize === "") {
          if (style === "h1") this._fontSize = "36";
          else if (style === "h2") this._fontSize = "30";
          else if (style === "h3") this._fontSize = "24";
        }

      } catch (error) {
        console.warn("Ignored stale selection error during formatting extraction.");
      }
    } 
    else {
      const firstTextNode = root.getAllTextNodes()[0];
      
      if (firstTextNode && typeof firstTextNode.getStyle === 'function') {
        const styleStr = firstTextNode.getStyle() || "";
        const extractStyle = (prop: string, fallback: string) => {
          const regex = new RegExp(`${prop}\\s*:\\s*([^;]+)`);
          const match = styleStr.match(regex);
          return match ? match[1].trim() : fallback;
        };

        this._fontFamily = extractStyle("font-family", "Arial").replace(/['"]/g, "");
        let rawFontSize = extractStyle("font-size", "11px");
        this._fontSize = rawFontSize.replace(/[^0-9.]/g, "");
        
        this._textColor = extractStyle("color", "#000000");
        this._highlightColor = extractStyle("background-color", "transparent");
        
        let currentNode: any = firstTextNode.getParent();
        this._style = "paragraph";

        if ($isElementNode(currentNode)) {
          const format = currentNode.getFormatType();
          if (format === "left" || format === "center" || format === "right" || format === "justify") this._alignment = format;
        }

        while (currentNode !== null && currentNode !== root) {
          if ($isListNode(currentNode)) {
            const listType = (currentNode as ListNode).getListType();
            this._style = listType === "number" ? "number" : listType === "check" ? "check" : "bullet";
            break;
          }
          if (currentNode.getType() === "heading") {
            this._style = (currentNode as HeadingNode).getTag() as any;
            break;
          }
          currentNode = currentNode.getParent();
        }

        if (this._style === "h1" || this._style === "h2" || this._style === "h3") {
          this._activeMarks.bold = true;
        }

        if (rawFontSize === "11px" || !styleStr.includes("font-size")) {
          if (this._style === "h1") this._fontSize = "36";
          else if (this._style === "h2") this._fontSize = "30";
          else if (this._style === "h3") this._fontSize = "24";
        }

      } else {
        this._fontFamily = "Arial";
        this._fontSize = "11";
        this._textColor = "#000000";
        this._highlightColor = "transparent";
        this._style = "paragraph";
        this._alignment = "left";
      }
    }
  }

  get canUndo() { return this._canUndo; }
  get canRedo() { return this._canRedo; }
  get activeMarks() { return this._activeMarks; }
  get fontFamily() { return this._fontFamily; }
  get fontSize() { return this._fontSize; }
  get textColor() { return this._textColor; }
  get highlightColor() { return this._highlightColor; }
  get alignment() { return this._alignment; }
  get style() { return this._style; }
  get isEmpty() { return this._isEmpty; }

  undo() { this.editor.dispatchCommand(UNDO_COMMAND, undefined); }
  redo() { this.editor.dispatchCommand(REDO_COMMAND, undefined); }
  toggleBold() { this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"); }
  toggleItalic() { this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"); }
  toggleUnderline() { this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"); }

  setStyle(style: "paragraph" | "h1" | "h2" | "h3") {
    this.editor.focus();
    this.editor.update(() => {
      const selection = this._restoreSelection();
      if ($isRangeSelection(selection)) {
        
        if (style === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(style));
        }

        const freshSelection = $getSelection();
        if ($isRangeSelection(freshSelection)) {
          const nodes = freshSelection.getNodes();
          const blocks = new Set();
          
          nodes.forEach(node => {
            let parent: any = node.getParent();
            while (parent !== null && parent.getType() !== "root" && !$isElementNode(parent)) {
              parent = parent.getParent();
            }
            if (parent !== null) blocks.add(parent);
          });

          blocks.forEach((block: any) => {
            const descendants = getDescendants(block);
            descendants.forEach(node => {
              if (typeof node.getStyle === 'function' && typeof node.setStyle === 'function') {
                let currentStyle = node.getStyle() || "";
                
                currentStyle = currentStyle
                  .replace(/font-size\s*:\s*[^;]+;?/gi, "")
                  .replace(/font-weight\s*:\s*[^;]+;?/gi, "");
                
                // Nếu đổi về Paragraph thì bơm lại size 11px chuẩn
                if (style === "paragraph") {
                  currentStyle += " font-size: 11px;";
                }
                
                node.setStyle(currentStyle.trim());
              }
            });
          });
        }
      }
    });
  }

  setFontFamily(font: string) {
    this.editor.focus();
    this.editor.update(() => {
      const selection = this._restoreSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-family": font });
      }
    });
  }

  setFontSize(size: string) {
    this.editor.focus();
    this.editor.update(() => {
      const selection = this._restoreSelection();
      if ($isRangeSelection(selection)) {
        const pxValue = size.endsWith("px") ? size : `${size}px`;
        $patchStyleText(selection, { "font-size": pxValue });
      }
    });
  }

  setColor(color: string) {
    this.editor.focus();
    this.editor.update(() => {
      const selection = this._restoreSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
  }

  setHighlight(color: string) {
    this.editor.focus();
    this.editor.update(() => {
      const selection = this._restoreSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": color });
      }
    });
  }

  setTextAlign(alignment: "left" | "center" | "right" | "justify") {
    this.editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  }

  toggleBulletList() {
    const isBulletList = this._style === "bullet"; 
    if (isBulletList) {
      this.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      this.editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }

  toggleOrderedList() {
    const isOrderedList = this._style === "number";
    if (isOrderedList) {
      this.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      this.editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }

  toggleTaskList() {
    const isCheckList = this._style === "check";
    if (isCheckList) {
      this.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      this.editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    }
  }

  liftListItem() { this.editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined); }
  sinkListItem() { this.editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined); }

  applyDraftCommentMark(range: EditorSelectionRange) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapSelectionInMarkNode(selection, selection.isBackward(), "draft");
      }
    });
  }

  removeCommentMark(range: EditorSelectionRange | null) {
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

  updateUser(user: { name: string; color: string }) {}

  insertTable(rows: number = 3, columns: number = 3) {
    console.log("[Lexical] 1. Đã nhận click chèn bảng");
    this.editor.focus();
    setTimeout(() => {
      console.log("[Lexical] 2. Đang bắn lệnh chèn bảng...");
      this.editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: rows.toString(),
        columns: columns.toString(),
        includeHeaders: true,
      });
    }, 50);
  }

  insertRowAbove() {
    this.editor.update(() => {
      $insertTableRowAtSelection(false);
    });
  }

  insertRowBelow() {
    this.editor.update(() => {
      $insertTableRowAtSelection(true);
    });
  }

  insertColumnLeft() {
    this.editor.update(() => {
      $insertTableColumnAtSelection(false);
    });
  }

  insertColumnRight() {
    this.editor.update(() => {
      $insertTableColumnAtSelection(true);
    });
  }

  deleteRow() {
    this.editor.update(() => {
      $deleteTableRowAtSelection();
    });
  }

  deleteColumn() {
    this.editor.update(() => {
      $deleteTableColumnAtSelection();
    });
  }

  deleteTable() {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const tableCellNode = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
        if (tableCellNode != null) {
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          tableNode.remove();
        }
      }
    });
  }

  insertLink(url: string | null) {
    this.editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  insertImage(src: string) {
    this.editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createImageNode(src)]);
      }
    });
  }
  insertHorizontalLine() {
    this.editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  }

  // --- BỘ DÒ TÌM NGỮ CẢNH (CONTEXT SENSORS) ---
  get isLink(): boolean {
    let _isLink = false;
    this.editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        let current: any = selection.anchor.getNode();
        while (current !== null) {
          if (current.getType() === 'link') {
            _isLink = true; break;
          }
          current = typeof current.getParent === 'function' ? current.getParent() : null;
        }
      }
    });
    return _isLink;
  }

  get isInsideTable(): boolean {
    let _isInsideTable = false;
    this.editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        let current: any = selection.anchor.getNode();
        while (current !== null) {
          if (current.getType() === 'table-cell' || current.getType() === 'table') {
            _isInsideTable = true; break;
          }
          current = typeof current.getParent === 'function' ? current.getParent() : null;
        }
      }
    });
    return _isInsideTable;
  }
}

