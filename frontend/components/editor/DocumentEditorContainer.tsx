'use client'

import React from "react"
import { Editor } from "@tiptap/react"
import * as Y from 'yjs'
import TiptapEditor from "./TiptapEditor"

interface DocumentEditorContainerProps {
    documentId: string;
    editor: Editor | null;
    doc: Y.Doc;
}

export function DocumentEditorContainer({ 
    editor 
}: DocumentEditorContainerProps) {

    return (
        <>
            <TiptapEditor editor={editor} />
        </>
    )
}