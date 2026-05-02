"use client"

import React, { ReactNode } from "react"
import { Navbar } from "@/components/layout/Navbar"
import EditorMenuBar from "@/components/editor/EditorMenuBar"
import EditorDynamicToolbar from "@/components/editor/EditorDynamicToolbar"
import { useState } from "react"
import type { EditorMenuKey } from "@/types/editor-menu"
import type { EditorToolbarActions, EditorToolbarState } from "@/types/editor-toolbar"
import type { EditorSelectionRange } from "@/types/editor-selection"
import { Sidebar } from "@/components/layout/Sidebar"
import { CommentPanel } from "@/components/comments/CommentPanel"

export function AppLayout({
    children,
    documentId,
    title,
}: {
    children: ReactNode
    documentId: string
    title?: string
}) {
    const [activeMenu, setActiveMenu] = useState<EditorMenuKey>("format")
    const [selectedRange, setSelectedRange] = useState<EditorSelectionRange | null>(null)

    const handleChangeMenu = (menu: EditorMenuKey) => {
        console.log("Active menu:", menu)
        setActiveMenu(menu)
    }

    const toolbarActions: EditorToolbarActions = {
        onSave: () => console.log("save"),
        onUndo: () => console.log("undo"),
        onRedo: () => console.log("redo"),
        onBold: () => console.log("bold"),
        onItalic: () => console.log("italic"),
        onUnderline: () => console.log("underline"),
        onInsertImage: () => console.log("insert image"),
        onInsertLink: () => console.log("insert link"),
        onAddComment: () => {
            if (!selectedRange) {
                window.alert("Select text to comment")
                return
            }
            try {
                window.dispatchEvent(new CustomEvent("editor:addComment"))
            } catch { }
        },
    }

    const toolbarState: EditorToolbarState = {
        zoom: "100%",
        style: "Normal text",
        font: "Arial",
        fontSize: "11",
        showRuler: false,
        showOutline: false,
        activeMarks: { bold: false, italic: false, underline: false },
        activeAlignment: "left",
    }

    const editorChildren = React.isValidElement<Record<string, unknown>>(children)
        ? React.cloneElement(children, {
            selectedRange,
            setSelectedRange,
            onRequestAddComment: toolbarActions.onAddComment,
        })
        : children

    return (
        <div className="flex h-screen flex-col">
            <Navbar title={title} />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Menu bar + dynamic toolbar */}
                <EditorMenuBar activeMenu={activeMenu} onChangeMenu={handleChangeMenu} />
                <EditorDynamicToolbar activeMenu={activeMenu} actions={toolbarActions} state={toolbarState} />

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />

                    <main className="flex-1 overflow-auto bg-slate-50 p-6" style={{ height: 'calc(100vh - 56px - 72px)' }}>
                        <div className="mx-auto w-full max-w-[900px] rounded-md">
                            <div className="mx-auto max-w-[820px]">
                                <div className="mx-auto w-full max-w-[820px]">
                                    <div className="mx-auto w-full max-w-[820px]">
                                        <div className="mx-auto w-full max-w-[820px] bg-transparent">
                                            <div className="mx-auto w-full max-w-[820px]">
                                                <div className="mx-auto w-full max-w-[820px]">
                                                    <div className="mx-auto w-full max-w-[820px] rounded-md bg-white p-8 shadow-sm">
                                                        {editorChildren}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <div className="hidden w-80 border-l bg-muted md:block">
                        <CommentPanel documentId={documentId} selectedRange={selectedRange} />
                    </div>
                </div>
            </div>
        </div>
    )
}
