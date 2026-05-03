"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { FloatingCommentButton } from "@/components/comments/FloatingCommentButton"
import type { DocumentComment } from "@/types/comment"
import type { EditorSelectionRange } from "@/types/editor-selection"

const EDITOR_PARAGRAPHS = [
    "Draft your document here and select a sentence when you want to leave a focused comment.",
    "Project notes, meeting summaries, and review feedback can all live in this shared workspace.",
]

type NormalizedCharMap = {
    paragraphIndex: number
    charIndex: number
} | null

type HighlightRange = {
    id: string
    type: "saved" | "draft"
    start: number
    end: number
    comment: DocumentComment | null
}

function normalizeText(text: string) {
    return text.replace(/\s+/g, " ").trim()
}

function buildNormalizedDocument(paragraphs: string[]) {
    let normalized = ""
    const map: NormalizedCharMap[] = []

    function append(char: string, mappedChar: NormalizedCharMap) {
        if (/\s/.test(char)) {
            if (normalized.length > 0 && normalized[normalized.length - 1] !== " ") {
                normalized += " "
                map.push(mappedChar)
            }
            return
        }

        normalized += char
        map.push(mappedChar)
    }

    paragraphs.forEach((paragraph, paragraphIndex) => {
        if (paragraphIndex > 0 && normalized.length > 0 && normalized[normalized.length - 1] !== " ") {
            normalized += " "
            map.push(null)
        }

        Array.from(paragraph).forEach((char, charIndex) => {
            append(char, { paragraphIndex, charIndex })
        })
    })

    return { normalized: normalized.trim(), map }
}

function findMappedPoint(map: NormalizedCharMap[], index: number, direction: 1 | -1) {
    let current = index
    while (current >= 0 && current < map.length) {
        if (map[current]) return map[current]
        current += direction
    }
    return null
}

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

    function buildHighlightRanges() {
        const visibleDraftRange = draftRange ?? selectedRange
        const normalizedDocument = buildNormalizedDocument(EDITOR_PARAGRAPHS)
        const sources = [
            ...comments.map((comment) => ({
                id: comment.id,
                type: "saved" as const,
                text: comment.selectedText,
                comment,
            })),
            ...(visibleDraftRange?.text ? [{
                id: "draft-comment-range",
                text: visibleDraftRange.text,
                comment: null,
                type: "draft" as const,
            }] : []),
        ]

        const rangesByParagraph = new Map<number, HighlightRange[]>()

        for (const source of sources) {
            const normalizedNeedle = normalizeText(source.text)
            if (!normalizedNeedle) continue

            // TODO(Member 2): replace mock text matching with Tiptap range decorations for exact multi-line selection.
            const startIndex = normalizedDocument.normalized.indexOf(normalizedNeedle)
            if (startIndex < 0) continue

            const endIndex = startIndex + normalizedNeedle.length - 1
            const startPoint = findMappedPoint(normalizedDocument.map, startIndex, 1)
            const endPoint = findMappedPoint(normalizedDocument.map, endIndex, -1)
            if (!startPoint || !endPoint) continue

            for (let paragraphIndex = startPoint.paragraphIndex; paragraphIndex <= endPoint.paragraphIndex; paragraphIndex += 1) {
                const paragraph = EDITOR_PARAGRAPHS[paragraphIndex]
                const start = paragraphIndex === startPoint.paragraphIndex ? startPoint.charIndex : 0
                const end = paragraphIndex === endPoint.paragraphIndex ? endPoint.charIndex + 1 : paragraph.length
                if (start >= end) continue

                const nextRange: HighlightRange = {
                    id: source.id,
                    type: source.type,
                    start,
                    end,
                    comment: source.comment,
                }

                const ranges = rangesByParagraph.get(paragraphIndex) ?? []
                ranges.push(nextRange)
                rangesByParagraph.set(paragraphIndex, ranges)
            }
        }

        return rangesByParagraph
    }

    function renderTextWithHighlights(text: string, paragraphIndex: number, rangesByParagraph: Map<number, HighlightRange[]>) {
        const ranges = (rangesByParagraph.get(paragraphIndex) ?? []).sort((a, b) => a.start - b.start)
        if (ranges.length === 0) return text

        const parts: React.ReactNode[] = []
        let cursor = 0

        for (const range of ranges) {
            const { comment, id, start, end, type } = range
            if (start < cursor) continue

            if (start > cursor) {
                parts.push(text.slice(cursor, start))
            }

            const isActive = comment?.id === activeCommentId
            const isDraft = type === "draft"
            parts.push(
                <span
                    key={`${id}-${paragraphIndex}-${start}-${end}`}
                    data-comment-id={comment?.id}
                    role={comment ? "button" : undefined}
                    tabIndex={comment ? 0 : undefined}
                    className={[
                        "rounded px-0.5 text-inherit transition",
                        isDraft ? "cursor-default bg-sky-100 ring-1 ring-sky-300" : "",
                        isActive ? "bg-blue-200 ring-1 ring-blue-400" : "",
                        !isDraft && !isActive ? "cursor-pointer bg-yellow-200 hover:bg-yellow-300" : "",
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
                    {text.slice(start, end)}
                </span>
            )
            cursor = end
        }

        if (cursor < text.length) {
            parts.push(text.slice(cursor))
        }

        return parts
    }

    const rangesByParagraph = buildHighlightRanges()

    return (
        <div className="relative min-h-[760px]">
            <FloatingCommentButton visible={Boolean(selectedRange)} onClick={onStartComment ?? (() => undefined)} />

            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Document ID: {documentId}</div>
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onMouseUp={updateSelectionFromMouse}
                onKeyUp={updateSelectionFromKeyboard}
                className="editor-placeholder min-h-[640px] whitespace-pre-wrap text-sm leading-7 text-foreground outline-none"
            >
                <div className="text-lg text-muted-foreground">Start writing here...</div>
                {EDITOR_PARAGRAPHS.map((paragraph, index) => (
                    <p key={paragraph} className={index === 0 ? "mt-6" : "mt-4"}>
                        {renderTextWithHighlights(paragraph, index, rangesByParagraph)}
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
    )
}
