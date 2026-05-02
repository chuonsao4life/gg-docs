"use client"

import { useState } from "react"
import { CommentButton } from "@/components/comments/CommentButton"

export function DocumentEditorShell({ documentId }: { documentId: string }) {
  const [selection, setSelection] = useState<{ from?: number; to?: number } | null>(null)

  // Placeholder editor shell: simple friendly placeholder. Real editor (Tiptap) will be integrated later.
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Document ID: {documentId}</div>
        <div>
          <CommentButton onClick={() => { /* TODO: integrate selection from Tiptap */ }} />
        </div>
      </div>

      <div className="min-h-[640px] rounded border bg-white p-8 shadow-sm">
        <div className="min-h-[420px] text-muted-foreground">
          <div className="text-lg text-muted-foreground">Start writing here...</div>
        </div>
      </div>
    </div>
  )
}
