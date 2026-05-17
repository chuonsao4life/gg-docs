"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, FileText, LogOut, MessageSquareText } from "lucide-react"
import { ShareDialog } from "@/components/editor/ShareDialog"
import { logoutUser } from "@/services/auth.service"

export function Navbar({
    documentId,
    title = "Untitled document",
    onExportPdf,
    onRename,
    onToggleComments,
}: {
    documentId: string
    title?: string
    onExportPdf?: () => void
    onRename?: (title: string) => Promise<void> | void
    onToggleComments?: () => void
}) {
    const router = useRouter()
    const [saving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(title)

    async function commitName() {
        const nextName = name.trim() || title
        setName(nextName)
        setEditing(false)
        if (nextName !== title) {
            await onRename?.(nextName)
        }
    }

    async function handleLogout() {
        await logoutUser()
        router.replace("/login")
    }

    return (
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-4">
            <div className="flex min-w-0 items-center gap-3">
                <Link
                    href="/dashboard"
                    title="Về dashboard"
                    className="flex h-10 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                    <FileText className="h-6 w-6" />
                </Link>

                <div className="flex min-w-0 flex-col">
                    {editing ? (
                        <input
                            className="w-64 max-w-[55vw] rounded-md border px-2 py-1 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={commitName}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault()
                                    event.currentTarget.blur()
                                }
                            }}
                        />
                    ) : (
                        <div className="flex min-w-0 items-baseline gap-2">
                            <h1
                                className="max-w-[48vw] cursor-text truncate text-lg font-medium text-slate-800"
                                onClick={() => {
                                    setEditing(true)
                                }}
                            >
                                {name}
                            </h1>
                            <span className="hidden text-xs text-slate-500 sm:inline">{saving ? "Đang lưu..." : "Đã lưu"}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={onExportPdf}
                    className="hidden h-9 items-center gap-2 rounded-md px-3 text-sm text-slate-700 transition hover:bg-slate-100 md:flex"
                >
                    <Download className="h-4 w-4" />
                    Xuất PDF
                </button>
                <button
                    type="button"
                    onClick={onToggleComments}
                    className="hidden h-9 items-center gap-2 rounded-md px-3 text-sm text-slate-700 transition hover:bg-slate-100 md:flex"
                >
                    <MessageSquareText className="h-4 w-4" />
                    Bình luận
                </button>
                <ShareDialog documentId={documentId} />
                <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden h-9 items-center gap-2 rounded-md px-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-red-600 md:flex"
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </button>
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">M4</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
