"use client"

import { useEffect, useState } from "react"
import { commentService } from "@/lib/commentService"
import { Comment } from "@/types/comment"
import { CommentItem } from "@/components/comments/CommentItem"
import { CommentInput } from "@/components/comments/CommentInput"
import { Button } from "@/components/ui/button"

export function CommentPanel({ documentId }: { documentId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)

  // Mock current user and role
  const currentUser = { id: "user-1", username: "Member 4", avatar: "", initials: "M4" }
  const currentUserRole = "editor"

  async function fetch() {
    setLoading(true)
    const c = await commentService.getComments(documentId)
    setComments(c.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  // Listen for toolbar Add comment event
  useEffect(() => {
    function handler() {
      if (currentUserRole === "viewer") return
      setShowInput(true)
    }
    window.addEventListener("editor:addComment", handler as EventListener)
    return () => window.removeEventListener("editor:addComment", handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserRole])

  async function handleSubmit(content: string) {
    // No selection available: fromPos/toPos are null
    await commentService.createComment(documentId, { content, fromPos: null, toPos: null, user: { id: currentUser.id, username: currentUser.username } })
    setShowInput(false)
    fetch()
  }

  async function handleDelete(id: string) {
    await commentService.deleteComment(id)
    fetch()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-semibold">Comments</div>
        <div>
          <Button size="sm" onClick={() => setShowInput((s) => !s)} disabled={currentUserRole === "viewer"}>
            New
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : comments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No comments yet. Be the first to comment.</div>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} onDelete={handleDelete} canDelete={c.user.id === currentUser.id || currentUserRole === "owner"} />
          ))
        )}
      </div>

      {showInput && (
        <div className="border-t">
          <CommentInput onCancel={() => setShowInput(false)} onSubmit={handleSubmit} disabled={currentUserRole === "viewer"} />
        </div>
      )}
    </div>
  )
}
