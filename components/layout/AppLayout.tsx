"use client"

import React, { ReactNode } from "react"
import { Navbar } from "@/components/layout/Navbar"
import EditorToolbar from "@/components/editor/EditorToolbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { CommentPanel } from "@/components/comments/CommentPanel"

export function AppLayout({
  children,
  documentId,
  title,
}: {
  children: ReactNode
  documentId: string
  title?: string
}) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar title={title} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <EditorToolbar />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-auto bg-slate-50 p-6" style={{ height: 'calc(100vh - 56px - 72px)' }}>
          <div className="mx-auto w-full max-w-[900px] rounded-md">
            <div className="mx-auto max-w-[820px]">
              <div className="mx-auto w-full max-w-[820px]">
                <div className="mx-auto w-full max-w-[820px]">
                  <div className="mx-auto w-full max-w-[820px] bg-transparent">
                    <div className="mx-auto w-full max-w-[820px]">
                      <div className="mx-auto w-full max-w-[820px]">
                        <div className="mx-auto w-full max-w-[820px] rounded-md bg-white p-8 shadow-sm">
                          {children}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

          <div className="hidden w-80 border-l bg-muted md:block">
          <CommentPanel documentId={documentId} />
          </div>
        </div>
      </div>
    </div>
  )
}
