'use client'

import { use, useEffect, useMemo } from "react" // Thêm useEffect
import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorContainer } from "@/components/editor/DocumentEditorContainer"
import { RoomProvider, useRoom } from "@/lib/liveblocks.config" // Thêm useRoom
import { ClientSideSuspense } from "@liveblocks/react"
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { LiveblocksYjsProvider } from "@liveblocks/yjs" // Thêm Provider này
import * as Y from 'yjs'

type Props = {
    params: Promise<{
        documentId: string
    }>
}

function DocumentPageContent({ documentId }: { documentId: string }) {
    const room = useRoom()
    const doc = useMemo(() => new Y.Doc(), [])
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