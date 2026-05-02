"use client"

import React from "react"
import ToolbarSelect from "@/components/editor/ToolbarSelect"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Ruler, ListTree, Maximize } from "lucide-react"

export default function ViewToolbar({ actions, state, disabled }: { actions?: any; state?: any; disabled?: boolean }) {
    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarSelect ariaLabel="Thu phóng" options={["75%", "90%", "100%", "125%", "150%"]} value={state?.zoom || "100%"} onChange={(v) => actions?.onZoomChange && actions.onZoomChange(v)} />
            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label={state?.showRuler ? "Ẩn thước" : "Thước kẻ"} icon={<Ruler className="h-4 w-4" />} onClick={actions?.onToggleRuler} disabled={disabled} />
            <ToolbarIconButton label={state?.showOutline ? "Ẩn dàn ý" : "Dàn ý"} icon={<ListTree className="h-4 w-4" />} onClick={actions?.onToggleOutline} disabled={disabled} />
            <ToolbarIconButton label="Toàn màn hình" icon={<Maximize className="h-4 w-4" />} onClick={actions?.onFullScreen} disabled={disabled} />
        </div>
    )
}
