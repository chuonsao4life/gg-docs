"use client"

import React from "react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Image, Link, MessageSquare, Table, Minus } from "lucide-react"

export default function InsertToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarIconButton label="Hình ảnh" icon={<Image className="h-4 w-4" />} onClick={actions?.onInsertImage} disabled={disabled} />
            <ToolbarIconButton label="Liên kết" icon={<Link className="h-4 w-4" />} onClick={actions?.onInsertLink} disabled={disabled} />
            <ToolbarIconButton label="Bình luận" icon={<MessageSquare className="h-4 w-4" />} onClick={actions?.onAddComment} disabled={disabled} />
            <ToolbarIconButton label="Bảng" icon={<Table className="h-4 w-4" />} onClick={actions?.onInsertTable} disabled={disabled} />
            <ToolbarIconButton label="Đường ngang" icon={<Minus className="h-4 w-4" />} onClick={actions?.onInsertHorizontalLine} disabled={disabled} />
        </div>
    )
}
