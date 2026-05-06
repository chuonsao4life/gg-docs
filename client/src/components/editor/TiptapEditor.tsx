'use client'

import { Editor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect } from 'react'
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
  onSelectionChange,
  onStartComment,
}: TiptapEditorProps) {
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

  if (!editor) return null;

  return (
    <div className="relative h-full w-full">
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
