"use client"

import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent, MouseEvent } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { DocumentComment } from "@/types/comment"

export function CommentItem({
    comment,
    isActive = false,
    canEdit = false,
    canDelete = false,
    onClick,
    onEdit,
    onDelete,
}: {
    comment: DocumentComment
    isActive?: boolean
    canEdit?: boolean
    canDelete?: boolean
    onClick?: () => void
    onEdit?: (content: string) => Promise<void> | void
    onDelete?: () => void
}) {
    const itemRef = useRef<HTMLDivElement | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [draftContent, setDraftContent] = useState(comment.content)
    const [isSaving, setIsSaving] = useState(false)

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
        if (isEditing) return

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onClick?.()
        }
    }

    const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setDraftContent(comment.content)
        setIsEditing(true)
    }

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const confirmed = window.confirm("Delete this comment?")
        if (confirmed) onDelete?.()
    }

    const handleSaveEdit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const nextContent = draftContent.trim()
        if (!nextContent || nextContent === comment.content) {
            setDraftContent(comment.content)
            setIsEditing(false)
            return
        }

        try {
            setIsSaving(true)
            await onEdit?.(nextContent)
            setIsEditing(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelEdit = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setDraftContent(comment.content)
        setIsEditing(false)
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
                        {canEdit && !isEditing && (
                            <button
                                type="button"
                                aria-label="Edit comment"
                                title="Edit comment"
                                onClick={handleEdit}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                aria-label="Delete comment"
                                title="Delete comment"
                                onClick={handleDelete}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    &quot;{comment.selectedText}&quot;
                </div>
                {isEditing ? (
                    <div className="mt-2 space-y-2" onClick={(event) => event.stopPropagation()}>
                        <textarea
                            className="min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={draftContent}
                            onChange={(event) => setDraftContent(event.target.value)}
                            disabled={isSaving}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSaving || !draftContent.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 text-sm text-foreground">{comment.content}</div>
                )}
            </div>
        </div>
    )
}
