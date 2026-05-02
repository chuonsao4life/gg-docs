"use client"

import React from "react"
import { type EditorMenuKey } from "@/types/editor-menu"
import type { EditorToolbarActions, EditorToolbarState } from "@/types/editor-toolbar"

import FileToolbar from "@/components/editor/toolbars/FileToolbar"
import EditToolbar from "@/components/editor/toolbars/EditToolbar"
import ViewToolbar from "@/components/editor/toolbars/ViewToolbar"
import InsertToolbar from "@/components/editor/toolbars/InsertToolbar"
import FormatToolbar from "@/components/editor/toolbars/FormatToolbar"
import ToolsToolbar from "@/components/editor/toolbars/ToolsToolbar"
import ExtensionsToolbar from "@/components/editor/toolbars/ExtensionsToolbar"
import HelpToolbar from "@/components/editor/toolbars/HelpToolbar"

export function EditorDynamicToolbar({
    activeMenu,
    actions,
    state,
    disabled,
}: {
    activeMenu: EditorMenuKey
    actions?: EditorToolbarActions
    state?: EditorToolbarState
    disabled?: boolean
}) {
    switch (activeMenu) {
        case "file":
            return <FileToolbar actions={actions} disabled={disabled} />
        case "edit":
            return <EditToolbar actions={actions} disabled={disabled} />
        case "view":
            return <ViewToolbar actions={actions} state={state} disabled={disabled} />
        case "insert":
            return <InsertToolbar actions={actions} disabled={disabled} />
        case "format":
            return <FormatToolbar actions={actions} state={state} disabled={disabled} />
        case "tools":
            return <ToolsToolbar actions={actions} disabled={disabled} />
        case "extensions":
            return <ExtensionsToolbar actions={actions} disabled={disabled} />
        case "help":
            return <HelpToolbar actions={actions} disabled={disabled} />
        default:
            return <FormatToolbar actions={actions} state={state} />
    }
}

export default EditorDynamicToolbar
