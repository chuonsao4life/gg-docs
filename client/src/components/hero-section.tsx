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
          Nền tảng cộng tác theo thời gian thực mới ra mắt!
        </Badge>

        {/* Title */}
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          <span className="text-primary">
            Collaborative Workspaces
          </span>
        </h1>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8">
            Bắt đầu miễn phí
            <ArrowRight className="h-4 w-4" />
          </Button>
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
      </div>
    </section>
  )
}
