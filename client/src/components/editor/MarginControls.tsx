"use client"

import type { PageMargins } from "@/types/page-layout"

type MarginControlsProps = {
    margins: PageMargins
    onChange: (margins: PageMargins) => void
}

const FIELDS: Array<{ key: keyof PageMargins; label: string }> = [
    { key: "top", label: "Top" },
    { key: "right", label: "Right" },
    { key: "bottom", label: "Bottom" },
    { key: "left", label: "Left" },
]

export function MarginControls({ margins, onChange }: MarginControlsProps) {
    function clampMargin(value: number) {
        if (!Number.isFinite(value)) return 72
        return Math.min(160, Math.max(16, value))
    }

    return (
        <div className="border-b bg-white px-4 py-2">
            <div className="mx-auto flex max-w-\[794px\] flex-wrap items-center gap-2">
                {FIELDS.map((field) => (
                    <label key={field.key} className="flex items-center gap-1 text-xs text-gray-600">
                        <span>{field.label}</span>
                        <input
                            type="number"
                            min={16}
                            max={160}
                            step={4}
                            value={margins[field.key]}
                            onChange={(event) => {
                                const value = clampMargin(Number(event.target.value))
                                onChange({
                                    ...margins,
                                    [field.key]: value,
                                })
                            }}
                            className="h-7 w-16 rounded border px-2 text-xs"
                            aria-label={`${field.label} margin`}
                        />
                        <span className="text-[11px] text-gray-400">px</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
