"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { EditorSelectionRange } from "@/types/editor-selection"

export function CommentInput({
    onCancel,
    onSubmit,
    disabled,
    draftRange,
}: {
    onCancel?: () => void
    onSubmit: (content: string) => Promise<void> | void
    disabled?: boolean
    draftRange?: EditorSelectionRange | null
}) {
    const [value, setValue] = useState("")

    async function submit() {
        const nextValue = value.trim()
        if (!nextValue) return

        try {
            await onSubmit(nextValue)
            setValue("")
        } catch {
            // Keep the draft text so the user can retry after an API error.
        }
    }

    return (
        <div className="flex flex-col gap-2 p-4">
            {draftRange && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Đang bình luận về: &quot;{draftRange.text}&quot;
                </div>
            )}
            <textarea
                className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Viết bình luận..."
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={disabled}
            />
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    Hủy
                </Button>
                <Button size="sm" onClick={submit} disabled={disabled || !value.trim()}>
                    Bình luận
                </Button>
            </div>
        </div>
    )
}
