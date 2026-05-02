"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, Undo, Redo, Image, Link, MessageSquare, AlignLeft, List, ListOrdered, CheckSquare, Minus, Plus } from "lucide-react"

export type EditorToolbarProps = {
    onUndo?: () => void
    onRedo?: () => void
    onPrint?: () => void
    onBold?: () => void
    onItalic?: () => void
    onUnderline?: () => void
    onTextColor?: () => void
    onLink?: () => void
    onAddComment?: () => void
    onImage?: () => void
    onAlignLeft?: () => void
    onBulletList?: () => void
    onNumberedList?: () => void
    onChecklist?: () => void
    onDecreaseIndent?: () => void
    onIncreaseIndent?: () => void
    activeMarks?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
    }
    disabled?: boolean
}

function smallBtnProps() {
  return "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm hover:bg-muted/50"
}

export function EditorToolbar(props: EditorToolbarProps) {
    const { activeMarks = {}, disabled } = props

    function handleAddComment() {
        if (props.onAddComment) return props.onAddComment()
        // fallback: emit global event so CommentPanel can listen
        try {
            window.dispatchEvent(new CustomEvent("editor:addComment"))
        } catch { }
    }

    return (
        <div className="w-full border-b bg-white">
            {/* Menu bar */}
            <div className="flex w-full items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                <div className="flex gap-3">
                    <span className="cursor-default">Tệp</span>
                    <span className="cursor-default">Chỉnh sửa</span>
                    <span className="cursor-default">Xem</span>
                    <span className="cursor-default">Chèn</span>
                    <span className="cursor-default">Định dạng</span>
                    <span className="cursor-default">Công cụ</span>
                    <span className="cursor-default">Tiện ích</span>
                    <span className="cursor-default">Trợ giúp</span>
                </div>
            </div>

            {/* Format toolbar */}
            <div className="flex h-10 w-full items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
                <div className="flex items-center gap-2">
                    <button title="Undo" aria-label="Undo" className={smallBtnProps()} onClick={() => props.onUndo && props.onUndo()} disabled={disabled}><Undo className="h-4 w-4" /></button>
                    <button title="Redo" aria-label="Redo" className={smallBtnProps()} onClick={() => props.onRedo && props.onRedo()} disabled={disabled}><Redo className="h-4 w-4" /></button>
                    <button title="Print" aria-label="Print" className={smallBtnProps()} onClick={() => props.onPrint && props.onPrint()} disabled={disabled}>P</button>
                </div>

                <Separator orientation="vertical" />

                <div className="flex items-center gap-2">
                    <select aria-label="Zoom" defaultValue="100%" className="rounded px-2 py-1 text-sm">
                        <option>50%</option>
                        <option>75%</option>
                        <option>100%</option>
                        <option>125%</option>
                        <option>150%</option>
                    </select>
                    <select aria-label="Style" defaultValue="Normal text" className="rounded px-2 py-1 text-sm">
                        <option>Normal text</option>
                        <option>Heading 1</option>
                    </select>
                    <select aria-label="Font" defaultValue="Arial" className="rounded px-2 py-1 text-sm">
                        <option>Arial</option>
                        <option>Times New Roman</option>
                    </select>
                    <select aria-label="Font size" defaultValue="11" className="rounded px-2 py-1 text-sm">
                        <option>9</option>
                        <option>10</option>
                        <option>11</option>
                        <option>12</option>
                    </select>
                </div>

                <Separator orientation="vertical" />

                <div className="flex items-center gap-2">
                    <button title="Bold" aria-label="Bold" className={`${smallBtnProps()} ${activeMarks.bold ? 'bg-muted/40' : ''}`} onClick={() => props.onBold && props.onBold()} disabled={disabled}><Bold className="h-4 w-4" /></button>
                    <button title="Italic" aria-label="Italic" className={`${smallBtnProps()} ${activeMarks.italic ? 'bg-muted/40' : ''}`} onClick={() => props.onItalic && props.onItalic()} disabled={disabled}><Italic className="h-4 w-4" /></button>
                    <button title="Underline" aria-label="Underline" className={`${smallBtnProps()} ${activeMarks.underline ? 'bg-muted/40' : ''}`} onClick={() => props.onUnderline && props.onUnderline()} disabled={disabled}><Underline className="h-4 w-4" /></button>
                    <button title="Text color" aria-label="Text color" className={smallBtnProps()} onClick={() => props.onTextColor && props.onTextColor()} disabled={disabled}>A</button>
                    <button title="Link" aria-label="Link" className={smallBtnProps()} onClick={() => props.onLink && props.onLink()} disabled={disabled}><Link className="h-4 w-4" /></button>
                    <button title="Add comment" aria-label="Add comment" className={smallBtnProps()} onClick={handleAddComment} disabled={disabled}><MessageSquare className="h-4 w-4" /></button>
                </div>

                <Separator orientation="vertical" />

                <div className="flex items-center gap-2">
                    <button title="Image" aria-label="Image" className={smallBtnProps()} onClick={() => props.onImage && props.onImage()} disabled={disabled}><Image className="h-4 w-4" /></button>
                    <button title="Align" aria-label="Align" className={smallBtnProps()} onClick={() => props.onAlignLeft && props.onAlignLeft()} disabled={disabled}><AlignLeft className="h-4 w-4" /></button>
                    <button title="Line spacing" aria-label="Line spacing" className={smallBtnProps()}><Minus className="h-4 w-4" /></button>
                    <button title="Checklist" aria-label="Checklist" className={smallBtnProps()} onClick={() => props.onChecklist && props.onChecklist()} disabled={disabled}><CheckSquare className="h-4 w-4" /></button>
                    <button title="Bullet list" aria-label="Bullet list" className={smallBtnProps()} onClick={() => props.onBulletList && props.onBulletList()} disabled={disabled}><List className="h-4 w-4" /></button>
                    <button title="Numbered list" aria-label="Numbered list" className={smallBtnProps()} onClick={() => props.onNumberedList && props.onNumberedList()} disabled={disabled}><ListOrdered className="h-4 w-4" /></button>
                    <button title="Decrease indent" aria-label="Decrease indent" className={smallBtnProps()} onClick={() => props.onDecreaseIndent && props.onDecreaseIndent()} disabled={disabled}><Minus className="h-4 w-4" /></button>
                    <button title="Increase indent" aria-label="Increase indent" className={smallBtnProps()} onClick={() => props.onIncreaseIndent && props.onIncreaseIndent()} disabled={disabled}><Plus className="h-4 w-4" /></button>
                </div>
            </div>
        </div>
    )
}

export default EditorToolbar
