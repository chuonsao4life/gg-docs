"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, FileText, LogOut, MessageSquareText, Settings } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShareDialog } from "@/components/editor/ShareDialog"
import { getStoredUser, logoutUser, onSessionChange } from "@/services/auth.service"

type StoredUser = {
    firstname?: string
    lastname?: string
    username?: string
    email?: string
    avatar?: string
}

function getDisplayName(user: StoredUser | null) {
    if (!user) return "Người dùng"

    const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ").trim()
    return fullName || user.username || user.email || "Người dùng"
}

function getInitials(displayName: string) {
    return displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U"
}

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
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(title)
    const [user, setUser] = useState<StoredUser | null>(() => getStoredUser())
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        const syncUser = () => setUser(getStoredUser())
        window.addEventListener("storage", syncUser)
        const unsubscribe = onSessionChange(syncUser)

        return () => {
            window.removeEventListener("storage", syncUser)
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        const syncNetworkStatus = () => setIsOnline(navigator.onLine)
        syncNetworkStatus()
        window.addEventListener("online", syncNetworkStatus)
        window.addEventListener("offline", syncNetworkStatus)

        return () => {
            window.removeEventListener("online", syncNetworkStatus)
            window.removeEventListener("offline", syncNetworkStatus)
        }
    }, [])

    const displayName = useMemo(() => getDisplayName(user), [user])
    const initials = useMemo(() => getInitials(displayName), [displayName])

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
                            onChange={(event) => setName(event.target.value)}
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
                                onClick={() => setEditing(true)}
                            >
                                {name}
                            </h1>
                            <span className="hidden text-xs text-slate-500 sm:inline">
                                {saving ? "Đang lưu..." : "Đã lưu"}
                            </span>
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
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <Avatar className="h-8 w-8 border border-slate-200" title={displayName}>
                                {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex w-full cursor-pointer items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                Cài đặt
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={handleLogout}
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
