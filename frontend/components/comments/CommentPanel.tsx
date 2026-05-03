"use client"

import { X } from "lucide-react"
import { CommentInput } from "@/components/comments/CommentInput"
import { CommentItem } from "@/components/comments/CommentItem"
import type { DocumentComment } from "@/types/comment"
import type { EditorSelectionRange } from "@/types/editor-selection"

type CommentPanelProps = {
    documentId: string
    comments: DocumentComment[]
    draftRange: EditorSelectionRange | null
    isComposerOpen: boolean
    activeCommentId: string | null
    onClose: () => void
    onSubmitComment: (content: string) => void
    onCancelComposer: () => void
    onSelectComment: (commentId: string) => void
}

export function CommentPanel({
    comments,
    draftRange,
    isComposerOpen,
    activeCommentId,
    onClose,
    onSubmitComment,
    onCancelComposer,
    onSelectComment,
}: CommentPanelProps) {
    return (
        <aside data-comment-panel className="flex h-full flex-col border-l bg-muted">
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
                <div className="text-sm font-semibold">Comments</div>
                <button
                    type="button"
                    aria-label="Close comments"
                    title="Close comments"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {isComposerOpen && draftRange && (
                <div className="border-b bg-background">
                    <CommentInput
                        draftRange={draftRange}
                        onCancel={onCancelComposer}
                        onSubmit={onSubmitComment}
                    />
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {comments.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No comments yet.</div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isActive={comment.id === activeCommentId}
                            onClick={() => onSelectComment(comment.id)}
                        />
                    ))
                )}
            </div>
        </aside>
    )
}
