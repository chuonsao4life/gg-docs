import { DashboardDocument, DashboardTemplate } from "@/services/document.service"

export const FALLBACK_TEMPLATES: DashboardTemplate[] = [
  { id: "blank", title: "Tài liệu trống", subtitle: "Bắt đầu từ trang trắng", accent: "primary", preview: "blank" },
  { id: "meeting-notes", title: "Ghi chú cuộc họp", subtitle: "Agenda, quyết định, việc cần làm", accent: "sky", preview: "notes" },
  { id: "project-proposal", title: "Đề xuất dự án", subtitle: "Mục tiêu, phạm vi, ngân sách", accent: "amber", preview: "proposal" },
  { id: "report", title: "Báo cáo", subtitle: "Tổng hợp kết quả và số liệu", accent: "violet", preview: "report" },
]

export function makeFallbackDocument(id: string, title: string, openedAt: string, initials: string, collaboratorCount: number): DashboardDocument {
  return {
    id,
    title,
    type: "document",
    role: "editor",
    owner: {
      id: `${id}-owner`,
      username: initials,
      displayName: initials,
      initials,
    },
    collaborators: [],
    collaboratorCount,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    openedAt,
    preview: "document",
  }
}

export const FALLBACK_DOCUMENTS: DashboardDocument[] = [
  makeFallbackDocument("demo-collab-docs", "Collab docs", "Đã mở 16:28", "TA", 3),
  makeFallbackDocument("demo-weekly-report", "GSX Report", "Đã mở 09:29", "NT", 2),
  makeFallbackDocument("demo-it4409", "20252 IT4788 Chiều T4", "4 thg 5, 2026", "HL", 4),
  makeFallbackDocument("demo-marketplace", "Sàn thương mại điện tử cho quản đại", "29 thg 4, 2026", "QA", 1),
  makeFallbackDocument("demo-google-doc", "Tài liệu project clone gg doc", "27 thg 4, 2026", "TN", 2),
]

export const ESSENTIAL_TEMPLATE_IDS = new Set(["blank", "meeting-notes", "project-proposal", "report"])

export const ACCENT_CLASSES: Record<string, { bar: string; soft: string; text: string; ring: string }> = {
  primary: { bar: "bg-primary", soft: "bg-primary/10", text: "text-primary", ring: "group-hover:border-primary" },
  blue: { bar: "bg-primary", soft: "bg-primary/10", text: "text-primary", ring: "group-hover:border-primary" },
  emerald: { bar: "bg-primary", soft: "bg-primary/10", text: "text-primary", ring: "group-hover:border-primary" },
  sky: { bar: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700", ring: "group-hover:border-sky-500" },
  amber: { bar: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", ring: "group-hover:border-amber-500" },
  rose: { bar: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", ring: "group-hover:border-rose-500" },
  violet: { bar: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700", ring: "group-hover:border-violet-500" },
  slate: { bar: "bg-slate-500", soft: "bg-slate-50", text: "text-slate-700", ring: "group-hover:border-slate-500" },
}

export function getInitials() {
  if (typeof window === "undefined") return "T"

  const rawUser = localStorage.getItem("user")
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser)
      const initials = `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase()
      return initials || user.username?.slice(0, 1).toUpperCase() || "T"
    } catch {
      return "T"
    }
  }

  return "T"
}

export function formatDocumentDate(value: string) {
  if (value.startsWith("Đã mở") || value.includes("thg")) return value

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Vừa mở"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function isUserAuthenticated() {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem("auth-session")
  if (!raw) return false
  try {
    const session = JSON.parse(raw)
    return !!session?.token
  } catch {
    return false
  }
}

export type OwnerFilter = "all" | "me" | "shared"
export type SortMode = "updatedAt" | "title"
export type ViewMode = "grid" | "list"
