import Link from "next/link"
import { CalendarDays, FileText, LogOut, Plus, Search, Settings } from "lucide-react"

export function DashboardTopBar({
  search,
  onSearchChange,
  userInitials,
  creating,
  onCreateBlank,
  onLogout,
}: {
  search: string
  onSearchChange: (value: string) => void
  userInitials: string
  creating: boolean
  onCreateBlank: () => void
  onLogout: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <div className="flex h-10 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="hidden text-2xl font-medium tracking-normal text-slate-800 sm:block">Tài liệu</h1>
        </div>

        <nav className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
          <Link href="/" className="rounded-md px-3 py-2 transition hover:bg-secondary hover:text-foreground">Trang chủ</Link>
          <Link href="/#calendar" className="inline-flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-secondary hover:text-foreground">
            <CalendarDays className="h-4 w-4" />
            Lịch
          </Link>
        </nav>

        <div className="mx-auto flex max-w-3xl flex-1 items-center">
          <label className="flex h-12 w-full items-center gap-4 rounded-lg bg-secondary px-4 text-muted-foreground transition focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
              placeholder="Tìm kiếm"
              type="search"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onCreateBlank}
          disabled={creating}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
          title="Tạo tài liệu mới"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{creating ? "Đang tạo" : "Tạo mới"}</span>
        </button>

        <Link
          href="/settings"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:flex"
          title="Cài đặt người dùng"
        >
          <Settings className="h-5 w-5" />
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
          title="Tài khoản"
        >
          {userInitials}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-destructive sm:flex"
          title="Đăng xuất"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
