"use client"

import React from "react"
import { Undo2, Redo2, Scissors, Copy, Clipboard } from "lucide-react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"

export default function EditToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarIconButton label="Hoàn tác" icon={<Undo2 className="h-4 w-4" />} onClick={actions?.onUndo} disabled={disabled} />
            <ToolbarIconButton label="Làm lại" icon={<Redo2 className="h-4 w-4" />} onClick={actions?.onRedo} disabled={disabled} />
            <ToolbarIconButton label="Cắt" icon={<Scissors className="h-4 w-4" />} onClick={actions?.onCut} disabled={disabled} />
            <ToolbarIconButton label="Sao chép" icon={<Copy className="h-4 w-4" />} onClick={actions?.onCopy} disabled={disabled} />
            <ToolbarIconButton label="Dán" icon={<Clipboard className="h-4 w-4" />} onClick={actions?.onPaste} disabled={disabled} />
            <ToolbarIconButton label="Chọn tất cả" icon={<Copy className="h-4 w-4" />} onClick={actions?.onSelectAll} disabled={disabled} />
        </div>
    )
}
