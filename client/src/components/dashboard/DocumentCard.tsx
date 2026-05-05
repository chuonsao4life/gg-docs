import { FileText, MoreVertical, Users } from "lucide-react"
import { DashboardDocument } from "@/services/document.service"
import { formatDocumentDate } from "./dashboardUtils"

export function DocumentCard({ document, onOpen }: { document: DashboardDocument; onOpen: () => void }) {
  return (
    <article className="group overflow-hidden rounded-md border border-slate-200 bg-white transition hover:border-primary hover:shadow-md">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <DocumentPreview title={document.title} />
      </button>
      <div className="border-t border-slate-200 px-4 py-3">
        <div className="mb-2 flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="line-clamp-1 text-left text-base font-semibold text-slate-700 hover:text-primary">
            {document.title}
          </button>
          <button type="button" className="rounded-full p-1 text-slate-500 opacity-100 transition hover:bg-slate-100 sm:opacity-0 sm:group-hover:opacity-100" title="Tùy chọn">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <Users className="h-4 w-4 shrink-0" />
          <span className="truncate">{formatDocumentDate(document.openedAt || document.updatedAt)}</span>
          {document.collaboratorCount > 0 && <span className="ml-auto shrink-0 text-xs">{document.collaboratorCount + 1} người</span>}
        </div>
      </div>
    </article>
  )
}

function DocumentPreview({ title }: { title: string }) {
  const heading = title.length > 28 ? `${title.slice(0, 28)}...` : title

  return (
    <div className="h-[292px] bg-slate-50 p-4">
      <div className="mx-auto h-full max-w-[210px] rounded-sm border border-slate-200 bg-white px-7 py-6 shadow-sm">
        <div className="mb-4 h-2 w-16 rounded bg-primary" />
        <div className="mb-6 text-center text-[10px] font-semibold uppercase leading-4 text-slate-700">{heading}</div>
        <div className="space-y-2">
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded ${index % 5 === 0 ? "w-3/4 bg-slate-300" : index % 2 === 0 ? "w-full bg-slate-200" : "w-5/6 bg-slate-200"}`}
            />
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-1.5 w-2/3 rounded bg-primary/15" />
          <div className="h-1.5 w-4/5 rounded bg-slate-200" />
          <div className="h-1.5 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
