import { DashboardTemplate } from "@/services/document.service"
import { ACCENT_CLASSES } from "./dashboardUtils"

export function TemplateCard({
  template,
  creating,
  onCreate,
}: {
  template: DashboardTemplate
  creating: boolean
  onCreate: () => void
}) {
  const accent = ACCENT_CLASSES[template.accent] || ACCENT_CLASSES.primary

  return (
    <button type="button" onClick={onCreate} className="group w-[172px] shrink-0 text-left sm:w-[190px]">
      <div className={`h-[244px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm transition ${accent.ring} group-hover:shadow-md`}>
        <TemplatePreview template={template} accent={accent} creating={creating} />
      </div>
      <div className="mt-3">
        <div className="truncate text-base font-semibold text-slate-800">{template.title}</div>
        <div className="truncate text-sm text-slate-500">{template.subtitle}</div>
      </div>
    </button>
  )
}

function TemplatePreview({
  template,
  accent,
  creating,
}: {
  template: DashboardTemplate
  accent: { bar: string; soft: string; text: string }
  creating: boolean
}) {
  if (template.preview === "blank") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-16 w-16">
          <span className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 rounded bg-primary" />
          <span className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded bg-amber-400" />
          <span className="absolute left-1/2 top-1/2 h-3 w-full -translate-y-1/2 rounded bg-sky-500" />
          {creating && <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className={`mb-5 h-1 w-20 rounded-full ${accent.bar}`} />
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-slate-800/80" />
        <div className="h-2 w-28 rounded bg-slate-200" />
        <div className="h-2 w-20 rounded bg-slate-200" />
      </div>
      <div className={`my-5 h-20 rounded ${accent.soft}`}>
        <div className="flex h-full items-end gap-2 p-3">
          <div className={`h-10 w-7 rounded-t ${accent.bar}`} />
          <div className="h-14 w-7 rounded-t bg-slate-300" />
          <div className={`h-16 w-7 rounded-t ${accent.bar}`} />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={`h-1.5 rounded ${index % 3 === 0 ? "w-full bg-slate-300" : "w-4/5 bg-slate-200"}`} />
        ))}
      </div>
      <div className={`mt-auto text-xs font-medium ${accent.text}`}>{template.title}</div>
    </div>
  )
}
