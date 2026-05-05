"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PageMargins } from "@/types/page-layout"

const PAGE_WIDTH = 794
const TICK_COUNT = 24
const MIN_MARGIN = 16
const MAX_MARGIN = 160

type PageRulerProps = {
    margins: PageMargins
    onMarginsChange: (margins: PageMargins) => void
    pageWidth?: number
    pageHeight?: number
}

function clampMargin(value: number) {
    if (!Number.isFinite(value)) return MIN_MARGIN
    return Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, value))
}

export function PageRuler({
    margins,
    onMarginsChange,
    pageWidth = PAGE_WIDTH,
}: PageRulerProps) {
    const rulerRef = useRef<HTMLDivElement | null>(null)
    const [draggingHandle, setDraggingHandle] = useState<"left" | "right" | null>(null)
    const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => index)
    const leftPercent = Math.min(100, Math.max(0, (margins.left / pageWidth) * 100))
    const rightPercent = Math.min(100, Math.max(0, ((pageWidth - margins.right) / pageWidth) * 100))

    const getPageX = useCallback((clientX: number) => {
        const ruler = rulerRef.current
        if (!ruler) return 0

        const rect = ruler.getBoundingClientRect()
        const x = Math.min(rect.width, Math.max(0, clientX - rect.left))
        return (x / rect.width) * pageWidth
    }, [pageWidth])

    const updateHorizontalMargin = useCallback((handle: "left" | "right", clientX: number) => {
        const pageX = getPageX(clientX)
        const nextMargin = handle === "left"
            ? clampMargin(pageX)
            : clampMargin(pageWidth - pageX)

        onMarginsChange({
            ...margins,
            [handle]: nextMargin,
        })
    }, [getPageX, margins, onMarginsChange, pageWidth])

    useEffect(() => {
        if (!draggingHandle) return
        const activeHandle = draggingHandle

        function handlePointerMove(event: PointerEvent) {
            updateHorizontalMargin(activeHandle, event.clientX)
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
    }, [draggingHandle, updateHorizontalMargin])

    return (
        <div className="border-b bg-white px-4 py-2">
            <div className="mx-auto flex w-full items-center" style={{ maxWidth: pageWidth }}>
                <div
                    ref={rulerRef}
                    className="relative h-7 w-full rounded-sm border bg-gray-50"
                    onClick={(event) => {
                        if (!onMarginsChange) return
                        const pageX = getPageX(event.clientX)
                        updateHorizontalMargin(pageX <= pageWidth / 2 ? "left" : "right", event.clientX)
                    }}
                >
                    <div
                        className="absolute inset-y-0 left-0 bg-blue-100/70"
                        style={{ width: `${leftPercent}%` }}
                        title="Left margin"
                    />
                    <div
                        className="absolute inset-y-0 right-0 bg-blue-100/70"
                        style={{ left: `${rightPercent}%` }}
                        title="Right margin"
                    />
                    {ticks.map((tick) => (
                        <span
                            key={tick}
                            className="absolute bottom-0 w-px bg-gray-400"
                            style={{
                                left: `${(tick / TICK_COUNT) * 100}%`,
                                height: tick % 4 === 0 ? 18 : tick % 2 === 0 ? 12 : 7,
                            }}
                        />
                    ))}
                    <button
                        type="button"
                        aria-label="Left margin"
                        className="absolute top-1 h-5 w-2 -translate-x-1/2 cursor-ew-resize rounded-sm bg-blue-500 shadow outline-none ring-blue-300 focus:ring-2"
                        style={{ left: `${leftPercent}%` }}
                        title="Left margin"
                        onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setDraggingHandle("left")
                            updateHorizontalMargin("left", event.clientX)
                        }}
                        onClick={(event) => event.stopPropagation()}
                    />
                    <button
                        type="button"
                        aria-label="Right margin"
                        className="absolute top-1 h-5 w-2 -translate-x-1/2 cursor-ew-resize rounded-sm bg-blue-500 shadow outline-none ring-blue-300 focus:ring-2"
                        style={{ left: `${rightPercent}%` }}
                        title="Right margin"
                        onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setDraggingHandle("right")
                            updateHorizontalMargin("right", event.clientX)
                        }}
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    )
}
