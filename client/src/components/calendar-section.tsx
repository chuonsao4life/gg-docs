"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react"

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Sprint Planning Meeting",
    time: "09:00 - 10:30",
    type: "meeting",
    color: "bg-primary",
    location: "Google Meet",
    isOnline: true,
    attendees: [
      { name: "Nguyễn A", initials: "NA" },
      { name: "Trần B", initials: "TB" },
      { name: "Lê C", initials: "LC" },
    ],
  },
  {
    id: 2,
    title: "Design Review - Landing Page",
    time: "14:00 - 15:00",
    type: "review",
    color: "bg-accent",
    location: "Phòng họp A3",
    isOnline: false,
    attendees: [
      { name: "Lê C", initials: "LC" },
      { name: "Phạm D", initials: "PD" },
    ],
  },
  {
    id: 3,
    title: "Code Review Session",
    time: "16:00 - 17:00",
    type: "work",
    color: "bg-chart-3",
    location: "Zoom",
    isOnline: true,
    attendees: [
      { name: "Nguyễn A", initials: "NA" },
      { name: "Hoàng E", initials: "HE" },
    ],
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: "Hoàn thành API documentation",
    deadline: "Hôm nay, 18:00",
    priority: "high",
    project: "Team Alpha",
  },
  {
    id: 2,
    title: "Review PR #234",
    deadline: "Ngày mai, 10:00",
    priority: "medium",
    project: "Product Development",
  },
  {
    id: 3,
    title: "Update wireframes",
    deadline: "Thứ 5, 14:00",
    priority: "low",
    project: "UI/UX Design",
  },
]

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
}

const priorityLabels = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
}

export function CalendarSection() {
  const [currentDate] = useState(new Date())
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    location: "",
    isOnline: true,
  })
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section id="calendar" className="py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lịch & Công việc</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý thời gian và deadline của bạn
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowEventForm((visible) => !visible)}>
          <Plus className="h-4 w-4" />
          Thêm sự kiện
        </Button>
      </div>

      {showEventForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form
              className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                if (!newEvent.title.trim()) return

                setEvents((currentEvents) => [
                  ...currentEvents,
                  {
                    id: Date.now(),
                    title: newEvent.title.trim(),
                    time: `${newEvent.start || "09:00"} - ${newEvent.end || "10:00"}`,
                    type: "meeting",
                    color: "bg-primary",
                    location: newEvent.location.trim() || (newEvent.isOnline ? "Google Meet" : "Phòng họp"),
                    isOnline: newEvent.isOnline,
                    attendees: [{ name: "Bạn", initials: "BT" }],
                  },
                ])
                setNewEvent({ title: "", start: "", end: "", location: "", isOnline: true })
                setShowEventForm(false)
              }}
            >
              <input
                value={newEvent.title}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Tên sự kiện"
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
              <input
                value={newEvent.start}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, start: event.target.value }))}
                type="time"
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={newEvent.end}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, end: event.target.value }))}
                type="time"
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={newEvent.location}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Địa điểm hoặc link"
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <Button type="submit">Tạo</Button>
            </form>
            <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={newEvent.isOnline}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, isOnline: event.target.checked }))}
              />
              Sự kiện online
            </label>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Lịch hôm nay</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {formatDate(currentDate)}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className={`h-full w-1 shrink-0 rounded-full ${event.color}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            {event.isOnline ? (
                              <Video className="h-3.5 w-3.5" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5" />
                            )}
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Tham gia
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex -space-x-2">
                        {event.attendees.map((attendee, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-card">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-[10px]">
                              {attendee.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {event.attendees.length} người tham gia
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Deadline sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border p-3 transition-all hover:border-primary/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="line-clamp-2 text-sm font-medium">
                      {task.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${
                        priorityColors[task.priority as keyof typeof priorityColors]
                      }`}
                    >
                      {priorityLabels[task.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.deadline}
                    </span>
                    <span className="truncate">{task.project}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full" size="sm">
              Xem tất cả công việc
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
