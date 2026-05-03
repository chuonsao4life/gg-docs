"use client"

import React from "react"
import { Save, Pen, Copy, Download, Printer } from "lucide-react"

import ToolbarIconButton from "@/components/editor/ToolbarIconButton"

export default function FileToolbar({ actions, disabled }: { actions?: any; disabled?: boolean }) {
    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarIconButton label="Lưu" icon={<Save className="h-4 w-4" />} onClick={actions?.onSave} disabled={disabled} />
            <ToolbarIconButton label="Đổi tên" icon={<Pen className="h-4 w-4" />} onClick={actions?.onRename} disabled={disabled} />
            <ToolbarIconButton label="Tạo bản sao" icon={<Copy className="h-4 w-4" />} onClick={actions?.onMakeCopy} disabled={disabled} />
            <ToolbarIconButton label="Tải PDF" icon={<Download className="h-4 w-4" />} onClick={actions?.onDownloadPdf} disabled={disabled} />
            <ToolbarIconButton label="In" icon={<Printer className="h-4 w-4" />} onClick={actions?.onPrint} disabled={disabled} />
        </div>
    )
}
