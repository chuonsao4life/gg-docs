"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  LayoutGrid,
  PenTool,
  Calendar,
  MoreVertical,
  Star,
  Share2,
  Trash2,
  Copy,
  Clock,
  Users,
} from "lucide-react"

const recentDocuments = [
  {
    id: 1,
    title: "Kế hoạch dự án Q2 2026",
    type: "document",
    icon: FileText,
    lastModified: "2 phút trước",
    collaborators: [
      { name: "Nguyễn A", avatar: "", initials: "NA" },
      { name: "Trần B", avatar: "", initials: "TB" },
      { name: "Lê C", avatar: "", initials: "LC" },
    ],
    isStarred: true,
    isShared: true,
  },
  {
    id: 2,
    title: "Sprint Board - Team Alpha",
    type: "kanban",
    icon: LayoutGrid,
    lastModified: "15 phút trước",
    collaborators: [
      { name: "Phạm D", avatar: "", initials: "PD" },
      { name: "Hoàng E", avatar: "", initials: "HE" },
    ],
    isStarred: false,
    isShared: true,
  },
  {
    id: 3,
    title: "Brainstorm - Tính năng mới",
    type: "whiteboard",
    icon: PenTool,
    lastModified: "1 giờ trước",
    collaborators: [
      { name: "Nguyễn A", avatar: "", initials: "NA" },
      { name: "Trần B", avatar: "", initials: "TB" },
      { name: "Lê C", avatar: "", initials: "LC" },
      { name: "Phạm D", avatar: "", initials: "PD" },
      { name: "Hoàng E", avatar: "", initials: "HE" },
    ],
    isStarred: true,
    isShared: true,
  },
  {
    id: 4,
    title: "Lịch họp Team - Tháng 4",
    type: "calendar",
    icon: Calendar,
    lastModified: "3 giờ trước",
    collaborators: [
      { name: "Trần B", avatar: "", initials: "TB" },
    ],
    isStarred: false,
    isShared: false,
  },
  {
    id: 5,
    title: "Product Roadmap 2026",
    type: "document",
    icon: FileText,
    lastModified: "Hôm qua",
    collaborators: [
      { name: "Nguyễn A", avatar: "", initials: "NA" },
      { name: "Lê C", avatar: "", initials: "LC" },
    ],
    isStarred: true,
    isShared: true,
  },
  {
    id: 6,
    title: "UI/UX Design Review",
    type: "whiteboard",
    icon: PenTool,
    lastModified: "2 ngày trước",
    collaborators: [
      { name: "Phạm D", avatar: "", initials: "PD" },
    ],
    isStarred: false,
    isShared: false,
  },
]

const typeColors: Record<string, { bg: string; text: string }> = {
  document: { bg: "bg-primary/10", text: "text-primary" },
  kanban: { bg: "bg-accent/10", text: "text-accent" },
  whiteboard: { bg: "bg-chart-3/10", text: "text-chart-3" },
  calendar: { bg: "bg-chart-5/10", text: "text-chart-5" },
}

const typeLabels: Record<string, string> = {
  document: "Tài liệu",
  kanban: "Kanban",
  whiteboard: "Whiteboard",
  calendar: "Lịch",
}

export function RecentDocuments() {
  const [starredDocs, setStarredDocs] = useState<number[]>(
    recentDocuments.filter((d) => d.isStarred).map((d) => d.id)
  )

  const toggleStar = (id: number) => {
    setStarredDocs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tài liệu gần đây</h2>
          <p className="text-sm text-muted-foreground">
            Các tài liệu bạn đã truy cập gần đây
          </p>
        </div>
        <Button variant="outline" size="sm">
          Xem tất cả
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentDocuments.map((doc) => {
          const Icon = doc.icon
          const colors = typeColors[doc.type]
          const isStarred = starredDocs.includes(doc.id)

          return (
            <Card
              key={doc.id}
              className="group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1 text-base font-semibold">
                      {doc.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabels[doc.type]}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleStar(doc.id)}>
                      <Star
                        className={`mr-2 h-4 w-4 ${
                          isStarred ? "fill-chart-4 text-chart-4" : ""
                        }`}
                      />
                      {isStarred ? "Bỏ đánh dấu" : "Đánh dấu"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Chia sẻ
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Sao chép
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{doc.lastModified}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.isShared && (
                      <div className="mr-1 flex items-center text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="flex -space-x-2">
                      {doc.collaborators.slice(0, 3).map((collaborator, i) => (
                        <Avatar
                          key={i}
                          className="h-6 w-6 border-2 border-card"
                        >
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback className="bg-secondary text-[10px]">
                            {collaborator.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {doc.collaborators.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium">
                          +{doc.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                    {isStarred && (
                      <Star className="ml-2 h-4 w-4 fill-chart-4 text-chart-4" />
                    )}
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
