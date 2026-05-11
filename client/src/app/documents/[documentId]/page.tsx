'use client'

import { use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorContainer } from "@/components/editor/DocumentEditorContainer"
import { RoomProvider, useRoom, useSelf } from "@/lib/liveblocks.config"
import { ClientSideSuspense } from "@liveblocks/react"
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { LiveblocksYjsProvider } from "@liveblocks/yjs"
import * as Y from 'yjs'
import { getDashboardDocument } from "@/services/document.service"
import { readStoredSession } from "@/services/auth.service"
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { FontSize } from '@/components/editor/extensions/FontSize'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

type Props = {
    params: Promise<{
        documentId: string
    }>
}

function DocumentPageContent({ documentId }: { documentId: string }) {
    const room = useRoom()
    const doc = useMemo(() => new Y.Doc(), [])
    const userInfo = useSelf((me) => me.info)
    const [title, setTitle] = useState("Tài liệu chưa có tiêu đề")

    // Logic đồng bộ hóa Yjs Provider từ branch develop/dashboard
    const yProvider = useMemo(() => {
        if (!room || !doc) return null
        return new LiveblocksYjsProvider(room, doc)
    }, [room, doc])

    useEffect(() => {
    if (!yProvider) return;
    if (yProvider.synced) {
        console.log("Đã đồng bộ từ trước (synced: true)");
    }
    const handleSync = (isSynced: boolean) => {
        console.log("Trạng thái đồng bộ thay đổi:", isSynced);
    };
    yProvider.on("sync", handleSync);
    return () => {
        yProvider.off("sync", handleSync);
    }
}, [yProvider])

    // Lấy tiêu đề thực tế của tài liệu
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

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                 history: false,
                 bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-inside',
                    },
                },
                 orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-inside',
                    },
                },
                 listItem: {},
                } as any),
            Collaboration.configure({ document: doc, field: 'content' }),
            room && userInfo && yProvider ? CollaborationCursor.configure({
                provider: yProvider as any,
                user: {
                    name: userInfo?.name || "Người dùng ẩn danh",
                    color: userInfo?.color || '#ff5733',
                },
            }) : null,
            TextStyle,
            FontFamily,
            FontSize,
            Color.configure({ types: [TextStyle.name] }),
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'bulletList', 'orderedList', 'listItem'],
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'list-none',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2',
                },
            }),
            Underline,
        ].filter(Boolean) as any,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
    }, [doc, room, userInfo, yProvider]);


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
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    const session = typeof window !== 'undefined' ? readStoredSession() : null
    const authChecked = !!session?.token

    // Auth Guard từ Dashboard branch
    useEffect(() => {
        if (isMounted && !authChecked) {
            const currentPath = window.location.pathname
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
    }, [isMounted, authChecked, router])

    if (!isMounted || !authChecked) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-slate-900 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <div className="text-sm font-medium text-muted-foreground">Đang bảo mật kết nối...</div>
                </div>
            </div>
        )
    }

    return (
        <RoomProvider 
            id={resolvedParams.documentId} 
            initialPresence={{ cursor: null, selection: null } as any}
        >
            <ClientSideSuspense fallback={
                <div className="flex h-screen items-center justify-center bg-background">
                    <div className="text-sm text-muted-foreground">Đang tải không gian làm việc...</div>
                </div>
            }>
                {() => <DocumentPageContent documentId={resolvedParams.documentId} />}
            </ClientSideSuspense>
        </RoomProvider>
    )
}
