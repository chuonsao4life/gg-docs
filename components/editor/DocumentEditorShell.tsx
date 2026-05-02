"use client"

import { useCallback, useEffect, useRef } from "react"
import { MessageSquare } from "lucide-react"
import type { EditorSelectionRange } from "@/types/editor-selection"

export function DocumentEditorShell({
    documentId,
    selectedRange,
    setSelectedRange,
    onRequestAddComment,
}: {
    documentId: string
    selectedRange?: EditorSelectionRange | null
    setSelectedRange?: (range: EditorSelectionRange | null) => void
    onRequestAddComment?: () => void
}) {
    const editorRef = useRef<HTMLDivElement>(null)

    const updateSelection = useCallback(() => {
        const editor = editorRef.current
        const selection = window.getSelection()

        if (!editor || !selection || selection.rangeCount === 0) {
            setSelectedRange?.(null)
            return
        }

        const range = selection.getRangeAt(0)
        const isInsideEditor = editor.contains(range.commonAncestorContainer)
        const selectedText = selection.toString().trim()

        if (!isInsideEditor || !selectedText) {
            setSelectedRange?.(null)
            return
        }

        // Mock positions until the Tiptap editor can provide real document offsets.
        setSelectedRange?.({
            from: 0,
            to: selectedText.length,
            text: selectedText,
        })
    }, [setSelectedRange])

    useEffect(() => {
        document.addEventListener("selectionchange", updateSelection)
        return () => document.removeEventListener("selectionchange", updateSelection)
    }, [updateSelection])

    // The contenteditable placeholder is temporary. Tiptap can later pass real selection offsets through selectedRange.
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Document ID: {documentId}</div>
            </div>

            <div className="relative min-h-[640px] rounded border bg-white p-8 shadow-sm">
                {selectedRange && (
                    <button
                        type="button"
                        aria-label="Add comment"
                        title="Add comment"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={onRequestAddComment}
                        className="absolute right-4 top-4 inline-flex h-8 items-center gap-2 rounded-md border bg-white px-3 text-sm shadow-sm transition hover:bg-gray-50"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Add comment
                    </button>
                )}

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onMouseUp={updateSelection}
                    onKeyUp={updateSelection}
                    className="min-h-[420px] whitespace-pre-wrap text-sm leading-7 text-foreground outline-none"
                >
                    <div className="text-lg text-muted-foreground">Start writing here...</div>
                    <p className="mt-6">
                        Draft your document here and select a sentence when you want to leave a focused comment.
                    </p>
                    <p className="mt-4">
                        Project notes, meeting summaries, and review feedback can all live in this shared workspace.
                    </p>
                </div>
            </div>
        </div>
    )
}
