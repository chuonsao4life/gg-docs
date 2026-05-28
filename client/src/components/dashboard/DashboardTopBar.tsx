import Link from "next/link"
import { CalendarDays, FileText, LogOut, Plus, Search, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardTopBar({
  search,
  onSearchChange,
  userInitials,
  userAvatar,
  creating,
  onCreateBlank,
  onLogout,
}: {
  search: string
  onSearchChange: (value: string) => void
  userInitials: string
  userAvatar?: string | null
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
        </nav>

        <div className="mx-auto flex max-w-3xl flex-1 items-center">
          <label className="flex h-12 w-full cursor-text items-center gap-4 rounded-lg border-2 border-transparent bg-secondary px-4 text-muted-foreground transition focus-within:border-primary focus-within:bg-background focus-within:text-primary focus-within:shadow-sm focus-within:ring-4 focus-within:ring-primary/15">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-full min-w-0 flex-1 cursor-text bg-transparent text-base text-slate-900 caret-primary outline-none placeholder:text-slate-500"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex shrink-0 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Avatar className="h-10 w-10 border border-slate-200">
                {userAvatar && <AvatarImage src={userAvatar} alt="User Avatar" />}
                <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex w-full cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
