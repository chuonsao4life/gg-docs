"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navbar({ title = "Untitled document", onToggleComments }: { title?: string; onToggleComments?: () => void }) {
    const [saving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(title)

    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">Back</Button>

                <div className="flex flex-col">
                    {editing ? (
                        <input
                            className="w-64 rounded-md border px-2 py-1 text-sm font-semibold"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setEditing(false)}
                        />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <h1 className="cursor-text text-lg font-semibold" onClick={() => setEditing(true)}>{name}</h1>
                            <span className="text-xs text-muted-foreground">{saving ? "Saving..." : "Saved"}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm text-white hover:brightness-95">Share</button>
                <button
                    type="button"
                    onClick={onToggleComments}
                    className="hidden items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm md:flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10l5 5 5-5" /></svg>
                    Comments
                </button>
                <Avatar className="h-8 w-8">
                    <AvatarFallback>M4</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
