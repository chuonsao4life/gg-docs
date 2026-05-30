import { clearSession, refreshSession } from "@/services/auth.service"

export type DashboardTemplate = {
  id: string
  title: string
  subtitle: string
  accent: string
  preview: string
}

export type DashboardUser = {
  id: string
  email?: string
  username: string
  firstname?: string
  lastname?: string
  avatar?: string | null
  displayName?: string
  initials?: string
}

export type DashboardDocument = {
  id: string
  title: string
  type: "document"
  role: string
  owner: DashboardUser | null
  collaborators: DashboardUser[]
  collaboratorCount: number
  isPublic: boolean
  publicRole?: string | null
  createdAt: string
  updatedAt: string
  openedAt: string
  preview: string
}

export type DocumentShareRole = "viewer" | "commenter" | "editor"

export type DocumentPermission = {
  id: string
  role: DocumentShareRole
  grantedAt: string
  user: DashboardUser
}

export type DocumentShareSettings = {
  document: DashboardDocument
  permissions: DocumentPermission[]
  isPublic: boolean
  publicRole: DocumentShareRole | null
  shareUrl: string
}

export type DocumentComment = {
  id: string
  documentId: string
  content: string
  selectedText: string
  fromPos: number | null
  toPos: number | null
  createdAt: string
  updatedAt: string
  user: DashboardUser
}

export type DocumentSnapshot = {
  snapshot: string | null
  version: number
  createdAt: string | null
}

export type DocumentDetailResponse = {
  document: Partial<DashboardDocument> & {
    ownerId?: string
    ownerName?: string
    snapshot?: string | null
    snapshotVersion?: number
    folderId?: string | null
    isStarred?: boolean
  }
  currentUser?: DashboardUser
  myPermission?: {
    role?: string | null
    canEdit?: boolean
    canComment?: boolean
    canShare?: boolean
  }
  collaborators?: DashboardUser[]
}

type DocumentQuery = {
  search?: string
  owner?: "all" | "me" | "shared"
  sort?: "openedAt" | "updatedAt" | "title"
  order?: "asc" | "desc"
}

const DEFAULT_API_URL = "http://localhost:4000/api"

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
  const trimmed = raw.replace(/\/+$/, "")
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`
}

function readToken() {
  if (typeof window === "undefined") return null

  const directToken = localStorage.getItem("token")
  if (directToken) return directToken

  const rawSession = localStorage.getItem("auth-session")
  if (!rawSession) return null

  try {
    const session = JSON.parse(rawSession)
    return session?.accessToken || session?.token || null
  } catch {
    return null
  }
}

async function request<T>(path: string, init: RequestInit = {}, retryOnUnauthorized = true) {
  const token = readToken()
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })

  let payload: { data?: T; message?: string } | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized) {
      try {
        await refreshSession()
        return request<T>(path, init, false)
      } catch {
        clearSession()
      }
    }

    throw new Error(payload?.message || `Request failed (${response.status})`)
  }

  return (payload?.data ?? payload) as T
}

export async function listDashboardTemplates() {
  return request<DashboardTemplate[]>("/documents/templates")
}

export async function listDashboardDocuments(query: DocumentQuery = {}) {
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.owner) params.set("owner", query.owner)
  if (query.sort) params.set("sort", query.sort)
  if (query.order) params.set("order", query.order)

  const suffix = params.toString() ? `?${params.toString()}` : ""
  return request<DashboardDocument[]>(`/documents${suffix}`)
}

export async function createDashboardDocument({
  title,
  templateId = "blank",
}: {
  title?: string
  templateId?: string
}) {
  return request<DashboardDocument>("/documents", {
    method: "POST",
    body: JSON.stringify({ title, templateId }),
  })
}

export async function getDashboardDocument(documentId: string) {
  return request<DocumentDetailResponse>(`/documents/${documentId}`)
}

export async function renameDashboardDocument(documentId: string, title: string) {
  return request<DocumentDetailResponse>(`/documents/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  })
}

export async function deleteDashboardDocument(documentId: string) {
  return request<{ success: boolean; message: string }>(`/documents/${documentId}`, {
    method: "DELETE",
  })
}

export async function getDocumentSnapshot(documentId: string) {
  return request<DocumentSnapshot>(`/documents/${documentId}/snapshot`)
}

export async function saveDocumentSnapshot(documentId: string, snapshot: string) {
  return request<DocumentSnapshot>(`/documents/${documentId}/snapshot`, {
    method: "PUT",
    body: JSON.stringify({ snapshot }),
  })
}

export async function getDocumentShareSettings(documentId: string) {
  return request<DocumentShareSettings>(`/documents/${documentId}/share`)
}

export async function updateDocumentShareSettings(
  documentId: string,
  payload: {
    isPublic?: boolean
    publicRole?: DocumentShareRole | null
    inviteEmail?: string
    role?: DocumentShareRole
    removePermissionId?: string
  },
) {
  return request<DocumentShareSettings>(`/documents/${documentId}/share`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function listDocumentComments(documentId: string) {
  return request<DocumentComment[]>(`/documents/${documentId}/comments`)
}

export async function createDocumentComment(
  documentId: string,
  payload: {
    content: string
    selectedText?: string
    fromPos?: number | null
    toPos?: number | null
  },
) {
  return request<DocumentComment>(`/documents/${documentId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function deleteDocumentComment(documentId: string, commentId: string) {
  return request<{ id: string }>(`/documents/${documentId}/comments/${commentId}`, {
    method: "DELETE",
  })
}

export async function updateDocumentComment(
  documentId: string,
  commentId: string,
  payload: {
    content: string
  },
) {
  return request<DocumentComment>(`/documents/${documentId}/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function updateDocumentCommentPosition(
  documentId: string,
  commentId: string,
  payload: {
    fromPos: number
    toPos: number
  },
) {
  return request<DocumentComment>(`/documents/${documentId}/comments/${commentId}/position`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
