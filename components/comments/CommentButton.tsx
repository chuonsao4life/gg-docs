"use client"

import { Button } from "@/components/ui/button"

export function CommentButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className="ml-2">
      Add comment
    </Button>
  )
}
