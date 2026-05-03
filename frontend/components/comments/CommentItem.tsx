"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { DocumentComment } from "@/types/comment"

export function CommentItem({
    comment,
    isActive = false,
    onClick,
}: {
    comment: DocumentComment
    isActive?: boolean
    onClick?: () => void
}) {
    const itemRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (isActive) {
            itemRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        }
    }, [isActive])

    return (
        <button
            ref={itemRef}
            type="button"
            onClick={onClick}
            className={[
                "flex w-full gap-3 border-b border-l-4 px-4 py-3 text-left transition",
                isActive ? "border-l-blue-500 border-b-blue-100 bg-blue-50 ring-1 ring-blue-100" : "border-l-transparent bg-background hover:bg-gray-50",
            ].join(" ")}
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{comment.user.username.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{comment.user.username}</div>
                    <div className="shrink-0 text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    "{comment.selectedText}"
                </div>
                <div className="mt-2 text-sm text-foreground">{comment.content}</div>
            </div>
        </button>
    )
}
