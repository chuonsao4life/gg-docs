"use client"

import { RefreshCw, X } from "lucide-react"
import { CommentInput } from "@/components/comments/CommentInput"
import { CommentItem } from "@/components/comments/CommentItem"
import type { DocumentComment } from "@/types/comment"
import type { EditorSelectionRange } from "@/types/editor-selection"

type CommentPanelProps = {
    documentId: string
    comments: DocumentComment[]
    errorMessage?: string | null
    draftRange: EditorSelectionRange | null
    isComposerOpen: boolean
    isLoading?: boolean
    isSubmitting?: boolean
    activeCommentId: string | null
    onRetry?: () => void
    onClose: () => void
    onSubmitComment: (content: string) => Promise<void> | void
    onCancelComposer: () => void
    onSelectComment: (commentId: string) => void
    onDeleteComment: (commentId: string) => void
}

export function CommentPanel({
    comments,
    errorMessage,
    draftRange,
    isComposerOpen,
    isLoading = false,
    isSubmitting = false,
    activeCommentId,
    onRetry,
    onClose,
    onSubmitComment,
    onCancelComposer,
    onSelectComment,
    onDeleteComment,
}: CommentPanelProps) {
    return (
        <aside data-comment-panel className="flex h-full flex-col border-l bg-muted">
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
                <div className="text-sm font-semibold">Bình luận</div>
                <button
                    type="button"
                    aria-label="Đóng bình luận"
                    title="Đóng bình luận"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {errorMessage && (
                <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <div>{errorMessage}</div>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-destructive/10"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Thử lại
                        </button>
                    )}
                </div>
            )}

            {isComposerOpen && draftRange && (
                <div className="border-b bg-background">
                    <CommentInput
                        draftRange={draftRange}
                        disabled={isSubmitting}
                        onCancel={onCancelComposer}
                        onSubmit={onSubmitComment}
                    />
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Chưa có bình luận.</div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isActive={comment.id === activeCommentId}
                            onClick={() => onSelectComment(comment.id)}
                            onDelete={() => onDeleteComment(comment.id)}
                        />
                    ))
                )}
            </div>
        </aside>
    )
}
