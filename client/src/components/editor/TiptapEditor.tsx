'use client'

import { Editor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { FloatingCommentButton } from '@/components/comments/FloatingCommentButton'
import type { DocumentComment } from '@/types/comment'
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
}

export default function TiptapEditor({
  editor,
  selectedRange,
  activeCommentId,
  onSelectionChange,
  onStartComment,
  onSelectComment,
}: TiptapEditorProps) {
  const editorWrapperRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const wrapper = editorWrapperRef.current
    if (!wrapper) return

    wrapper.querySelectorAll<HTMLElement>("[data-comment-id]").forEach((element) => {
      const isActive = Boolean(activeCommentId) && element.dataset.commentId === activeCommentId
      if (isActive) {
        element.dataset.activeComment = "true"
      } else {
        delete element.dataset.activeComment
      }
    })
  }, [activeCommentId])

  const handleEditorClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const commentElement = target.closest<HTMLElement>("[data-comment-id]")
    const commentId = commentElement?.dataset.commentId
    if (!commentId || commentElement?.dataset.commentDraft === "true") return

    event.preventDefault()
    onSelectComment?.(commentId)
  }, [onSelectComment])

  if (!editor) return null;

  return (
    <div ref={editorWrapperRef} className="relative h-full w-full" onClick={handleEditorClick}>
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
