"use client"

import React from "react"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Image as ImageIcon, Link, Unlink, MessageSquare, Table, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2, Rows3, Columns3, Delete, TableProperties } from "lucide-react"
export default function InsertToolbar({ actions, state, disabled }: { actions?: any; state?: any; disabled?: boolean }) {
    console.log("Current State:", state);
    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarIconButton label="Hình ảnh" icon={<ImageIcon className="h-4 w-4" />} onClick={actions?.onInsertImage} disabled={disabled} />
            <ToolbarIconButton label="Liên kết" icon={<Link className="h-4 w-4" />} onClick={actions?.onInsertLink} disabled={disabled} />
            {state?.isLink && (
                <ToolbarIconButton label="Xóa Liên kết" icon={<Unlink className="h-4 w-4" />} onClick={actions?.onRemoveLink} disabled={disabled} />
            )}
            <ToolbarIconButton label="Bình luận" icon={<MessageSquare className="h-4 w-4" />} onClick={actions?.onAddComment} disabled={disabled} />
            <ToolbarIconButton label="Đường ngang" icon={<Minus className="h-4 w-4" />} onClick={actions?.onInsertHorizontalLine} disabled={disabled} />

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <ToolbarIconButton label="Tạo Bảng" icon={<Table className="h-4 w-4 text-blue-600" />} onClick={actions?.onInsertTable} disabled={disabled} />
            {state?.isInsideTable && (
                <>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <div className="flex gap-0.5">
                        <ToolbarIconButton label="Thêm hàng trên" icon={<ArrowUp className="h-3.5 w-3.5" />} onClick={actions?.onInsertRowAbove} disabled={disabled} />
                        <ToolbarIconButton label="Thêm hàng dưới" icon={<ArrowDown className="h-3.5 w-3.5" />} onClick={actions?.onInsertRowBelow} disabled={disabled} />
                        <ToolbarIconButton label="Thêm cột trái" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={actions?.onInsertColumnLeft} disabled={disabled} />
                        <ToolbarIconButton label="Thêm cột phải" icon={<ArrowRight className="h-3.5 w-3.5" />} onClick={actions?.onInsertColumnRight} disabled={disabled} />
                    </div>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <ToolbarIconButton label="Xóa hàng" icon={<Rows3 className="h-3.5 w-3.5 text-red-600" />} onClick={actions?.onDeleteRow} disabled={disabled} />
                    <ToolbarIconButton label="Xóa cột" icon={<Columns3 className="h-3.5 w-3.5 text-red-600" />} onClick={actions?.onDeleteColumn} disabled={disabled} />
                    <ToolbarIconButton label="Xóa bảng" icon={<TableProperties className="h-4 w-4 text-red-600" />} onClick={actions?.onDeleteTable} disabled={disabled} />
                </>
            )}
        </div>
    )
}
