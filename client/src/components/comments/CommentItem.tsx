"use client"

import { useEffect, useRef } from "react"
import type { KeyboardEvent, MouseEvent } from "react"
import { Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { DocumentComment } from "@/types/comment"

export function CommentItem({
    comment,
    isActive = false,
    onClick,
    onDelete,
}: {
    comment: DocumentComment
    isActive?: boolean
    onClick?: () => void
    onDelete?: () => void
}) {
    const itemRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!isActive) return

        const frameId = window.requestAnimationFrame(() => {
            itemRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        })

        return () => window.cancelAnimationFrame(frameId)
    }, [isActive])

    const handleItemKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onClick?.()
        }
    }

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const confirmed = window.confirm("Delete this comment?")
        if (confirmed) onDelete?.()
    }

    return (
        <div
            ref={itemRef}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleItemKeyDown}
            className={[
                "flex w-full gap-3 border-b border-l-4 px-4 py-3 text-left transition",
                isActive ? "border-l-primary border-b-primary/20 bg-primary/10 ring-1 ring-primary/20" : "border-l-transparent bg-background hover:bg-muted/60",
            ].join(" ")}
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{comment.user.username.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{comment.user.username}</div>
                    <div className="flex shrink-0 items-center gap-2">
                        <div className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
                        <button
                            type="button"
                            aria-label="Delete comment"
                            title="Delete comment"
                            onClick={handleDelete}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
                <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    &quot;{comment.selectedText}&quot;
                </div>
                <div className="mt-2 text-sm text-foreground">{comment.content}</div>
            </div>
        </div>
    )
}
