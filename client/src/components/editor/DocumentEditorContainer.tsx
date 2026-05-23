'use client'

import React from "react"
import { Editor } from "@tiptap/react"
import * as Y from 'yjs'
import TiptapEditor from "./TiptapEditor"
import type { CommentMarkRange, DocumentComment } from "@/types/comment"
import type { EditorSelectionRange } from "@/types/editor-selection"

interface DocumentEditorContainerProps {
    documentId: string;
    editor: Editor | null;
    doc: Y.Doc;
    selectedRange?: EditorSelectionRange | null;
    draftRange?: EditorSelectionRange | null;
    comments?: DocumentComment[];
    activeCommentId?: string | null;
    onSelectionChange?: (range: EditorSelectionRange | null) => void;
    onStartComment?: () => void;
    onSelectComment?: (commentId: string) => void;
    onCommentMarksChange?: (commentRanges: CommentMarkRange[]) => void;
}

export function DocumentEditorContainer({ 
    editor,
    selectedRange,
    draftRange,
    comments,
    activeCommentId,
    onSelectionChange,
    onStartComment,
    onSelectComment,
    onCommentMarksChange,
}: DocumentEditorContainerProps) {

    return (
        <>
            <TiptapEditor
                editor={editor}
                selectedRange={selectedRange}
                draftRange={draftRange}
                comments={comments}
                activeCommentId={activeCommentId}
                onSelectionChange={onSelectionChange}
                onStartComment={onStartComment}
                onSelectComment={onSelectComment}
                onCommentMarksChange={onCommentMarksChange}
            />
        </>
    )
}
