"use client"

import React from "react"

type ToolbarIconButtonProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
}

export function ToolbarIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  active = false,
}: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      data-active={active}
      className={[
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        "text-gray-700 transition hover:bg-gray-100",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-gray-200" : "",
      ].join(" ")}
    >
      {icon}
    </button>
  )
}

export default ToolbarIconButton
