"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Plus,
  FolderOpen,
  MoreHorizontal,
  Settings,
  UserPlus,
  ExternalLink,
  FileText,
  LayoutGrid,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const workspaces = [
  {
    id: 1,
    name: "Team Alpha - Product Development",
    description: "Phát triển sản phẩm chính của công ty",
    color: "bg-primary",
    members: [
      { name: "Nguyễn A", avatar: "", initials: "NA", role: "Admin" },
      { name: "Trần B", avatar: "", initials: "TB", role: "Editor" },
      { name: "Lê C", avatar: "", initials: "LC", role: "Editor" },
      { name: "Phạm D", avatar: "", initials: "PD", role: "Viewer" },
      { name: "Hoàng E", avatar: "", initials: "HE", role: "Editor" },
    ],
    documentsCount: 24,
    tasksCompleted: 18,
    tasksTotal: 25,
    lastActivity: "5 phút trước",
  },
  {
    id: 2,
    name: "Marketing Campaign Q2",
    description: "Chiến dịch marketing quý 2 năm 2026",
    color: "bg-accent",
    members: [
      { name: "Trần B", avatar: "", initials: "TB", role: "Admin" },
      { name: "Hoàng E", avatar: "", initials: "HE", role: "Editor" },
      { name: "Kim F", avatar: "", initials: "KF", role: "Editor" },
    ],
    documentsCount: 12,
    tasksCompleted: 8,
    tasksTotal: 15,
    lastActivity: "1 giờ trước",
  },
  {
    id: 3,
    name: "UI/UX Design Team",
    description: "Thiết kế giao diện và trải nghiệm người dùng",
    color: "bg-chart-3",
    members: [
      { name: "Lê C", avatar: "", initials: "LC", role: "Admin" },
      { name: "Phạm D", avatar: "", initials: "PD", role: "Editor" },
    ],
    documentsCount: 45,
    tasksCompleted: 30,
    tasksTotal: 35,
    lastActivity: "30 phút trước",
  },
  {
    id: 4,
    name: "Research & Development",
    description: "Nghiên cứu công nghệ mới và đổi mới",
    color: "bg-chart-5",
    members: [
      { name: "Nguyễn A", avatar: "", initials: "NA", role: "Admin" },
      { name: "Kim F", avatar: "", initials: "KF", role: "Editor" },
      { name: "Trần G", avatar: "", initials: "TG", role: "Viewer" },
      { name: "Lê H", avatar: "", initials: "LH", role: "Editor" },
    ],
    documentsCount: 18,
    tasksCompleted: 5,
    tasksTotal: 20,
    lastActivity: "2 ngày trước",
  },
]

export function WorkspacesSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Workspace của bạn</h2>
          <p className="text-sm text-muted-foreground">
            Các nhóm làm việc bạn tham gia
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Workspace mới</DialogTitle>
              <DialogDescription>
                Tạo một nhóm làm việc mới để cộng tác với đồng nghiệp
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workspace-name">Tên Workspace</Label>
                <Input id="workspace-name" placeholder="VD: Team Product Development" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-desc">Mô tả</Label>
                <Textarea
                  id="workspace-desc"
                  placeholder="Mô tả ngắn về workspace này..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-members">Mời thành viên (email)</Label>
                <Input
                  id="workspace-members"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workspaces.map((workspace) => {
          const progress = Math.round(
            (workspace.tasksCompleted / workspace.tasksTotal) * 100
          )

          return (
            <Card
              key={workspace.id}
              className="group transition-all duration-200 hover:border-primary/50 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${workspace.color}`}
                    >
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="line-clamp-1 text-lg">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {workspace.description}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Mở Workspace
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Mời thành viên
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Rời khỏi Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{workspace.documentsCount} tài liệu</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <LayoutGrid className="h-4 w-4" />
                    <span>
                      {workspace.tasksCompleted}/{workspace.tasksTotal} tasks
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Members & Activity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {workspace.members.slice(0, 4).map((member, i) => (
                        <Avatar key={i} className="h-7 w-7 border-2 border-card">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-secondary text-[10px]">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {workspace.members.length > 4 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium">
                          +{workspace.members.length - 4}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      {workspace.members.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {workspace.lastActivity}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
