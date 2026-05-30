import type { EditorSelectionRange } from "./editor-selection";

export interface EditorAdapter {
  // State indicators
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly activeMarks: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly textColor: string;
  readonly highlightColor: string;
  readonly alignment: "left" | "center" | "right";
  readonly style: "paragraph" | "h1" | "h2" | "h3";
  readonly isEmpty: boolean;

  // Formatting operations
  undo(): void;
  redo(): void;
  toggleBold(): void;
  toggleItalic(): void;
  toggleUnderline(): void;
  setStyle(style: "paragraph" | "h1" | "h2" | "h3"): void;
  setFontFamily(font: string): void;
  setFontSize(size: string): void;
  setColor(color: string): void;
  setHighlight(color: string): void;
  setTextAlign(alignment: "left" | "center" | "right"): void;
  toggleBulletList(): void;
  toggleOrderedList(): void;
  toggleTaskList(): void;
  liftListItem(): void;
  sinkListItem(): void;

  // Comments mapping
  applyDraftCommentMark(range: EditorSelectionRange): void;
  removeCommentMark(range: EditorSelectionRange | null): void;
  removeCommentMarkById(commentId: string): void;
  addCommentMark(from: number, to: number, commentId: string): void;

  // Listeners & subscriptions
  subscribe(listener: () => void): () => void;

  // Collaboration updates
  updateUser(user: { name: string; color: string }): void;
}
