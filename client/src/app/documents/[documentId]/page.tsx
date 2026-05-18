'use client'

import { use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorContainer } from "@/components/editor/DocumentEditorContainer"
import { RoomProvider, useRoom, useUpdateMyPresence } from "@/lib/liveblocks.config"
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
import { getStoredAccessToken, getStoredUser } from "@/services/auth.service"
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { FontSize } from '@/components/editor/extensions/FontSize'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { CommentMark } from '@/components/editor/extensions/CommentMark'
import { Indent } from "lucide-react"

type Props = {
    params: Promise<{
        documentId: string
    }>
}

const TAB_SESSION_ID = Math.random().toString(36).substring(7);

const CURSOR_COLORS = ['#958DF1', '#F98181', '#FBCE41', '#FFC0CB', '#85C1E9', '#7DCEA0', '#b19cd9', '#f39c12'];
const getStableColor = (identifier: string) => {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CURSOR_COLORS.length;
    return CURSOR_COLORS[index];
};

function DocumentPageContent({ documentId }: { documentId: string }) {
    const room = useRoom()
    const updateMyPresence = useUpdateMyPresence()
    const doc = useMemo(() => new Y.Doc(), [])
    const [userInfo, setUserInfo] = useState(getStoredUser())
    const [title, setTitle] = useState("Tài liệu chưa có tiêu đề")

    // Tạo displayName từ available fields
    const displayName = userInfo?.firstname && userInfo?.lastname 
        ? `${userInfo.firstname} ${userInfo.lastname}`
        : userInfo?.username || "Người dùng ẩn danh"

    // Debug userInfo
    console.log("✅ userInfo lúc render:", userInfo)
    console.log("✨ displayName:", displayName)
    console.log("🔧 DocumentPageContent mounted, documentId:", documentId)

    // Update presence với userInfo (broadcast qua Liveblocks)
    useEffect(() => {
        console.log(" Update Presence Effect - displayName:", displayName, "updateMyPresence:", !!updateMyPresence)
        if (displayName && updateMyPresence) {
            updateMyPresence({ 
                userInfo: {
                    name: displayName,
                    color: userInfo?.color || getStableColor(displayName + TAB_SESSION_ID),
                }
            })
            console.log("Broadcast displayName qua Liveblocks:", displayName)
        }
    }, [displayName, userInfo, updateMyPresence])

    // Listen storage event để sync userInfo giữa các tabs (cùng trình duyệt)
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = getStoredUser()
            setUserInfo(storedUser)
            console.log("Sync userInfo từ tab khác:", storedUser)
        }
        
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])


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
                        class: 'list-disc list-inside ml-0',
                    },
                },
                 orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-inside ml-0',
                    },
                },
                listItem: {},
                } as any),
                Collaboration.configure({ 
                    document: doc, 
                    field: 'content' 
                }),
                CollaborationCursor.configure({
                    provider: yProvider,
                    user: {
                        name: displayName,
                        color: userInfo?.color || getStableColor(displayName + TAB_SESSION_ID),
                    },
                }),
                Indent,
                TextStyle,
                FontFamily,
                FontSize.configure({ types: ['textStyle'], }),
                Document,
                Paragraph.extend({
                addAttributes() {
                    return {
                    ...this.parent?.(),
                    fontSize: {
                        default: '11px',
                        parseHTML: element => element.style.fontSize,
                        renderHTML: attributes => {
                        if (!attributes.fontSize) return {}
                        return { style: `font-size: ${attributes.fontSize}` }
                        },
                    },
                    }
                },
                }),
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
                CommentMark,
                Underline,
            ].filter(Boolean) as any,
            immediatelyRender: false,
            shouldRerenderOnTransaction: true,
        }, [doc, room, yProvider]);
    
    console.log("📝 Editor state:", { editor: !!editor, userInfo });
    
    useEffect(() => {
        // Chỉ update user info khi displayName thay đổi, không recreate editor
        if (editor && displayName) {
            console.log("🎨 Update cursor info (không recreate editor):", displayName);
            
            if (editor.commands.updateUser) {
                editor.commands.updateUser({
                    name: displayName,
                    color: userInfo?.color || getStableColor(displayName + TAB_SESSION_ID),
                });
                console.log("✅ updateUser thành công");
            } else {
                console.warn("⚠️ updateUser command not found");
            }
        }
    }, [displayName, userInfo]);

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

    const authChecked = Boolean(getStoredAccessToken())

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
