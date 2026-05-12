"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, RefreshCw } from "lucide-react"
import { ChatPanel } from "@/components/chat-panel"
import {
  createDashboardDocument,
  listDashboardDocuments,
  listDashboardTemplates,
  type DashboardDocument,
  type DashboardTemplate,
} from "@/services/document.service"

import {
  FALLBACK_TEMPLATES,
  FALLBACK_DOCUMENTS,
  ESSENTIAL_TEMPLATE_IDS,
  getInitials,
  OwnerFilter,
  SortMode,
  ViewMode
} from "./dashboardUtils"
import { DashboardTopBar } from "./DashboardTopBar"
import { TemplateCard } from "./TemplateCard"
import { DocumentCard } from "./DocumentCard"
import { DocumentListRow, DocumentSkeleton, EmptyState } from "./DocumentDashboardUI"

export function DocumentDashboard() {
  const router = useRouter()
  const [templates, setTemplates] = useState<DashboardTemplate[]>(FALLBACK_TEMPLATES)
  const [documents, setDocuments] = useState<DashboardDocument[]>(FALLBACK_DOCUMENTS)
  const [search, setSearch] = useState("")
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("updatedAt")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [loading, setLoading] = useState(true)
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const [userInitials, setUserInitials] = useState("T")
  const localDraftCounter = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setUserInitials(getInitials()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isActive = true
    async function loadTemplates() {
      try {
        const nextTemplates = await listDashboardTemplates()
        if (isActive && nextTemplates.length > 0) setTemplates(nextTemplates)
      } catch {
        if (isActive) setTemplates(FALLBACK_TEMPLATES)
      }
    }
    loadTemplates()
    return () => { isActive = false }
  }, [])

  useEffect(() => {
    let isActive = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setNotice("")
      try {
        const nextDocuments = await listDashboardDocuments({
          search,
          owner: ownerFilter,
          sort: sortMode,
          order: sortMode === "title" ? "asc" : "desc",
        })
        if (isActive) setDocuments(nextDocuments.length > 0 ? nextDocuments : [])
      } catch (error) {
        if (isActive) {
          setDocuments(FALLBACK_DOCUMENTS)
          setNotice(error instanceof Error ? error.message : "Không thể tải tài liệu, đang hiển thị dữ liệu mẫu.")
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }, 220)
    return () => {
      isActive = false
      window.clearTimeout(timer)
    }
  }, [ownerFilter, search, sortMode])

  const filteredFallbackDocuments = useMemo(() => {
    if (!notice || !search.trim()) return documents
    const needle = search.trim().toLowerCase()
    return documents.filter((document) => document.title.toLowerCase().includes(needle))
  }, [documents, notice, search])

  const visibleDocuments = notice ? filteredFallbackDocuments : documents
  const visibleTemplates = useMemo(() => {
    const essentialTemplates = templates.filter((template) => ESSENTIAL_TEMPLATE_IDS.has(template.id))
    return (essentialTemplates.length > 0 ? essentialTemplates : templates).slice(0, 4)
  }, [templates])

  async function handleCreateDocument(templateId: string) {
    setCreatingTemplateId(templateId)
    setNotice("")
    try {
      const document = await createDashboardDocument({ templateId })
      router.push(`/documents/${document.id}`)
    } catch (error) {
      localDraftCounter.current += 1
      const localId = `draft-local-${localDraftCounter.current}`
      setNotice(error instanceof Error ? error.message : "Không thể tạo tài liệu qua API, mở bản nháp cục bộ.")
      router.push(`/documents/${localId}`)
    } finally {
      setCreatingTemplateId(null)
    }
  }

  const handleOpenDocument = (docId: string) => {
    router.push(`/documents/${docId}`)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <DashboardTopBar
        search={search}
        onSearchChange={setSearch}
        userInitials={userInitials}
        creating={creatingTemplateId === "blank"}
        onCreateBlank={() => handleCreateDocument("blank")}
      />

      <main>
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-[1540px] px-5 py-7 sm:px-8 lg:px-12">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-slate-800 sm:text-xl">Bắt đầu một tài liệu mới</h2>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  creating={creatingTemplateId === template.id}
                  onCreate={() => handleCreateDocument(template.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1540px] px-5 py-7 sm:px-8 lg:px-12">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Tài liệu gần đây</h2>
              <p className="mt-1 text-sm text-slate-500">Mở nhanh tài liệu của bạn và tài liệu được chia sẻ.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <label className="sr-only" htmlFor="owner-filter">Lọc chủ sở hữu</label>
              <select
                id="owner-filter"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value as OwnerFilter)}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Tất cả tài liệu</option>
                <option value="me">Của tôi</option>
                <option value="shared">Được chia sẻ</option>
              </select>

              <label className="sr-only" htmlFor="sort-mode">Sắp xếp</label>
              <select
                id="sort-mode"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="updatedAt">Mới nhất</option>
                <option value="title">Tên A-Z</option>
              </select>

              <div className="flex h-9 items-center rounded-md border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex h-7 w-8 items-center justify-center rounded transition ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex h-7 w-8 items-center justify-center rounded transition ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                  title="Xem dạng danh sách"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {notice && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <RefreshCw className="h-4 w-4" />
              {notice}
            </div>
          )}

          {loading ? (
            <DocumentSkeleton viewMode={viewMode} />
          ) : visibleDocuments.length === 0 ? (
            <EmptyState onCreate={() => handleCreateDocument("blank")} />
          ) : viewMode === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {visibleDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onOpen={() => handleOpenDocument(document.id)} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {visibleDocuments.map((document) => (
                <DocumentListRow key={document.id} document={document} onOpen={() => handleOpenDocument(document.id)} />
              ))}
            </div>
          )}
        </section>
      </main>
      <ChatPanel />
    </div>
  )
}
