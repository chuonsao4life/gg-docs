"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import EditorMenuBar from "@/components/editor/EditorMenuBar"
import EditorDynamicToolbar from "@/components/editor/EditorDynamicToolbar"
import { MarginControls } from "@/components/editor/MarginControls"
import { PaginatedEditorShell } from "@/components/editor/PaginatedEditorShell"
import { PageRuler } from "@/components/editor/PageRuler"
import type { EditorMenuKey } from "@/types/editor-menu"
import type { EditorToolbarActions, EditorToolbarState } from "@/types/editor-toolbar"
import type { EditorSelectionRange } from "@/types/editor-selection"
import type { DocumentComment } from "@/types/comment"
import { DEFAULT_PAGE_MARGINS, type PageMargins } from "@/types/page-layout"
import { CommentPanel } from "@/components/comments/CommentPanel"
import { createDocumentComment, listDocumentComments, renameDashboardDocument } from "@/services/document.service"

export function AppLayout({
    children,
    documentId,
    title,
    editor,
}: {
    children: ReactNode
    documentId: string
    title?: string
    editor: any
}) {
    const [activeMenu, setActiveMenu] = useState<EditorMenuKey>("format")
    const [selectedRange, setSelectedRange] = useState<EditorSelectionRange | null>(null)
    const [comments, setComments] = useState<DocumentComment[]>([])
    const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false)
    const [isComposerOpen, setIsComposerOpen] = useState(false)
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
    const [commentDraftRange, setCommentDraftRange] = useState<EditorSelectionRange | null>(null)
    const [pageMargins, setPageMargins] = useState<PageMargins>(DEFAULT_PAGE_MARGINS)
    const [showMarginControls, setShowMarginControls] = useState(false)

    useEffect(() => {
        let active = true

        listDocumentComments(documentId)
            .then((nextComments) => {
                if (active) setComments(nextComments)
            })
            .catch((error) => {
                console.warn("Unable to load comments", error)
            })

        return () => {
            active = false
        }
    }, [documentId])

    const handleChangeMenu = (menu: EditorMenuKey) => {
        console.log("Active menu:", menu)
        setActiveMenu(menu)
    }

    const handleStartCommentFromSelection = () => {
        const browserSelection = typeof window !== "undefined" ? window.getSelection()?.toString().trim() : ""
        const fallbackRange: EditorSelectionRange = {
            from: 0,
            to: browserSelection?.length || 0,
            text: browserSelection || "Toàn bộ tài liệu",
        }
        const nextRange = selectedRange || fallbackRange

        setIsCommentPanelOpen(true)
        setIsComposerOpen(true)
        setCommentDraftRange(nextRange)
        setSelectedRange(null)
        setActiveCommentId(null)
    }

    const handleSubmitComment = async (content: string) => {
        const trimmedContent = content.trim()
        if (!commentDraftRange || !trimmedContent) return

        try {
            const newComment = await createDocumentComment(documentId, {
                content: trimmedContent,
                selectedText: commentDraftRange.text,
                fromPos: commentDraftRange.from,
                toPos: commentDraftRange.to,
            })

            setComments((prev) => [...prev, newComment])
            setActiveCommentId(newComment.id)
            setIsComposerOpen(false)
            setIsCommentPanelOpen(true)
            setSelectedRange(null)
            setCommentDraftRange(null)
        } catch (error) {
            console.warn("Unable to create comment", error)
        }
    }

    const handleSelectComment = (commentId: string) => {
        setActiveCommentId(commentId)
        setIsCommentPanelOpen(true)
        setIsComposerOpen(false)
        setSelectedRange(null)
        setCommentDraftRange(null)
    }

    const toolbarActions: EditorToolbarActions = {
        onSave: () => console.log("save"),
        onUndo: () => editor?.chain().focus().undo().run(),
        onRedo: () => editor?.chain().focus().redo().run(),
        onBold: () => editor?.chain().focus().toggleBold().run(),
        onItalic: () => editor?.chain().focus().toggleItalic().run(),
        onUnderline: () => editor?.chain().focus().toggleUnderline().run(),
        onInsertImage: () => console.log("insert image"),
        onInsertLink: () => console.log("insert link"),
        onAddComment: handleStartCommentFromSelection,
        onToggleMarginControls: () => setShowMarginControls((visible) => !visible),
    }

    const toolbarState: EditorToolbarState = {
        zoom: "100%",
        style: "Normal text",
        font: "Arial",
        fontSize: "11",
        showRuler: false,
        showOutline: false,
        showMarginControls,
        activeMarks: { bold: editor?.isActive("bold") || false, italic: editor?.isActive("italic") || false, underline: editor?.isActive("underline") || false },
        activeAlignment: "left",
    }

    const editorChildren = React.isValidElement<Record<string, unknown>>(children)
        ? React.cloneElement(children, {
            selectedRange: isComposerOpen ? null : selectedRange,
            draftRange: commentDraftRange,
            comments,
            activeCommentId,
            onSelectionChange: (range: EditorSelectionRange | null) => {
                if (!isComposerOpen) setSelectedRange(range)
            },
            onStartComment: handleStartCommentFromSelection,
            onSelectComment: handleSelectComment,
        })
        : children

    return (
        <div className="flex h-screen flex-col">
            <Navbar
                key={`${documentId}-${title}`}
                documentId={documentId}
                title={title}
                onExportPdf={() => window.print()}
                onRename={async (nextTitle) => {
                    await renameDashboardDocument(documentId, nextTitle)
                }}
                onToggleComments={() => {
                    setIsCommentPanelOpen((open) => !open)
                    setIsComposerOpen(false)
                    setCommentDraftRange(null)
                }}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Menu bar + dynamic toolbar */}
                <EditorMenuBar activeMenu={activeMenu} onChangeMenu={handleChangeMenu} />
                <EditorDynamicToolbar activeMenu={activeMenu} actions={toolbarActions} state={toolbarState} />

                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 overflow-hidden bg-gray-100">
                        <div className="flex h-full flex-col">
                            <PageRuler margins={pageMargins} onMarginsChange={setPageMargins} />
                            {showMarginControls && (
                                <MarginControls margins={pageMargins} onChange={setPageMargins} />
                            )}
                            <div className="flex-1 overflow-auto">
                                <PaginatedEditorShell
                                    margins={pageMargins}
                                    onMarginsChange={setPageMargins}
                                    pageCount={2}
                                >
                                    {editorChildren}
                                </PaginatedEditorShell>
                            </div>
                        </div>
                    </main>

                    {isCommentPanelOpen && (
                        <div className="hidden w-80 shrink-0 md:block">
                            <CommentPanel
                                documentId={documentId}
                                comments={comments}
                                draftRange={commentDraftRange}
                                isComposerOpen={isComposerOpen}
                                activeCommentId={activeCommentId}
                                onClose={() => {
                                    setIsCommentPanelOpen(false)
                                    setIsComposerOpen(false)
                                    setCommentDraftRange(null)
                                }}
                                onSubmitComment={handleSubmitComment}
                                onCancelComposer={() => {
                                    setIsComposerOpen(false)
                                    setCommentDraftRange(null)
                                }}
                                onSelectComment={handleSelectComment}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
