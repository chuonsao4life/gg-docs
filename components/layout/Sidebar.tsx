"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={`flex h-full flex-col border-r bg-muted ${collapsed ? "w-20" : "w-64"}`}>
            <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">Document outline</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCollapsed((s) => !s)}>
                    {collapsed ? "→" : "←"}
                </Button>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                <div className="text-sm text-muted-foreground">Headings you add to the document will appear here.</div>
            </div>

            <div className="mt-auto border-t px-4 py-3">
                <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60">My Documents</button>
                <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60">Shared with me</button>
                <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60">Settings</button>
            </div>
        </aside>
    )
}
