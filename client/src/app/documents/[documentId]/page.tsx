'use client'

import { use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorContainer } from "@/components/editor/DocumentEditorContainer"
import { RoomProvider, useRoom } from "@/lib/liveblocks.config"
import { ClientSideSuspense } from "@liveblocks/react"
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { LiveblocksYjsProvider } from "@liveblocks/yjs"
import * as Y from 'yjs'
import { getDashboardDocument } from "@/services/document.service"
import { readStoredSession } from "@/services/auth.service"

type Props = {
    params: Promise<{
        documentId: string
    }>
}

function DocumentPageContent({ documentId }: { documentId: string }) {
    const room = useRoom()
    const doc = useMemo(() => new Y.Doc(), [])
    const [title, setTitle] = useState("Tài liệu chưa có tiêu đề")

    useEffect(() => {
        let active = true
        getDashboardDocument(documentId)
            .then((document) => {
                if (active) setTitle(document.title)
            })
            .catch((error) => {
                console.warn("Không thể tải thông tin tài liệu:", error)
            })

        return () => {
            active = false
        }
    }, [documentId])
    useEffect(() => {
        if (!room || !doc) return;
        const yProvider = new LiveblocksYjsProvider(room, doc)
        yProvider.on("sync", (isSynced: boolean) => {
            console.log("Trạng thái đồng bộ:", isSynced);
        });
        return () => {
            yProvider.destroy();
        }
    }, [room, doc])

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false } as any),
            Collaboration.configure({ document: doc }),
        ],
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
    }, [doc]);

    return (
        <AppLayout 
            documentId={documentId} 
            title={title}
            editor={editor} 
        >
            <DocumentEditorContainer 
                documentId={documentId} 
                editor={editor} 
                doc={doc}
            />
        </AppLayout>
    )
}

export default function Page({ params }: Props) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const session = readStoredSession()
        if (!session?.token) {
            const currentPath = window.location.pathname
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
            return
        }
        setAuthChecked(true)
    }, [router])

    if (!isMounted || !authChecked) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-sm text-muted-foreground">Đang kiểm tra đăng nhập...</div>
            </div>
        )
    }

    return (
        <RoomProvider 
            id={resolvedParams.documentId} 
            initialPresence={{ cursor: null, selection: null } as any}
        >
            <ClientSideSuspense fallback={<div className="flex h-screen items-center justify-center bg-background"><div className="text-sm text-muted-foreground">Đang tải tài liệu...</div></div>}>
                {() => <DocumentPageContent documentId={resolvedParams.documentId} />}
            </ClientSideSuspense>
        </RoomProvider>
    )
}
