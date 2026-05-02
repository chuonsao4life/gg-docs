export type EditorToolbarActions = {
    onSave?: () => void
    onRename?: () => void
    onMakeCopy?: () => void
    onDownloadPdf?: () => void
    onPrint?: () => void

    onUndo?: () => void
    onRedo?: () => void
    onCut?: () => void
    onCopy?: () => void
    onPaste?: () => void
    onSelectAll?: () => void

    onZoomChange?: (zoom: string) => void
    onToggleRuler?: () => void
    onToggleOutline?: () => void
    onFullScreen?: () => void

    onInsertImage?: () => void
    onInsertLink?: () => void
    onAddComment?: () => void
    onInsertTable?: () => void
    onInsertHorizontalLine?: () => void

    onStyleChange?: (style: string) => void
    onFontChange?: (font: string) => void
    onFontSizeChange?: (size: string) => void
    onBold?: () => void
    onItalic?: () => void
    onUnderline?: () => void
    onTextColor?: () => void
    onHighlightColor?: () => void
    onAlignLeft?: () => void
    onAlignCenter?: () => void
    onAlignRight?: () => void
    onBulletList?: () => void
    onNumberedList?: () => void
    onChecklist?: () => void
    onDecreaseIndent?: () => void
    onIncreaseIndent?: () => void

    onSpellingCheck?: () => void
    onWordCount?: () => void
    onPreferences?: () => void

    onManageExtensions?: () => void

    onOpenHelp?: () => void
    onKeyboardShortcuts?: () => void
    onAbout?: () => void
}

export type EditorToolbarState = {
    zoom?: string
    style?: string
    font?: string
    fontSize?: string
    showRuler?: boolean
    showOutline?: boolean
    activeMarks?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
    }
    activeAlignment?: "left" | "center" | "right" | "justify"
}
