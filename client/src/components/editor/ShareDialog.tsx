"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Link as LinkIcon, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getDocumentShareSettings,
  updateDocumentShareSettings,
  type DocumentPermission,
  type DocumentShareRole,
} from "@/services/document.service"

const ROLE_LABELS: Record<DocumentShareRole, string> = {
  viewer: "Viewer",
  commenter: "Commenter",
  editor: "Editor",
}

export function ShareDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<DocumentShareRole>("viewer")
  const [publicRole, setPublicRole] = useState<DocumentShareRole>("viewer")
  const [isPublic, setIsPublic] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [permissions, setPermissions] = useState<DocumentPermission[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const loadShareSettings = useCallback(async () => {
    try {
      const settings = await getDocumentShareSettings(documentId)
      setPermissions(settings.permissions)
      setIsPublic(settings.isPublic)
      setPublicRole(settings.publicRole || "viewer")
      setShareUrl(settings.shareUrl)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải quyền chia sẻ.")
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      void loadShareSettings()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadShareSettings, open])

  async function updatePublicAccess(nextIsPublic: boolean, nextRole = publicRole) {
    setError("")
    setMessage("")

    try {
      const settings = await updateDocumentShareSettings(documentId, {
        isPublic: nextIsPublic,
        publicRole: nextIsPublic ? nextRole : null,
      })
      setIsPublic(settings.isPublic)
      setPublicRole(settings.publicRole || "viewer")
      setShareUrl(settings.shareUrl)
      setMessage("Đã cập nhật quyền link.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật quyền link.")
    }
  }

  async function inviteUser(event: React.FormEvent) {
    event.preventDefault()
    if (!inviteEmail.trim()) return

    setError("")
    setMessage("")

    try {
      const settings = await updateDocumentShareSettings(documentId, {
        inviteEmail,
        role: inviteRole,
      })
      setPermissions(settings.permissions)
      setInviteEmail("")
      setMessage("Đã chia sẻ tài liệu.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể chia sẻ tài liệu.")
    }
  }

  async function removePermission(permissionId: string) {
    setError("")
    setMessage("")

    try {
      const settings = await updateDocumentShareSettings(documentId, { removePermissionId: permissionId })
      setPermissions(settings.permissions)
      setMessage("Đã gỡ quyền truy cập.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gỡ quyền.")
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setMessage("Đã sao chép link.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9">
          <Share2 className="h-4 w-4" />
          Chia sẻ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chia sẻ tài liệu</DialogTitle>
          <DialogDescription>Thêm người dùng hoặc bật link chia sẻ với quyền phù hợp.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="rounded-md border bg-secondary/40 p-4 text-sm text-muted-foreground">Đang tải quyền chia sẻ...</div>
        ) : (
          <div className="space-y-5">
            {message && <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">{message}</div>}
            {error && <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <form onSubmit={inviteUser} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                type="email"
                placeholder="Email người cần chia sẻ"
                className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as DocumentShareRole)}
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <option key={role} value={role}>{label}</option>
                ))}
              </select>
              <Button type="submit">Thêm</Button>
            </form>

            <div className="rounded-md border">
              <div className="border-b px-4 py-3 text-sm font-medium">Người có quyền truy cập</div>
              {permissions.length === 0 ? (
                <div className="px-4 py-4 text-sm text-muted-foreground">Chưa chia sẻ riêng cho ai.</div>
              ) : (
                permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {permission.user.initials || permission.user.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{permission.user.displayName || permission.user.username}</div>
                      <div className="truncate text-xs text-muted-foreground">{permission.user.email}</div>
                    </div>
                    <span className="text-sm text-muted-foreground">{ROLE_LABELS[permission.role]}</span>
                    <button
                      type="button"
                      onClick={() => removePermission(permission.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
                      title="Gỡ quyền"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Truy cập qua link</div>
                    <div className="text-xs text-muted-foreground">{isPublic ? "Bất kỳ ai có link" : "Chỉ người được thêm"}</div>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => updatePublicAccess(event.target.checked)}
                  />
                  Bật link
                </label>
              </div>

              {isPublic && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={publicRole}
                    onChange={(event) => {
                      const nextRole = event.target.value as DocumentShareRole
                      setPublicRole(nextRole)
                      void updatePublicAccess(true, nextRole)
                    }}
                    className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <option key={role} value={role}>{label}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" onClick={copyLink}>
                    {message === "Đã sao chép link." ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Sao chép link
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
