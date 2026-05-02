"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { FloatingCommentButton } from "@/components/comments/FloatingCommentButton"
import type { DocumentComment } from "@/types/comment"
import type { EditorSelectionRange } from "@/types/editor-selection"

const EDITOR_PARAGRAPHS = [
    "Draft your document here and select a sentence when you want to leave a focused comment.",
    "Project notes, meeting summaries, and review feedback can all live in this shared workspace.",
]

export function DocumentEditorShell({
    documentId,
    selectedRange,
    draftRange,
    comments = [],
    activeCommentId,
    onSelectionChange,
    onStartComment,
    onSelectComment,
}: {
    documentId: string
    selectedRange?: EditorSelectionRange | null
    draftRange?: EditorSelectionRange | null
    comments?: DocumentComment[]
    activeCommentId?: string | null
    onSelectionChange?: (range: EditorSelectionRange | null) => void
    onStartComment?: () => void
    onSelectComment?: (commentId: string) => void
}) {
    const editorRef = useRef<HTMLDivElement>(null)

    const updateSelection = useCallback(() => {
        const editor = editorRef.current
        const selection = window.getSelection()

        if (!editor || !selection || selection.rangeCount === 0) {
            onSelectionChange?.(null)
            return
        }

        const range = selection.getRangeAt(0)
        const selectedText = selection.toString().trim()
        const isInsideEditor = editor.contains(range.commonAncestorContainer)

        if (!isInsideEditor || !selectedText) {
            onSelectionChange?.(null)
            return
        }

        const nextRange = {
            from: 0,
            to: selectedText.length,
            text: selectedText,
        }

        // TODO(Member 2): replace window.getSelection mock with Tiptap selection.from/to.
        onSelectionChange?.(nextRange)

        window.setTimeout(() => {
            const currentSelection = window.getSelection()
            if (currentSelection?.toString().trim() === selectedText) {
                currentSelection.removeAllRanges()
            }
        }, 0)
    }, [onSelectionChange])

    const updateSelectionFromMouse = useCallback(() => {
        updateSelection()
    }, [updateSelection])

    const updateSelectionFromKeyboard = useCallback(() => {
        const editor = editorRef.current
        const selection = window.getSelection()

        if (!editor || !selection || selection.rangeCount === 0) {
            onSelectionChange?.(null)
            return
        }

        const range = selection.getRangeAt(0)
        const selectedText = selection.toString().trim()
        const isInsideEditor = editor.contains(range.commonAncestorContainer)

        if (!isInsideEditor || !selectedText) {
            onSelectionChange?.(null)
            return
        }

        onSelectionChange?.({
            from: 0,
            to: selectedText.length,
            text: selectedText,
        })
    }, [onSelectionChange])

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            const target = event.target
            if (!(target instanceof Element)) return

            const clickedEditor = Boolean(editorRef.current?.contains(target))
            const clickedCommentUi = Boolean(target.closest("[data-comment-panel], [data-floating-comment-button]"))

            if (!clickedEditor && !clickedCommentUi) {
                onSelectionChange?.(null)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        return () => document.removeEventListener("pointerdown", handlePointerDown)
    }, [onSelectionChange])

    function renderTextWithHighlights(text: string) {
        const visibleDraftRange = draftRange ?? selectedRange
        const savedMatches = comments
            .map((comment) => ({
                id: comment.id,
                text: comment.selectedText,
                comment,
                type: "saved" as const,
                index: text.indexOf(comment.selectedText),
            }))
            .filter(({ comment, index }) => comment.selectedText && index >= 0)

        const draftMatch = visibleDraftRange?.text
            ? [{
                id: "draft-comment-range",
                text: visibleDraftRange.text,
                comment: null,
                type: "draft" as const,
                index: text.indexOf(visibleDraftRange.text),
            }].filter(({ index }) => index >= 0)
            : []

        // TODO(Member 2): use Tiptap marks/decorations with commentId attribute for exact range mapping.
        const matches = [...savedMatches, ...draftMatch].sort((a, b) => a.index - b.index)

        if (matches.length === 0) return text

        const parts: React.ReactNode[] = []
        let cursor = 0

        for (const match of matches) {
            const { comment, id, index, text: matchedText, type } = match
            if (index < cursor) continue

            if (index > cursor) {
                parts.push(text.slice(cursor, index))
            }

            const isActive = comment?.id === activeCommentId
            const isDraft = type === "draft"
            parts.push(
                <span
                    key={id}
                    data-comment-id={comment?.id}
                    role="button"
                    tabIndex={0}
                    className={[
                        "cursor-pointer rounded px-0.5 text-inherit transition",
                        isDraft ? "bg-sky-100 ring-1 ring-sky-300" : "",
                        isActive ? "bg-blue-200 ring-1 ring-blue-400" : "",
                        !isDraft && !isActive ? "bg-yellow-200 hover:bg-yellow-300" : "",
                    ].join(" ")}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                        event.stopPropagation()
                        if (comment) onSelectComment?.(comment.id)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            event.stopPropagation()
                            if (comment) onSelectComment?.(comment.id)
                        }
                    }}
                >
                    {matchedText}
                </span>
            )
            cursor = index + matchedText.length
        }

        if (cursor < text.length) {
            parts.push(text.slice(cursor))
        }

        return parts
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Document ID: {documentId}</div>
            </div>

            <div className="relative min-h-[640px] rounded border bg-white p-8 shadow-sm">
                <FloatingCommentButton visible={Boolean(selectedRange)} onClick={onStartComment ?? (() => undefined)} />

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onMouseUp={updateSelectionFromMouse}
                    onKeyUp={updateSelectionFromKeyboard}
                    className="editor-placeholder min-h-[420px] whitespace-pre-wrap text-sm leading-7 text-foreground outline-none"
                >
                    <div className="text-lg text-muted-foreground">Start writing here...</div>
                    {EDITOR_PARAGRAPHS.map((paragraph, index) => (
                        <p key={paragraph} className={index === 0 ? "mt-6" : "mt-4"}>
                            {renderTextWithHighlights(paragraph)}
                        </p>
                    ))}
                </div>
                <style jsx>{`
                    .editor-placeholder ::selection {
                        background-color: rgba(96, 165, 250, 0.25);
                        color: inherit;
                    }
                `}</style>
            </div>
        </div>
    )
}
