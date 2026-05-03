"use client"

import React from "react"

export default function ToolbarSelect({
    value,
    onChange,
    options,
    ariaLabel,
}: {
    value?: string
    onChange?: (v: string) => void
    options: string[]
    ariaLabel?: string
}) {
    return (
        <select
            aria-label={ariaLabel}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
        >
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    )
}
