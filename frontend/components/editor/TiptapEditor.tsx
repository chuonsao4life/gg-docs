'use client'

import { Editor, EditorContent } from '@tiptap/react'


export default function TiptapEditor({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="h-full w-full">
      <EditorContent 
        editor={editor}
        className="focus:outline-none min-h-full prose prose-sm max-w-none"/>
    </div>
  )
}