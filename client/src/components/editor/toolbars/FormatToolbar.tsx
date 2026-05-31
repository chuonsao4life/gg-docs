"use client"

import React, { useState, useEffect, useRef } from "react"
import ToolbarSelect from "@/components/editor/ToolbarSelect"
import ToolbarIconButton from "@/components/editor/ToolbarIconButton"
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, ListChecks, Indent, Outdent, Highlighter } from "lucide-react"

export default function FormatToolbar({ actions, state, disabled }: { actions?: any; state?: any; disabled?: boolean }) {
    const fontDisplay = state?.font?.replace(/['"]/g, '') || "Arial"
    const styleDisplayMap: Record<string, string> = {
        "paragraph": "Paragraph",
        "h1": "Heading 1",
        "h2": "Heading 2",
        "h3": "Heading 3"
    };

    const currentStyleDisplay = styleDisplayMap[state?.style] || "Paragraph";
    
    const [localFontSize, setLocalFontSize] = useState(state?.fontSize?.replace(/[^0-9.]/g, '') || "11")
    const fontSizeInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (fontSizeInputRef.current === document.activeElement) return
        const newSize = state?.fontSize?.replace(/[^0-9.]/g, '') || "11"
        setLocalFontSize(newSize)
    }, [state?.fontSize])

    const currentTextColor = state?.textColor || "#000000"
    
    const currentHighlightColor = state?.highlightColor && state.highlightColor !== "transparent" 
        ? state.highlightColor 
        : "#FFFF00" 
        
    const isHighlightTransparent = !state?.highlightColor || state?.highlightColor === "transparent"

    const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        actions?.onTextColor?.(e.currentTarget.value)
    }

    const handleHighlightColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        actions?.onHighlightColor?.(e.currentTarget.value)
    }

    return (
        <div className="flex h-10 items-center gap-1 overflow-x-auto whitespace-nowrap border-b bg-white px-4">
            <ToolbarSelect ariaLabel="Style" options={["Paragraph", "Heading 1", "Heading 2", "Heading 3"]} value={currentStyleDisplay} onChange={(v) => actions?.onStyleChange && actions.onStyleChange(v)} />
            <select 
                className="h-8 border border-gray-300 rounded px-2 text-sm bg-transparent hover:bg-gray-50 outline-none cursor-pointer"
                value={fontDisplay}
                onChange={(e) => actions?.onFontChange?.(e.target.value)}
            >
                {["Arial", "Times New Roman", "Roboto", "Inter", "Georgia", "Verdana"].map(f => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                ))}
            </select> 

            {/* Font Size Input */}
            <div className="flex items-center border border-gray-300 rounded hover:bg-gray-50 px-1 h-8 bg-white relative group">
                <input
                    ref={fontSizeInputRef}
                    type="number"
                    value={localFontSize}
                    onChange={(e) => {
                        const value = e.target.value
                        setLocalFontSize(value)
                        if (value && !isNaN(Number(value)) && Number(value) > 0) {
                            actions?.onFontSizeChange?.(value)
                        }
                    }}
                    onBlur={(e) => {
                        const value = e.target.value || "11"
                        setLocalFontSize(value)
                        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                            actions?.onFontSizeChange?.("11")
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            ;(e.target as HTMLInputElement).blur()
                        }
                    }}
                    disabled={disabled}
                    min="1"
                    max="100"
                    className="w-14 text-center text-sm bg-transparent outline-none font-medium cursor-pointer"
                />
            </div>
                        
            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Bold" icon={<Bold className="h-4 w-4" />} onClick={actions?.onBold} active={state?.activeMarks?.bold} disabled={disabled} />
            <ToolbarIconButton label="Italic" icon={<Italic className="h-4 w-4" />} onClick={actions?.onItalic} active={state?.activeMarks?.italic} disabled={disabled} />
            <ToolbarIconButton label="Underline" icon={<Underline className="h-4 w-4" />} onClick={actions?.onUnderline} active={state?.activeMarks?.underline} disabled={disabled} />
            
            <div title="Text color" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm hover:bg-muted/50 relative cursor-pointer">
                <div className="relative flex flex-col items-center">
                    <Type className="h-4 w-4" />
                    <div 
                        className="absolute -bottom-[2px] h-[3px] w-full rounded-full" 
                        style={{ backgroundColor: currentTextColor }} 
                    />
                </div>
                <input 
                    type="color" 
                    value={currentTextColor}
                    onChange={handleTextColorChange}
                    disabled={disabled}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                />
            </div>
            
            <div title="Highlight color" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm hover:bg-muted/50 relative cursor-pointer">
                <div className="relative flex flex-col items-center">
                    <Highlighter className="h-4 w-4" />
                    <div 
                        className="absolute -bottom-[2px] h-[3px] w-full rounded-full" 
                        style={{ backgroundColor: isHighlightTransparent ? "transparent" : currentHighlightColor }} 
                    />
                </div>
                <input 
                    type="color" 
                    value={currentHighlightColor}
                    onChange={handleHighlightColorChange}
                    disabled={disabled}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                />
            </div>

            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Căn trái" icon={<AlignLeft className="h-4 w-4" />} onClick={actions?.onAlignLeft} active={state?.alignment === 'left'} disabled={disabled} />
            <ToolbarIconButton label="Căn giữa" icon={<AlignCenter className="h-4 w-4" />} onClick={actions?.onAlignCenter} active={state?.alignment === 'center'} disabled={disabled} />
            <ToolbarIconButton label="Căn phải" icon={<AlignRight className="h-4 w-4" />} onClick={actions?.onAlignRight} active={state?.alignment === 'right'} disabled={disabled} />
            <ToolbarIconButton label="Căn đều" icon={<AlignJustify className="h-4 w-4" />} onClick={actions?.onAlignJustify} active={state?.alignment === 'justify'} disabled={disabled} />
            
            <div className="mx-1 h-6 w-px shrink-0 bg-gray-300" />
            <ToolbarIconButton label="Danh sách dấu đầu dòng" icon={<List className="h-4 w-4" />} onClick={actions?.onBulletList} active={state?.style === 'bullet'} disabled={disabled} />
            <ToolbarIconButton label="Danh sách đánh số" icon={<ListOrdered className="h-4 w-4" />} onClick={actions?.onNumberedList} active={state?.style === 'number'} disabled={disabled} />
            <ToolbarIconButton label="Checklist" icon={<ListChecks className="h-4 w-4" />} onClick={actions?.onChecklist} active={state?.style === 'check'} disabled={disabled} />
            <ToolbarIconButton label="Giảm thụt" icon={<Outdent className="h-4 w-4" />} onClick={actions?.onDecreaseIndent} active={false} disabled={disabled} />
            <ToolbarIconButton label="Tăng thụt" icon={<Indent className="h-4 w-4" />} onClick={actions?.onIncreaseIndent} active={false} disabled={disabled} />
        </div>
    )
}