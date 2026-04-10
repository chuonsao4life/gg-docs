"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  MessageCircle,
  Send,
  Smile,
  Paperclip,
  X,
  Circle,
  Users,
  Hash,
} from "lucide-react"

interface Message {
  id: number
  sender: {
    name: string
    initials: string
    avatar: string
  }
  content: string
  timestamp: string
  isOwn: boolean
}

interface ChatChannel {
  id: number
  name: string
  type: "group" | "direct"
  unreadCount: number
  lastMessage: string
  avatar?: string
  initials?: string
  isOnline?: boolean
}

const channels: ChatChannel[] = [
  {
    id: 1,
    name: "Team Alpha",
    type: "group",
    unreadCount: 3,
    lastMessage: "Nguyễn A: Đã cập nhật file mới",
  },
  {
    id: 2,
    name: "Marketing",
    type: "group",
    unreadCount: 0,
    lastMessage: "Trần B: OK, tôi sẽ review",
  },
  {
    id: 3,
    name: "Nguyễn Văn A",
    type: "direct",
    unreadCount: 1,
    lastMessage: "Bạn có thể check giúp mình...",
    initials: "NA",
    isOnline: true,
  },
  {
    id: 4,
    name: "Trần Thị B",
    type: "direct",
    unreadCount: 0,
    lastMessage: "Cảm ơn bạn!",
    initials: "TB",
    isOnline: false,
  },
]

const initialMessages: Message[] = [
  {
    id: 1,
    sender: { name: "Nguyễn Văn A", initials: "NA", avatar: "" },
    content: "Chào mọi người! Mình vừa cập nhật xong phần thiết kế mới.",
    timestamp: "10:30",
    isOwn: false,
  },
  {
    id: 2,
    sender: { name: "Trần Thị B", initials: "TB", avatar: "" },
    content: "Tuyệt vời! Để mình xem qua nhé.",
    timestamp: "10:32",
    isOwn: false,
  },
  {
    id: 3,
    sender: { name: "Bạn", initials: "NT", avatar: "" },
    content: "Mình cũng muốn góp ý về phần navigation, có thể họp nhanh được không?",
    timestamp: "10:35",
    isOwn: true,
  },
  {
    id: 4,
    sender: { name: "Nguyễn Văn A", initials: "NA", avatar: "" },
    content: "Được chứ! 2h chiều nay nhé?",
    timestamp: "10:36",
    isOwn: false,
  },
  {
    id: 5,
    sender: { name: "Lê Văn C", initials: "LC", avatar: "" },
    content: "Mình join được không ạ? Có vài ý tưởng muốn share 😊",
    timestamp: "10:38",
    isOwn: false,
  },
]

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(channels[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const totalUnread = channels.reduce((acc, ch) => acc + ch.unreadCount, 0)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: messages.length + 1,
      sender: { name: "Bạn", initials: "NT", avatar: "" },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {totalUnread}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Channels Sidebar */}
          <div className="w-20 shrink-0 border-r bg-muted/30">
            <ScrollArea className="h-full py-2">
              <div className="space-y-1 px-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`flex w-full flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                      selectedChannel?.id === channel.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="relative">
                      {channel.type === "group" ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                          <Hash className="h-5 w-5" />
                        </div>
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={channel.avatar} />
                          <AvatarFallback>{channel.initials}</AvatarFallback>
                        </Avatar>
                      )}
                      {channel.type === "direct" && (
                        <Circle
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${
                            channel.isOnline
                              ? "fill-primary text-primary"
                              : "fill-muted-foreground text-muted-foreground"
                          }`}
                        />
                      )}
                      {channel.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                        >
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <span className="max-w-full truncate text-[10px]">
                      {channel.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {selectedChannel ? (
              <>
                {/* Channel Header */}
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  {selectedChannel.type === "group" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <Users className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{selectedChannel.initials}</AvatarFallback>
                      </Avatar>
                      {selectedChannel.isOnline && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-primary text-primary" />
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedChannel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChannel.type === "group"
                        ? "5 thành viên"
                        : selectedChannel.isOnline
                        ? "Đang hoạt động"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        {!message.isOwn && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback className="text-xs">
                              {message.sender.initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[75%] space-y-1 ${
                            message.isOwn ? "items-end" : ""
                          }`}
                        >
                          {!message.isOwn && (
                            <p className="text-xs font-medium text-muted-foreground">
                              {message.sender.name}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p
                            className={`text-[10px] text-muted-foreground ${
                              message.isOwn ? "text-right" : ""
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="shrink-0"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Chọn một kênh để bắt đầu chat</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
