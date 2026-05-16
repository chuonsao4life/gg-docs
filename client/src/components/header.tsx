"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Settings, Menu, X, Users, FileText, LayoutGrid, Calendar, LogOut } from "lucide-react"
import { logoutUser } from "@/services/auth.service"

export function Header() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:inline-block">
              Collaborative Workspaces
            </span>
            <span className="text-xl font-bold text-foreground sm:hidden">
              CoWorkHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <FileText className="h-4 w-4" />
            Tài liệu
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <LayoutGrid className="h-4 w-4" />
            Workspace
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm tài liệu, workspace..."
              className="h-9 w-full pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">NT</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">NT</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Nguyễn Văn A</span>
                  <span className="text-xs text-muted-foreground">nguyenvana@email.com</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Tài khoản của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard tài liệu</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Cài đặt</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Trợ giúp</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="h-10 w-full pl-10"
              />
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <FileText className="h-4 w-4" />
              Tài liệu
            </Link>
            <Link href="#" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <LayoutGrid className="h-4 w-4" />
              Workspace
            </Link>
            <Link href="/#calendar" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Calendar className="h-4 w-4" />
              Lịch
            </Link>
            <Link href="#" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Users className="h-4 w-4" />
              Nhóm
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
