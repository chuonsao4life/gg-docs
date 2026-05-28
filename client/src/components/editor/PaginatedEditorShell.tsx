"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { DEFAULT_PAGE_MARGINS, type PageMargins } from "@/types/page-layout"

type PaginatedEditorShellProps = {
    children?: React.ReactNode
    margins?: PageMargins
    onMarginsChange?: (margins: PageMargins) => void
    pageCount?: number
    pageWidth?: number
    pageHeight?: number
}

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const MIN_MARGIN = 16
const MAX_MARGIN = 160
const VERTICAL_TICK_COUNT = 28

function clampMargin(value: number) {
    if (!Number.isFinite(value)) return MIN_MARGIN
    return Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, value))
}

type VerticalPageRulerProps = {
    margins: PageMargins
    onMarginsChange?: (margins: PageMargins) => void
    pageHeight: number
}

export function VerticalPageRuler({ margins, onMarginsChange }: Omit<VerticalPageRulerProps, 'pageHeight'>) {
    const rulerRef = useRef<HTMLDivElement | null>(null)
    const [draggingHandle, setDraggingHandle] = useState<"top" | "bottom" | null>(null)
    const [localMargins, setLocalMargins] = useState<PageMargins>(margins)
    const localMarginsRef = useRef(margins)

    useEffect(() => {
        if (!draggingHandle) {
            setLocalMargins(margins)
            localMarginsRef.current = margins
        }
    }, [margins, draggingHandle])

    const getPageY = useCallback((clientY: number) => {
        const ruler = rulerRef.current
        if (!ruler) return 0

        const rect = ruler.getBoundingClientRect()
        return Math.min(rect.height, Math.max(0, clientY - rect.top))
    }, [])

    const updateVerticalMargin = useCallback((handle: "top" | "bottom", clientY: number) => {
        if (!onMarginsChange) return

        const pageY = getPageY(clientY)
        const rulerHeight = rulerRef.current?.getBoundingClientRect().height || 1000
        const nextMargin = handle === "top"
            ? clampMargin(pageY)
            : clampMargin(rulerHeight - pageY)

        const nextMargins = {
            ...localMarginsRef.current,
            [handle]: nextMargin,
        }

        // Instant visual update for the ruler handle
        setLocalMargins(nextMargins)
        localMarginsRef.current = nextMargins

        // Defer the heavy global layout update so it doesn't block the UI thread during drag
        React.startTransition(() => {
            onMarginsChange(nextMargins)
        })
    }, [getPageY, onMarginsChange])

    useEffect(() => {
        if (!draggingHandle) return
        const activeHandle = draggingHandle

        function handlePointerMove(event: PointerEvent) {
            updateVerticalMargin(activeHandle, event.clientY)
        }

        function handlePointerUp() {
            setDraggingHandle(null)
        }

        window.addEventListener("pointermove", handlePointerMove)
        window.addEventListener("pointerup", handlePointerUp)

        return () => {
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerup", handlePointerUp)
        }
    }, [draggingHandle, updateVerticalMargin])

    return (
        <div
            ref={rulerRef}
            className="relative w-7 shrink-0 border-r bg-gray-50"
            style={{ height: "100%" }}
            onClick={(event) => {
                if (!onMarginsChange) return
                const pageY = getPageY(event.clientY)
                const rulerHeight = rulerRef.current?.getBoundingClientRect().height || 1000
                updateVerticalMargin(pageY <= rulerHeight / 2 ? "top" : "bottom", event.clientY)
            }}
        >
            <div
                className="absolute inset-x-0 top-0 bg-blue-100/70"
                style={{ height: localMargins.top }}
                title="Top margin"
            />
            <div
                className="absolute inset-x-0 bottom-0 bg-blue-100/70"
                style={{ height: localMargins.bottom }}
                title="Bottom margin"
            />
            {Array.from({ length: VERTICAL_TICK_COUNT }, (_, tick) => (
                <span
                    key={tick}
                    className="absolute right-0 h-px bg-gray-400"
                    style={{
                        top: `${(tick / (VERTICAL_TICK_COUNT - 1)) * 100}%`,
                        width: tick % 4 === 0 ? 18 : tick % 2 === 0 ? 12 : 7,
                    }}
                />
            ))}
            <button
                type="button"
                aria-label="Top margin"
                className="absolute left-1 h-2 w-5 -translate-y-1/2 cursor-ns-resize rounded-sm bg-blue-500 shadow outline-none ring-blue-300 focus:ring-2"
                style={{ top: localMargins.top }}
                title="Top margin"
                onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setDraggingHandle("top")
                    updateVerticalMargin("top", event.clientY)
                }}
                onClick={(event) => event.stopPropagation()}
            />
            <button
                type="button"
                aria-label="Bottom margin"
                className="absolute left-1 h-2 w-5 translate-y-1/2 cursor-ns-resize rounded-sm bg-blue-500 shadow outline-none ring-blue-300 focus:ring-2"
                style={{ bottom: localMargins.bottom }}
                title="Bottom margin"
                onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setDraggingHandle("bottom")
                    updateVerticalMargin("bottom", event.clientY)
                }}
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    )
}

