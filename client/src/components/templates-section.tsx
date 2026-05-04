"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  LayoutGrid,
  Calendar,
  PenTool,
  Table2,
  ListTodo,
  Presentation,
  StickyNote,
  Plus,
  Users,
  User,
  Clock,
  Star,
} from "lucide-react"

const templates = {
  personal: [
    {
      id: 1,
      title: "Trang trống",
      description: "Bắt đầu với một trang trắng hoàn toàn",
      icon: FileText,
      color: "bg-secondary",
      iconColor: "text-muted-foreground",
    },
    {
      id: 2,
      title: "Ghi chú cá nhân",
      description: "Ghi chú nhanh và quản lý ý tưởng",
      icon: StickyNote,
      color: "bg-chart-4/20",
      iconColor: "text-chart-4",
    },
    {
      id: 3,
      title: "To-do List",
      description: "Danh sách công việc hàng ngày",
      icon: ListTodo,
      color: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 4,
      title: "Lịch cá nhân",
      description: "Quản lý thời gian và sự kiện",
      icon: Calendar,
      color: "bg-chart-5/20",
      iconColor: "text-chart-5",
    },
  ],
  workspace: [
    {
      id: 5,
      title: "Bảng Kanban",
      description: "Quản lý dự án theo cột trạng thái",
      icon: LayoutGrid,
      color: "bg-accent/20",
      iconColor: "text-accent",
      popular: true,
    },
    {
      id: 6,
      title: "Whiteboard",
      description: "Bảng trắng cộng tác brainstorm",
      icon: PenTool,
      color: "bg-chart-3/20",
      iconColor: "text-chart-3",
      popular: true,
    },
    {
      id: 7,
      title: "Tài liệu nhóm",
      description: "Soạn thảo văn bản cùng đồng nghiệp",
      icon: FileText,
      color: "bg-primary/20",
      iconColor: "text-primary",
      popular: true,
    },
    {
      id: 8,
      title: "Bảng tính",
      description: "Bảng dữ liệu và phân tích",
      icon: Table2,
      color: "bg-chart-2/20",
      iconColor: "text-chart-2",
    },
    {
      id: 9,
      title: "Sprint Planning",
      description: "Lập kế hoạch sprint cho Agile/Scrum",
      icon: ListTodo,
      color: "bg-chart-4/20",
      iconColor: "text-chart-4",
    },
    {
      id: 10,
      title: "Presentation",
      description: "Tạo bài thuyết trình nhóm",
      icon: Presentation,
      color: "bg-chart-5/20",
      iconColor: "text-chart-5",
    },
  ],
  schedule: [
    {
      id: 11,
      title: "Lịch nhóm",
      description: "Xem lịch làm việc chung của nhóm",
      icon: Calendar,
      color: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 12,
      title: "Timeline dự án",
      description: "Biểu đồ Gantt cho dự án",
      icon: Clock,
      color: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: 13,
      title: "Meeting Schedule",
      description: "Lên lịch họp và theo dõi cuộc họp",
      icon: Users,
      color: "bg-chart-3/20",
      iconColor: "text-chart-3",
    },
    {
      id: 14,
      title: "Deadline Tracker",
      description: "Theo dõi deadline và milestone",
      icon: ListTodo,
      color: "bg-chart-5/20",
      iconColor: "text-chart-5",
    },
  ],
}

export function TemplatesSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  const handleTemplateClick = (id: number) => {
    setSelectedTemplate(id)
    // Here you would typically navigate to create a new document
  }

  return (
    <section className="py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground text-balance">Bắt đầu dự án mới</h2>
        <p className="mt-2 text-muted-foreground">
          Chọn một mẫu hoặc tạo tài liệu mới từ đầu
        </p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="mx-auto mb-8 flex w-full max-w-lg">
          <TabsTrigger value="personal" className="flex-1 gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Cá nhân</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex-1 gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch trình</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.personal.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workspace">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.workspace.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.schedule.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

interface Template {
  id: number
  title: string
  description: string
  icon: React.ElementType
  color: string
  iconColor: string
  popular?: boolean
}

function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: Template
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = template.icon

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg ${
        isSelected ? "border-primary ring-2 ring-primary/20" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-3 ${template.color}`}>
            <Icon className={`h-6 w-6 ${template.iconColor}`} />
          </div>
          {template.popular && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
              Phổ biến
            </Badge>
          )}
        </div>
        <CardTitle className="mt-3 text-lg">{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
      </CardContent>
    </Card>
  )
}
