"use client"

import React, { useEffect, useRef, useState } from "react"
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

function VerticalPageRuler({ margins, onMarginsChange, pageHeight }: VerticalPageRulerProps) {
    const rulerRef = useRef<HTMLDivElement | null>(null)
    const [draggingHandle, setDraggingHandle] = useState<"top" | "bottom" | null>(null)

    function getPageY(clientY: number) {
        const ruler = rulerRef.current
        if (!ruler) return 0

        const rect = ruler.getBoundingClientRect()
        const y = Math.min(rect.height, Math.max(0, clientY - rect.top))
        return (y / rect.height) * pageHeight
    }

    function updateVerticalMargin(handle: "top" | "bottom", clientY: number) {
        if (!onMarginsChange) return

        const pageY = getPageY(clientY)
        const nextMargin = handle === "top"
            ? clampMargin(pageY)
            : clampMargin(pageHeight - pageY)

        onMarginsChange({
            ...margins,
            [handle]: nextMargin,
        })
    }

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
    }, [draggingHandle, margins, onMarginsChange, pageHeight])

    return (
        <div
            ref={rulerRef}
            className="relative w-7 shrink-0 border-r bg-gray-50"
            style={{ height: pageHeight }}
            onClick={(event) => {
                if (!onMarginsChange) return
                const pageY = getPageY(event.clientY)
                updateVerticalMargin(pageY <= pageHeight / 2 ? "top" : "bottom", event.clientY)
            }}
        >
            <div
                className="absolute inset-x-0 top-0 bg-blue-100/70"
                style={{ height: margins.top }}
                title="Top margin"
            />
            <div
                className="absolute inset-x-0 bottom-0 bg-blue-100/70"
                style={{ height: margins.bottom }}
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
                style={{ top: margins.top }}
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
                className="absolute left-1 h-2 w-5 -translate-y-1/2 cursor-ns-resize rounded-sm bg-blue-500 shadow outline-none ring-blue-300 focus:ring-2"
                style={{ top: pageHeight - margins.bottom }}
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
    pageCount = 2,
    pageWidth = PAGE_WIDTH,
    pageHeight = PAGE_HEIGHT,
}: PaginatedEditorShellProps) {
    const pages = Array.from({ length: pageCount }, (_, index) => index)

    return (
        <div className="min-w-max px-8 py-8">
            <div className="mx-auto flex w-fit flex-col gap-8">
                {pages.map((pageIndex) => (
                    <div key={pageIndex} className="flex items-start gap-3">
                        <VerticalPageRuler
                            margins={margins}
                            onMarginsChange={onMarginsChange}
                            pageHeight={pageHeight}
                        />

                        <section
                            className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200"
                            style={{
                                width: pageWidth,
                                height: pageHeight,
                                boxSizing: "border-box",
                            }}
                            aria-label={`Page ${pageIndex + 1}`}
                        >
                            <div
                                className="relative h-full w-full overflow-hidden"
                                style={{
                                    paddingTop: `${margins.top}px`,
                                    paddingRight: `${margins.right}px`,
                                    paddingBottom: `${margins.bottom}px`,
                                    paddingLeft: `${margins.left}px`,
                                    boxSizing: "border-box",
                                }}
                            >
                                <div className="h-full w-full outline outline-1 outline-dashed outline-sky-200/70">
                                    {pageIndex === 0 ? (
                                        children
                                    ) : (
                                        <div className="text-sm text-gray-400">Page {pageIndex + 1}</div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                ))}
            </div>
        </div>
    )
}
