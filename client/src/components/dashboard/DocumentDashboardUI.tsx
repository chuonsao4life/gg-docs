import { FileText, MoreVertical, Plus, Users } from "lucide-react"
import { DashboardDocument } from "@/services/document.service"
import { formatDocumentDate, ViewMode } from "./dashboardUtils"

export function DocumentListRow({ document, onOpen }: { document: DashboardDocument; onOpen: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 bg-white px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_180px_120px_auto]">
      <button type="button" onClick={onOpen} className="flex min-w-0 items-center gap-3 text-left">
        <FileText className="h-6 w-6 shrink-0 text-primary" />
        <span className="truncate font-medium text-slate-700">{document.title}</span>
      </button>
      <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
        <Users className="h-4 w-4" />
        {document.collaboratorCount + 1} người
      </div>
      <div className="hidden text-sm text-slate-500 sm:block">{formatDocumentDate(document.openedAt || document.updatedAt)}</div>
      <button type="button" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100" title="Tùy chọn">
        <MoreVertical className="h-5 w-5" />
      </button>
    </div>
  )
}

export function DocumentSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0">
            <div className="h-6 w-6 animate-pulse rounded bg-slate-200" />
            <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
            <div className="hidden h-4 w-28 animate-pulse rounded bg-slate-200 sm:block" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-md border border-slate-200">
          <div className="h-[292px] animate-pulse bg-slate-100" />
          <div className="space-y-3 border-t border-slate-200 p-4">
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Plus className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Chưa có tài liệu phù hợp</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">Tạo tài liệu mới hoặc đổi bộ lọc để xem thêm tài liệu được chia sẻ.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Tạo tài liệu trống
      </button>
    </div>
  )
}
