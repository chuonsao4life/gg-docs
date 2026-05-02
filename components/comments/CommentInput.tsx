"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CommentInput({
  onCancel,
  onSubmit,
  disabled,
}: {
  onCancel?: () => void
  onSubmit: (content: string) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState("")

  function submit() {
    const v = value.trim()
    if (!v) return
    onSubmit(v)
    setValue("")
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <textarea
        className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Write a comment..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={submit} disabled={disabled || !value.trim()}>Comment</Button>
      </div>
    </div>
  )
}
