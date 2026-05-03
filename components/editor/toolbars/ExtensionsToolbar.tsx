"use client"

import React from "react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { PackagePlus, Puzzle } from "lucide-react"

export default function ExtensionsToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
      <ToolbarIconButton label="Quản lý tiện ích" icon={<Puzzle size={18} />} onClick={actions?.onManageExtensions} disabled={disabled} />
      <ToolbarIconButton label="Tiện ích bổ sung" icon={<PackagePlus size={18} />} onClick={() => {}} disabled={disabled} />
    </div>
  )
}
