import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MousePointer2,
  FileText,
  LayoutGrid,
  PenTool,
  Calendar,
  MessageCircle,
  History,
  Lock,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: MousePointer2,
    title: "Con trỏ thời gian thực",
    description: "Xem vị trí con trỏ của đồng nghiệp khi đang cộng tác, giúp phối hợp làm việc dễ dàng hơn.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: FileText,
    title: "Chỉnh sửa tài liệu",
    description: "Soạn thảo văn bản cùng lúc với nhiều người, tự động đồng bộ mọi thay đổi ngay lập tức.",
    color: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: LayoutGrid,
    title: "Bảng Kanban",
    description: "Quản lý dự án theo phương pháp Agile với các cột trạng thái và tính năng kéo thả.",
    color: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
  {
    icon: PenTool,
    title: "Whiteboard",
    description: "Bảng trắng số để brainstorm, vẽ sơ đồ và phác thảo ý tưởng cùng nhóm.",
    color: "bg-chart-4/10",
    iconColor: "text-chart-4",
  },
  {
    icon: Calendar,
    title: "Lịch & Timeline",
    description: "Quản lý lịch nhóm, theo dõi deadline và lập kế hoạch sprint một cách trực quan.",
    color: "bg-chart-5/10",
    iconColor: "text-chart-5",
  },
  {
    icon: MessageCircle,
    title: "Chat tích hợp",
    description: "Nhắn tin trực tiếp trong workspace mà không cần chuyển sang ứng dụng khác.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: History,
    title: "Lịch sử phiên làm việc",
    description: "Xem lại tất cả thay đổi, khôi phục phiên bản cũ và theo dõi ai đã sửa gì.",
    color: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Lock,
    title: "Bảo mật cao",
    description: "Dữ liệu được mã hóa end-to-end, kiểm soát quyền truy cập chi tiết cho từng thành viên.",
    color: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
  {
    icon: Zap,
    title: "Hiệu suất cao",
    description: "Được xây dựng trên công nghệ CRDT/OT, đảm bảo không xung đột dữ liệu khi chỉnh sửa.",
    color: "bg-chart-4/10",
    iconColor: "text-chart-4",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground text-balance md:text-4xl">
          Tất cả công cụ bạn cần
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          Một nền tảng duy nhất cho mọi nhu cầu cộng tác. Từ soạn thảo văn bản đến
          quản lý dự án, tất cả đều hoạt động theo thời gian thực.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon
          return (
            <Card
              key={i}
              className="group transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <CardHeader>
                <div
                  className={`mb-2 inline-flex rounded-lg p-3 ${feature.color}`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-pretty">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          )
        })}
      </div>
    </section>
  )
}
