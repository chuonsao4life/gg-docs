'use client'

import { use, useEffect, useMemo } from "react" 
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

type Props = {
    params: Promise<{
        documentId: string
    }>
}

function DocumentPageContent({ documentId }: { documentId: string }) {
    const room = useRoom()
    const doc = useMemo(() => new Y.Doc(), [])

    const yProvider = useMemo(() => {
        if (!room || !doc) return null;
        return new LiveblocksYjsProvider(room, doc);
    }, [room, doc]);

    const userInfo = useSelf((me) => me.info) as any;

    useEffect(() => {
        if (!yProvider) return;

        yProvider.on("sync", (isSynced: boolean) => {
            console.log("Trạng thái đồng bộ:", isSynced);
        });

        return () => {
            yProvider.destroy();
        }
    }, [yProvider])

    //console.log("Check:", { room: !!room, user: !!userInfo, provider: !!yProvider })

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false } as any),
            Collaboration.configure({ document: doc }),
            room && userInfo && yProvider ? CollaborationCursor.configure({
                    provider: yProvider as any,
                    user: {
                        name: userInfo?.name,
                        color: userInfo?.color || '#ff5733',
                    },
                }) : null,

            TextStyle,
            Placeholder.configure({
                placeholder: "Start writing your document...",
            }), 
            Underline,
        ],
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
    }, [doc, room, userInfo, yProvider]);

    return (
        <AppLayout 
            documentId={documentId} 
            title={"Untitled document - CoWork"}
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

    return (
        <RoomProvider 
            id={resolvedParams.documentId} 
            initialPresence={{ cursor: null, selection: null } as any}
        >
            <ClientSideSuspense fallback={<div>Loading room...</div>}>
                {() => <DocumentPageContent documentId={resolvedParams.documentId} />}
            </ClientSideSuspense>
        </RoomProvider>
    )
}