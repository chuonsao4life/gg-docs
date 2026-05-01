'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { LiveblocksYjsProvider } from "@liveblocks/yjs"
import { useRoom } from "@/lib/liveblocks.config"
import { useEffect, useState } from 'react'
import { Toolbar } from './Toolbar'

export default function TiptapEditor({ doc }: { doc: Y.Doc }) {
  const room = useRoom();
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // /Giúp đồng bộ giữa 2 trình duyệt
    const yProvider = new LiveblocksYjsProvider(room, doc);
    
    yProvider.on("sync", (isSynced: boolean) => {
      if (isSynced) setStatus("Synced");
    });

    return () => yProvider.destroy();
  }, [room, doc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        bold: {},
        italic: {},
        history: false,
      } as any),
      Collaboration.configure({ document: doc }),
    ],
    editorProps: {
      attributes: {
        // Class 'prose' cực kỳ quan trọng để hiển thị 1. 2. 3. và Bullet points
        class: 'focus:outline-none min-h-[400px] p-4 prose prose-sm max-w-none',
      },
    },
    onUpdate: ({ editor }) => {},
    onSelectionUpdate: ({ editor }) => {},

    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="w-full border rounded-lg bg-white overflow-hidden">
      <div className="bg-gray-50 px-4 py-1 text-[10px] text-gray-400 border-b">
        Status: {status}
      </div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}