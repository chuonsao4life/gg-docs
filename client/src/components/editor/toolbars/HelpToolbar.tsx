"use client"

import React from "react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { CircleHelp, Info, Keyboard } from "lucide-react"

export default function HelpToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
      <ToolbarIconButton label="Trợ giúp" icon={<CircleHelp size={18} />} onClick={actions?.onOpenHelp} disabled={disabled} />
      <ToolbarIconButton label="Phím tắt" icon={<Keyboard size={18} />} onClick={actions?.onKeyboardShortcuts} disabled={disabled} />
      <ToolbarIconButton label="Giới thiệu" icon={<Info size={18} />} onClick={actions?.onAbout} disabled={disabled} />
    </div>
  )
}
