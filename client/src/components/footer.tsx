import Link from "next/link"
import { Users, Mail, MapPin, ExternalLink } from "lucide-react"

const teamMembers = [
  {
    name: "Nguyễn Văn A",
    role: "Project Lead",
    email: "nguyenvana@coworkhub.vn",
  },
  {
    name: "Trần Thị B",
    role: "Full-stack Developer",
    email: "tranthib@coworkhub.vn",
  },
  {
    name: "Lê Văn C",
    role: "UI/UX Designer",
    email: "levanc@coworkhub.vn",
  },
  {
    name: "Phạm Thị D",
    role: "Backend Developer",
    email: "phamthid@coworkhub.vn",
  },
]

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CoWorkHub</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              Nền tảng cộng tác làm việc theo thời gian thực, giúp nhóm của bạn
              làm việc hiệu quả hơn với các công cụ chỉnh sửa đồng thời.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="rounded-md p-2 transition-colors hover:bg-sidebar-accent">
                <ExternalLink className="h-5 w-5" />
              </Link>
              <Link href="#" className="rounded-md p-2 transition-colors hover:bg-sidebar-accent">
                <ExternalLink className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-lg font-semibold">Đội ngũ phát triển</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3"
                >
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="text-xs text-sidebar-foreground/60">{member.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-sidebar-foreground/70">
                  Đại học Bách Khoa Hà Nội 
                  <br />
                  Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-sidebar-foreground/70">contact@coworkhub.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-6 sm:flex-row">
          <p className="text-sm text-sidebar-foreground/60">
            © 2026 CoWorkHub. Được phát triển bởi sinh viên UIT.
          </p>
          <div className="flex gap-4 text-sm text-sidebar-foreground/60">
            <Link href="#" className="transition-colors hover:text-sidebar-foreground">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="transition-colors hover:text-sidebar-foreground">
              Điều khoản sử dụng
            </Link>
            <Link href="#" className="transition-colors hover:text-sidebar-foreground">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
