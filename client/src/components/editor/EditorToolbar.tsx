"use client"

import React from "react"
import { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, Undo, Redo, Image as ImageIcon, Link, MessageSquare, AlignLeft, List, ListOrdered, CheckSquare, Minus, Plus, AlignCenter, AlignRight, Type, Highlighter } from "lucide-react"

const TextColorIcon = ({ color }: { color: string }) => (
  <div className="relative flex flex-col items-center">
    <Type className="h-4 w-4" /> {/* Dùng icon Type cho chuẩn Docs */}
    <div 
      className="absolute -bottom-[2px] h-[3px] w-full rounded-full" 
      style={{ backgroundColor: color || "#000" }} 
    />
  </div>
);

const HighlightIcon = ({ color }: { color: string }) => (
  <div className="relative flex flex-col items-center">
    <Highlighter className="h-4 w-4" />
    <div 
      className="absolute -bottom-[2px] h-[3px] w-full rounded-full" 
      style={{ backgroundColor: color || "transparent" }} 
    />
  </div>
);

export type EditorToolbarProps = {
    editor: Editor | null
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
    const { activeMarks = {}, disabled, editor } = props

    function handleAddComment() {
        if (props.onAddComment) {
            props.onAddComment()
            return
        }
        console.log("Select text to add a comment")
    }

    // Lấy giá trị cỡ chữ hiện tại từ Editor
    const currentFontSize = editor?.getAttributes('textStyle').fontSize?.replace('px', '') || "16"
    
    // Lấy màu chữ hiện tại từ Editor (mặc định màu đen)
    const currentTextColor = editor?.getAttributes('textStyle').color || "#000000"

    //Xác định kiểu văn bản hiện tại (Style)
    const getCurrentStyle = () => {
        if (editor?.isActive('heading', { level: 1 })) return 'h1'
        if (editor?.isActive('heading', { level: 2 })) return 'h2'
        if (editor?.isActive('heading', { level: 3 })) return 'h3'
        return 'paragraph' // Mặc định là Normal text
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

                <Separator orientation="vertical" className="h-6 mx-1"/>

                <div className="flex items-center gap-2">
                    <select aria-label="Zoom" defaultValue="100%" className="rounded px-2 py-1 text-sm">
                        <option>50%</option>
                        <option>75%</option>
                        <option>100%</option>
                        <option>125%</option>
                        <option>150%</option>
                    </select>
                    <select 
                        aria-label="Style" 
                        value={getCurrentStyle()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'paragraph') {
                                editor?.chain().focus().setParagraph().run();
                            } else if (val === 'h1') {
                                editor?.chain().focus().toggleHeading({ level: 1 }).run();
                            } else if (val === 'h2') {
                                editor?.chain().focus().toggleHeading({ level: 2 }).run();
                            } else if (val === 'h3') {
                                editor?.chain().focus().toggleHeading({ level: 3 }).run();
                            }
                        }}
                        disabled={disabled}
                        className="rounded px-2 py-1 text-sm bg-transparent hover:bg-muted/50 cursor-pointer font-medium"
                    >
                        <option value="paragraph">Normal text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                    <select 
                        aria-label="Font" 
                        onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
                        value={editor?.getAttributes('textStyle').fontFamily || 'Arial'}
                        className="rounded px-2 py-1 text-sm bg-transparent hover:bg-muted/50 cursor-pointer"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                    </select>
                    <select 
                        aria-label="Font size" 
                        value={currentFontSize}
                        onChange={(e) => editor?.chain().focus().setFontSize(`${e.target.value}px`).run()}
                        disabled={disabled}
                        className="rounded px-2 py-1 text-sm bg-transparent hover:bg-muted/50 cursor-pointer"
                    >
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="18">18</option>
                        <option value="24">24</option>
                        <option value="36">36</option>
                    </select>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1"/>

                <div className="flex items-center gap-2">
                    <button title="Bold" aria-label="Bold" className={`${smallBtnProps()} ${activeMarks.bold ? 'bg-muted/40' : ''}`} onClick={() => props.onBold && props.onBold()} disabled={disabled}><Bold className="h-4 w-4" /></button>
                    <button title="Italic" aria-label="Italic" className={`${smallBtnProps()} ${activeMarks.italic ? 'bg-muted/40' : ''}`} onClick={() => props.onItalic && props.onItalic()} disabled={disabled}><Italic className="h-4 w-4" /></button>
                    <button title="Underline" aria-label="Underline" className={`${smallBtnProps()} ${activeMarks.underline ? 'bg-muted/40' : ''}`} onClick={() => props.onUnderline && props.onUnderline()} disabled={disabled}><Underline className="h-4 w-4" /></button>
                    <div title="Text color" className={`${smallBtnProps()} relative overflow-hidden`}>
                        <input 
                            type="color" 
                            value={currentTextColor}
                            onInput={(e) => editor?.chain().focus().setColor(e.currentTarget.value).run()}
                            disabled={disabled}
                            className="absolute -top-2 -left-2 h-12 w-12 cursor-pointer border-0 bg-transparent p-0" 
                        />
                    </div>
                    <button title="Link" aria-label="Link" className={smallBtnProps()} onClick={() => props.onLink && props.onLink()} disabled={disabled}><Link className="h-4 w-4" /></button>
                    <button title="Add comment" aria-label="Add comment" className={smallBtnProps()} onClick={handleAddComment} disabled={disabled}><MessageSquare className="h-4 w-4" /></button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1"/>

                <div className="flex items-center gap-2">
                    <button title="Image" aria-label="Image" className={smallBtnProps()} onClick={() => props.onImage && props.onImage()} disabled={disabled}><ImageIcon className="h-4 w-4" /></button>
                    <button 
                        title="Align Left" 
                        aria-label="Align Left" 
                        className={`${smallBtnProps()} ${editor?.isActive({ textAlign: 'left' }) ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                        disabled={disabled}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </button>
                    <button 
                        title="Align Center" 
                        aria-label="Align Center" 
                        className={`${smallBtnProps()} ${editor?.isActive({ textAlign: 'center' }) ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                        disabled={disabled}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </button>
                    <button 
                        title="Align Right" 
                        aria-label="Align Right" 
                        className={`${smallBtnProps()} ${editor?.isActive({ textAlign: 'right' }) ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                        disabled={disabled}
                    >
                        <AlignRight className="h-4 w-4" />
                    </button>
                    <button title="Line spacing" aria-label="Line spacing" className={smallBtnProps()}><Minus className="h-4 w-4" /></button>
                    <button 
                        title="Checklist" 
                        aria-label="Checklist" 
                        className={`${smallBtnProps()} ${editor?.isActive('taskList') ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().toggleTaskList().run()}
                        disabled={disabled}
                    >
                        <CheckSquare className="h-4 w-4" />
                    </button>                    
                    <button 
                        title="Bullet list" 
                        aria-label="Bullet list" 
                        className={`${smallBtnProps()} ${editor?.isActive('bulletList') ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        disabled={disabled}
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button 
                        title="Numbered list" 
                        aria-label="Numbered list" 
                        className={`${smallBtnProps()} ${editor?.isActive('orderedList') ? 'bg-muted/40' : ''}`}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        disabled={disabled}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </button>
                    <button 
                        title="Decrease indent" 
                        aria-label="Decrease indent" 
                        className={smallBtnProps()}
                        onClick={() => editor?.chain().focus().liftListItem('listItem').run()}
                        disabled={disabled}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <button 
                        title="Increase indent" 
                        aria-label="Increase indent" 
                        className={smallBtnProps()}
                        onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}
                        disabled={disabled}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditorToolbar
