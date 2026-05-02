"use client"

import { Comment as C } from "@/types/comment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function CommentItem({ comment, onDelete, canDelete }: { comment: C; onDelete?: (id: string) => void; canDelete?: boolean }) {
  return (
    <div className="flex gap-3 border-b px-4 py-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{(comment.user.username || comment.user.email || "U").slice(0,2)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{comment.user.username || comment.user.email || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
        </div>
        <div className="mt-1 text-sm text-foreground">{comment.content}</div>
        {canDelete && (
          <div className="mt-2">
            <Button size="sm" variant="ghost" onClick={() => onDelete && onDelete(comment.id)} className="text-destructive">Delete</Button>
          </div>
        )}
      </div>
    </div>
  )
}