export function PaginatedEditorShell({
    children,
    margins = DEFAULT_PAGE_MARGINS,
    onMarginsChange,
    pageCount = 1,
    pageWidth = PAGE_WIDTH,
    pageHeight = PAGE_HEIGHT,
}: PaginatedEditorShellProps) {
    const [dynamicPageCount, setDynamicPageCount] = useState(pageCount);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!overlayRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                const neededPages = Math.max(1, Math.ceil(height / (pageHeight + 32)));
                setDynamicPageCount(neededPages);
            }
        });
        
        observer.observe(overlayRef.current);
        return () => observer.disconnect();
    }, [pageHeight]);

    const pages = Array.from({ length: Math.max(pageCount, dynamicPageCount) }, (_, index) => index);

    return (
        <div className="min-w-max px-8 py-8 relative print:px-0 print:py-0 print:min-w-0">
            <style>{`
                @media print {
                    @page {
                        size: ${pageWidth}px ${pageHeight}px;
                        margin: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Hide everything outside this editor context if needed */
                    .print-hide {
                        display: none !important;
                    }
                    /* Ensure the overlay is in the normal flow for pagination */
                    .print-static {
                        position: relative !important;
                        top: auto !important;
                        bottom: auto !important;
                        left: auto !important;
                        right: auto !important;
                    }
                    /* Remove fake margins during print because @page handles it */
                    .print-no-padding {
                        padding: 0 !important;
                        width: auto !important;
                    }
                }
            `}</style>
            
            {/* Background Pages Layer */}
            <div className="mx-auto flex w-fit flex-col gap-8 print-hide">
                {pages.map((pageIndex) => (
                    <div key={pageIndex} className="flex items-start gap-3">
                        <div className="w-7 shrink-0" />

                        <section
                            className="bg-white shadow-sm ring-1 ring-gray-200"
                            style={{
                                width: pageWidth,
                                height: pageHeight,
                                boxSizing: "border-box",
                            }}
                            aria-label={`Page ${pageIndex + 1}`}
                        >
                            <div
                                className="relative h-full w-full pointer-events-none"
                                style={{
                                    paddingTop: `${margins.top}px`,
                                    paddingRight: `${margins.right}px`,
                                    paddingBottom: `${margins.bottom}px`,
                                    paddingLeft: `${margins.left}px`,
                                    boxSizing: "border-box",
                                }}
                            >
                                <div className="h-full w-full outline outline-1 outline-dashed outline-transparent flex items-center justify-center">
                                    <div className="hidden text-sm text-transparent select-none">Page {pageIndex + 1}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                ))}
            </div>

            {/* Editor Overlay Layer */}
            <div className="absolute inset-x-0 top-8 bottom-8 pointer-events-none overflow-visible print-static">
                <div className="mx-auto flex w-fit flex-col gap-8 print:block print:w-full">
                    <div className="flex items-start gap-3 print:block">
                        <div className="w-7 shrink-0 print-hide" /> {/* Spacer for ruler */}
                        
                        <div 
                            ref={overlayRef}
                            className="pointer-events-auto print-no-padding"
                            style={{
                                width: pageWidth,
                                paddingTop: `${margins.top}px`,
                                paddingRight: `${margins.right}px`,
                                paddingBottom: `${margins.bottom}px`,
                                paddingLeft: `${margins.left}px`,
                                boxSizing: "border-box",
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
