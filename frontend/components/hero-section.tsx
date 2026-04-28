"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MousePointer2,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react"

const onlineUsers = [
  { name: "Nguyễn A", initials: "NA", color: "bg-primary" },
  { name: "Trần B", initials: "TB", color: "bg-accent" },
  { name: "Lê C", initials: "LC", color: "bg-chart-3" },
  { name: "Phạm D", initials: "PD", color: "bg-chart-5" },
]

const features = [
  { icon: Zap, text: "Đồng bộ thời gian thực" },
  { icon: Users, text: "Cộng tác không giới hạn" },
  { icon: MousePointer2, text: "Xem con trỏ của nhau" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="text-center">
        {/* Badge */}
        <Badge
          variant="secondary"
          className="mb-6 gap-2 px-4 py-2 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Nền tảng cộng tác thế hệ mới
        </Badge>

        {/* Title */}
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Làm việc cùng nhau,{" "}
          <span className="text-primary">
            theo thời gian thực
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Chỉnh sửa tài liệu, bảng kanban, whiteboard đồng thời với đồng nghiệp.
          Thấy con trỏ và thay đổi của nhau ngay lập tức.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8">
            Bắt đầu miễn phí
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="px-8">
            Xem demo
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className="rounded-full bg-primary/10 p-1.5">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              {feature.text}
            </div>
          ))}
        </div>

        {/* Online Users */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            {onlineUsers.map((user, i) => (
              <Avatar
                key={i}
                className={`h-10 w-10 border-3 border-background ${user.color}`}
              >
                <AvatarImage src="" />
                <AvatarFallback className="bg-transparent text-xs text-white">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              +2,500 người dùng
            </p>
            <p className="text-xs text-muted-foreground">
              đang online ngay bây giờ
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/5">
            {/* Browser Header */}
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-chart-4/60" />
                <div className="h-3 w-3 rounded-full bg-chart-2/60" />
              </div>
              <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-background px-3 py-1.5 text-xs text-muted-foreground">
                <span className="hidden sm:inline">coworkhub.vn/workspace/team-alpha</span>
                <span className="sm:hidden">coworkhub.vn</span>
              </div>
            </div>

            {/* Preview Content */}
            <div className="relative aspect-[16/9] bg-muted/20 p-4 sm:p-8">
              {/* Simulated Editor */}
              <div className="grid h-full gap-4 sm:grid-cols-3">
                {/* Sidebar */}
                <div className="hidden rounded-lg border bg-card p-4 sm:block">
                  <div className="mb-4 h-4 w-20 rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-8 rounded bg-primary/10" />
                    <div className="h-8 rounded bg-muted" />
                    <div className="h-8 rounded bg-muted" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative col-span-2 rounded-lg border bg-card p-4 sm:col-span-2">
                  <div className="mb-4 h-6 w-48 rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 rounded bg-muted" />
                    <div className="h-4 w-5/6 rounded bg-muted" />
                    <div className="h-4 w-4/6 rounded bg-muted" />
                  </div>

                  {/* Cursors */}
                  <div className="absolute left-1/4 top-1/3 flex items-start">
                    <MousePointer2 className="h-4 w-4 -rotate-12 fill-primary text-primary" />
                    <span className="ml-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      Nguyễn A
                    </span>
                  </div>
                  <div className="absolute right-1/4 top-1/2 flex items-start">
                    <MousePointer2 className="h-4 w-4 -rotate-12 fill-accent text-accent" />
                    <span className="ml-0.5 rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                      Trần B
                    </span>
                  </div>
                </div>
              </div>

              {/* Online Users Indicator */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-sm sm:right-8 sm:top-8">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-medium">4 đang online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
