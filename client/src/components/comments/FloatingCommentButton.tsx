"use client"

import { MessageSquare } from "lucide-react"

type FloatingCommentButtonProps = {
    visible: boolean
    onClick: () => void
}

export function FloatingCommentButton({ visible, onClick }: FloatingCommentButtonProps) {
    if (!visible) return null

    return (
        <button
            type="button"
            data-floating-comment-button
            aria-label="Add comment"
            title="Add comment"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className="absolute right-4 top-4 z-10 inline-flex h-8 items-center gap-2 rounded-md border bg-white px-3 text-sm shadow-sm transition hover:bg-gray-50"
        >
            <MessageSquare className="h-4 w-4" />
            Add comment
        </button>
    )
}
