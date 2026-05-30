import { useState } from "react"
import { FileText, MoreVertical, Plus, Users, Pencil, Trash2 } from "lucide-react"
import { DashboardDocument } from "@/services/document.service"
import { formatDocumentDate, ViewMode } from "./dashboardUtils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DocumentActionMenu({ 
  document, 
  onRename, 
  onDelete, 
  trigger 
}: { 
  document: DashboardDocument; 
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  trigger: React.ReactNode;
}) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(document.title)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const role = String(document.role || "").trim().toLowerCase();
  const isOwner = role === "owner";
  const canRename = isOwner || role === "editor";

  if (!isOwner && !canRename) {
    return null;
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTitle.trim() && newTitle.trim() !== document.title) {
      onRename(newTitle.trim())
    }
    setIsRenameOpen(false)
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
          {canRename && (
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault()
                setNewTitle(document.title)
                setIsRenameOpen(true)
                setIsDropdownOpen(false)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Đổi tên
            </DropdownMenuItem>
          )}
          {isOwner && canRename && <DropdownMenuSeparator />}
          {isOwner && (
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault()
                setIsDeleteOpen(true)
                setIsDropdownOpen(false)
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa tài liệu
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Đổi tên tài liệu</DialogTitle>
              <DialogDescription>
                Nhập tên mới cho tài liệu của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tên tài liệu..."
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!newTitle.trim() || newTitle.trim() === document.title}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tài liệu &quot;{document.title}&quot; sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                onDelete()
                setIsDeleteOpen(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tài liệu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function DocumentListRow({ 
  document, 
  onOpen,
  onRename,
  onDelete
}: { 
  document: DashboardDocument; 
  onOpen: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 bg-white px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_120px_auto]">
      <button type="button" onClick={onOpen} className="flex min-w-0 items-center gap-3 text-left">
        <FileText className="h-6 w-6 shrink-0 text-primary" />
        <span className="truncate font-medium text-slate-700">{document.title}</span>
      </button>
      <div className="hidden text-sm text-slate-500 sm:block">{formatDocumentDate(document.openedAt || document.updatedAt)}</div>
      
      <DocumentActionMenu 
        document={document} 
        onRename={onRename} 
        onDelete={onDelete}
        trigger={
          <button type="button" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100" title="Tùy chọn">
            <MoreVertical className="h-5 w-5" />
          </button>
        }
      />
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
