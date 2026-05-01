'use client'

import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/lib/liveblocks.config";
import TiptapEditor from "@/components/editor/TiptapEditor";
import * as Y from 'yjs';
import { useMemo, use } from "react";

type Props = {
  params: Promise<{ docId: string }>
}

export default function EditorPage({ params }: Props) {
  const { docId } = use(params);
  const yDoc = useMemo(() => new Y.Doc(), []);

  return (
    <div className="max-w-5xl mx-auto p-8">npn
      <RoomProvider 
        id={docId} 
        initialPresence={{ 
          cursor: null, 
          userInfo: { name: "Linh Dev 2", color: "#3b82f6", picture: "" } 
        }}
      >
        <ClientSideSuspense fallback={<div>Đang kết nối...</div>}>
          {() => <TiptapEditor doc={yDoc} />}
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}