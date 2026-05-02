"use client"

import React from "react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Calculator, Settings, SpellCheck } from "lucide-react"

export default function ToolsToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
      <ToolbarIconButton label="Chính tả" icon={<SpellCheck size={18} />} onClick={actions?.onSpellingCheck} disabled={disabled} />
      <ToolbarIconButton label="Đếm từ" icon={<Calculator size={18} />} onClick={actions?.onWordCount} disabled={disabled} />
      <ToolbarIconButton label="Tùy chọn" icon={<Settings size={18} />} onClick={actions?.onPreferences} disabled={disabled} />
    </div>
  )
}
