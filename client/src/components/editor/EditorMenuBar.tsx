"use client"

import React from "react"
import { EDITOR_MENUS, type EditorMenuKey } from "@/types/editor-menu"

export function EditorMenuBar({ activeMenu, onChangeMenu }: { activeMenu: EditorMenuKey; onChangeMenu: (m: EditorMenuKey) => void }) {
    return (
        <nav className="flex items-center gap-2 overflow-x-auto bg-white px-3 py-1">
            {EDITOR_MENUS.map((m) => (
                <button
                    key={m.key}
                    type="button"
                    onClick={() => onChangeMenu(m.key)}
                    title={m.label}
                    aria-label={m.label}
                    className={`rounded px-3 py-1 text-sm ${activeMenu === m.key ? "bg-muted/30" : "hover:bg-muted/20"}`}
                >
                    {m.label}
                </button>
            ))}
        </nav>
    )
}

export default EditorMenuBar
