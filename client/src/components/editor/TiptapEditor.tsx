'use client'

import { Editor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { FloatingCommentButton } from '@/components/comments/FloatingCommentButton'
import type { CommentMarkRange, DocumentComment } from '@/types/comment'
import type { EditorSelectionRange } from '@/types/editor-selection'

type TiptapEditorProps = {
  editor: Editor | null
  selectedRange?: EditorSelectionRange | null
  draftRange?: EditorSelectionRange | null
  comments?: DocumentComment[]
  activeCommentId?: string | null
  onSelectionChange?: (range: EditorSelectionRange | null) => void
  onStartComment?: () => void
  onSelectComment?: (commentId: string) => void
  onCommentMarksChange?: (commentRanges: CommentMarkRange[]) => void
}

export default function TiptapEditor({
  editor,
  selectedRange,
  activeCommentId,
  onSelectionChange,
  onStartComment,
  onSelectComment,
  onCommentMarksChange,
}: TiptapEditorProps) {
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const commentMarksTimeoutRef = useRef<number | null>(null)

  const emitSelection = useCallback(() => {
    if (!editor) {
      onSelectionChange?.(null)
      return
    }

    const { from, to, empty } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ").trim()

    if (!empty && text) {
      onSelectionChange?.({ from, to, text })
      return
    }

    onSelectionChange?.(null)
  }, [editor, onSelectionChange])

  useEffect(() => {
    if (!editor) {
      onSelectionChange?.(null)
      return
    }

    editor.on("selectionUpdate", emitSelection)
    return () => {
      editor.off("selectionUpdate", emitSelection)
    }
  }, [editor, emitSelection, onSelectionChange])

  const emitCommentMarks = useCallback(() => {
    if (!editor) {
      onCommentMarksChange?.([])
      return
    }

    const commentRanges = new Map<string, CommentMarkRange>()

    editor.state.doc.descendants((node, position) => {
      if (!node.isText) return

      node.marks.forEach((mark) => {
        const commentId = mark.attrs.commentId
        if (mark.type.name === "comment" && typeof commentId === "string" && commentId !== "draft") {
          const fromPos = position
          const toPos = position + node.nodeSize
          const current = commentRanges.get(commentId)
          commentRanges.set(commentId, {
            commentId,
            fromPos: current ? Math.min(current.fromPos, fromPos) : fromPos,
            toPos: current ? Math.max(current.toPos, toPos) : toPos,
          })
        }
      })
    })

    onCommentMarksChange?.([...commentRanges.values()])
  }, [editor, onCommentMarksChange])

  useEffect(() => {
    if (!editor) {
      onCommentMarksChange?.([])
      return
    }

    const scheduleCommentMarksEmit = () => {
      if (commentMarksTimeoutRef.current !== null) {
        window.clearTimeout(commentMarksTimeoutRef.current)
      }

      commentMarksTimeoutRef.current = window.setTimeout(() => {
        commentMarksTimeoutRef.current = null
        emitCommentMarks()
      }, 150)
    }

    const initialScanTimeout = window.setTimeout(emitCommentMarks, 250)

    editor.on("update", scheduleCommentMarksEmit)
    return () => {
      window.clearTimeout(initialScanTimeout)
      if (commentMarksTimeoutRef.current !== null) {
        window.clearTimeout(commentMarksTimeoutRef.current)
        commentMarksTimeoutRef.current = null
      }
      editor.off("update", scheduleCommentMarksEmit)
    }
  }, [editor, emitCommentMarks, onCommentMarksChange])

  const syncActiveCommentHighlight = useCallback(() => {
    const wrapper = editorWrapperRef.current
    if (!wrapper) return

    wrapper.querySelectorAll<HTMLElement>("[data-comment-id]").forEach((element) => {
      const isActive = Boolean(activeCommentId) && element.dataset.commentId === activeCommentId
      if (isActive) {
        element.setAttribute("data-active-comment", "true")
      } else {
        element.removeAttribute("data-active-comment")
      }
    })
  }, [activeCommentId])

  useEffect(() => {
    syncActiveCommentHighlight()

    const frameId = window.requestAnimationFrame(syncActiveCommentHighlight)
    return () => window.cancelAnimationFrame(frameId)
  }, [syncActiveCommentHighlight])

  useEffect(() => {
    if (!editor) return

    editor.on("update", syncActiveCommentHighlight)
    editor.on("selectionUpdate", syncActiveCommentHighlight)
    return () => {
      editor.off("update", syncActiveCommentHighlight)
      editor.off("selectionUpdate", syncActiveCommentHighlight)
    }
  }, [editor, syncActiveCommentHighlight])

  const getCommentIdFromPoint = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!editor) return null

    const position = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })
    if (!position) return null

    const commentMark = editor.schema.marks.comment
    if (!commentMark) return null

    const candidatePositions = [
      position.pos,
      Math.max(0, position.pos - 1),
      Math.min(editor.state.doc.content.size, position.pos + 1),
    ]
    const candidateMarks = candidatePositions.flatMap((pos) => {
      const resolvedPosition = editor.state.doc.resolve(pos)
      return [
        ...resolvedPosition.marks(),
        ...(resolvedPosition.nodeBefore?.marks ?? []),
        ...(resolvedPosition.nodeAfter?.marks ?? []),
      ]
    })
    const mark = candidateMarks.find((candidate) => candidate.type === commentMark)
    const commentId = mark?.attrs.commentId

    return typeof commentId === "string" && !mark?.attrs.isDraft ? commentId : null
  }, [editor])

  const handleEditorCommentPointer = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    const element =
      target instanceof HTMLElement
        ? target
        : target instanceof Text
          ? target.parentElement
          : null

    if (!element) return

    if (element.closest("[data-floating-comment-button], [data-comment-panel]")) {
      return
    }

    const commentElement = element.closest<HTMLElement>("[data-comment-id]")
    const domCommentId = commentElement?.getAttribute("data-comment-id")
    const commentId = commentElement?.getAttribute("data-comment-draft") === "true"
      ? null
      : domCommentId || getCommentIdFromPoint(event)
    if (!commentId) return

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      event.stopPropagation()
    }
    onSelectComment?.(commentId)
  }, [getCommentIdFromPoint, onSelectComment])

  if (!editor) return null;

  return (
    <div
      ref={editorWrapperRef}
      className="relative h-full w-full"
      onMouseDownCapture={handleEditorCommentPointer}
    >
      <FloatingCommentButton
        visible={Boolean(selectedRange)}
        onClick={onStartComment ?? (() => undefined)}
      />
      <EditorContent 
        editor={editor}
        className="focus:outline-none min-h-full prose prose-sm max-w-none"/>
    </div>
  )
}
