"use client"

import React, { useState } from "react"
import ToolbarSelect from "@/components/editor/ToolbarSelect"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, ListChecks, Indent, Outdent, Highlighter } from "lucide-react"

export default function FormatToolbar({ actions, state, disabled }: { actions?: any; state?: any; disabled?: boolean }) {
    const [textColor, setTextColor] = useState("#000000")
    const [highlightColor, setHighlightColor] = useState("#FFFF00")

    const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.currentTarget.value
        setTextColor(color)
        actions?.onTextColor?.(color)
    }

    const handleHighlightColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.currentTarget.value
        setHighlightColor(color)
        actions?.onHighlightColor?.(color)
    }

    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarSelect ariaLabel="Style" options={["Normal text", "Heading 1", "Heading 2", "Heading 3"]} value={state?.style || "Normal text"} onChange={(v) => actions?.onStyleChange && actions.onStyleChange(v)} />
            <ToolbarSelect ariaLabel="Font" options={["Arial", "Times New Roman", "Roboto", "Inter"]} value={state?.font || "Arial"} onChange={(v) => actions?.onFontChange && actions.onFontChange(v)} />
            <ToolbarSelect ariaLabel="Font size" options={["10", "11", "12", "14", "16", "18", "24"]} value={state?.fontSize || "11"} onChange={(v) => actions?.onFontSizeChange && actions.onFontSizeChange(v)} />

            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Bold" icon={<Bold className="h-4 w-4" />} onClick={actions?.onBold} active={state?.activeMarks?.bold} disabled={disabled} />
            <ToolbarIconButton label="Italic" icon={<Italic className="h-4 w-4" />} onClick={actions?.onItalic} active={state?.activeMarks?.italic} disabled={disabled} />
            <ToolbarIconButton label="Underline" icon={<Underline className="h-4 w-4" />} onClick={actions?.onUnderline} active={state?.activeMarks?.underline} disabled={disabled} />
            
            <div title="Text color" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm hover:bg-muted/50 relative overflow-hidden">
                <input 
                    type="color" 
                    value={textColor}
                    onChange={handleTextColorChange}
                    disabled={disabled}
                    className="absolute -top-2 -left-2 h-12 w-12 cursor-pointer border-0 bg-transparent p-0" 
                />
                <Type className="h-4 w-4 pointer-events-none" />
            </div>
            
            <div title="Highlight color" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm hover:bg-muted/50 relative overflow-hidden">
                <input 
                    type="color" 
                    value={highlightColor}
                    onChange={handleHighlightColorChange}
                    disabled={disabled}
                    className="absolute -top-2 -left-2 h-12 w-12 cursor-pointer border-0 bg-transparent p-0" 
                />
                <Highlighter className="h-4 w-4 pointer-events-none" />
            </div>

            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Căn trái" icon={<AlignLeft className="h-4 w-4" />} onClick={actions?.onAlignLeft} active={state?.activeAlignment === 'left'} disabled={disabled} />
            <ToolbarIconButton label="Căn giữa" icon={<AlignCenter className="h-4 w-4" />} onClick={actions?.onAlignCenter} active={state?.activeAlignment === 'center'} disabled={disabled} />
            <ToolbarIconButton label="Căn phải" icon={<AlignRight className="h-4 w-4" />} onClick={actions?.onAlignRight} active={state?.activeAlignment === 'right'} disabled={disabled} />

            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Danh sách dấu đầu dòng" icon={<List className="h-4 w-4" />} onClick={actions?.onBulletList} disabled={disabled} />
            <ToolbarIconButton label="Danh sách đánh số" icon={<ListOrdered className="h-4 w-4" />} onClick={actions?.onNumberedList} disabled={disabled} />
            <ToolbarIconButton label="Checklist" icon={<ListChecks className="h-4 w-4" />} onClick={actions?.onChecklist} disabled={disabled} />
            <ToolbarIconButton label="Giảm thụt" icon={<Outdent className="h-4 w-4" />} onClick={actions?.onDecreaseIndent} disabled={disabled} />
            <ToolbarIconButton label="Tăng thụt" icon={<Indent className="h-4 w-4" />} onClick={actions?.onIncreaseIndent} disabled={disabled} />
        </div>
    )
}
