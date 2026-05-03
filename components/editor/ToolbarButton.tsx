"use client"

import React from "react"

export default function ToolbarButton({
    label,
    icon,
    onClick,
    disabled,
    active,
    title,
}: {
    label?: string
    icon?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    active?: boolean
    title?: string
}) {
    return (
        <button
            type="button"
            title={title || label}
            aria-label={label}
      onClick={() => onClick && onClick()}
      disabled={disabled}
      data-active={active ? "true" : "false"}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm hover:bg-gray-100 ${active ? "bg-gray-200" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {icon}
    </button>
  )
}
