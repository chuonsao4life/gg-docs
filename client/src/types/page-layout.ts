export type PageMargins = {
    top: number
    right: number
    bottom: number
    left: number
}

export type EditorPageLayoutProps = {
    margins: PageMargins
    pageWidth: number
    pageHeight: number
}

export const DEFAULT_PAGE_MARGINS: PageMargins = {
    top: 72,
    right: 72,
    bottom: 72,
    left: 72,
}
