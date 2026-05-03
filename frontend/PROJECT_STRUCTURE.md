# Cấu Trúc Thư Mục Dự Án - Collaborative Workspace Platform

## Tổng Quan
Đây là một dự án Next.js 14+ được xây dựng với TypeScript, Tailwind CSS, và các công nghệ hiện đại khác. Dự án là một nền tảng làm việc hợp tác cho phép người dùng tạo, chỉnh sửa và quản lý tài liệu cùng với các tính năng bình luận và trò chuyện.

## Cấu Trúc Thư Mục Chi Tiết

```
Collaborative-Workspace-Platform/
│
├── 📄 Các File Cấu Hình Gốc
│   ├── package.json                 # Dependencies và scripts dự án
│   ├── tsconfig.json                # Cấu hình TypeScript
│   ├── next.config.mjs              # Cấu hình Next.js
│   ├── postcss.config.mjs           # Cấu hình PostCSS
│   ├── components.json              # Cấu hình UI components (shadcn)
│   ├── pnpm-lock.yaml               # Lock file cho package manager
│   ├── next-env.d.ts                # Kiểu TypeScript cho Next.js
│   └── README.md                    # Tài liệu chính của dự án
│
├── 📁 app/                          # App Router của Next.js 14+
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Trang chủ
│   ├── globals.css                  # Kiểu CSS toàn cục
│   └── documents/
│       └── [documentId]/            # Dynamic route cho các tài liệu
│           └── page.tsx             # Trang chi tiết tài liệu
│
├── 📁 components/                   # Các React components
│   ├── 📄 Trang Chủ
│   │   ├── hero-section.tsx         # Phần hero
│   │   ├── features-section.tsx     # Phần tính năng
│   │   ├── calendar-section.tsx     # Phần lịch
│   │   ├── templates-section.tsx    # Phần templates
│   │   ├── workspaces-section.tsx   # Phần không gian làm việc
│   │   ├── recent-documents.tsx     # Tài liệu gần đây
│   │   ├── header.tsx               # Header
│   │   └── footer.tsx               # Footer
│   │
│   ├── 📁 layout/                   # Layout components
│   │   ├── AppLayout.tsx            # Layout chính ứng dụng
│   │   ├── Navbar.tsx               # Thanh điều hướng
│   │   └── Sidebar.tsx              # Thanh bên
│   │
│   ├── 📁 editor/                   # Editor components
│   │   ├── DocumentEditorShell.tsx    # Vỏ editor chính
│   │   ├── PaginatedEditorShell.tsx   # Editor với phân trang
│   │   ├── EditorMenuBar.tsx        # Menu bar của editor
│   │   ├── EditorToolbar.tsx        # Thanh công cụ chính
│   │   ├── EditorDynamicToolbar.tsx # Thanh công cụ động
│   │   ├── ToolbarButton.tsx        # Nút thanh công cụ
│   │   ├── ToolbarIconButton.tsx    # Nút icon thanh công cụ
│   │   ├── ToolbarDivider.tsx       # Dấu phân cách thanh công cụ
│   │   ├── ToolbarSelect.tsx        # Select thanh công cụ
│   │   ├── MarginControls.tsx       # Điều khiển lề
│   │   ├── PageRuler.tsx            # Thước trang
│   │   └── toolbars/                # Thư mục toolbars bổ sung
│   │
│   ├── 📁 comments/                 # Comment components
│   │   ├── CommentPanel.tsx         # Bảng bình luận
│   │   ├── CommentInput.tsx         # Ô nhập bình luận
│   │   ├── CommentItem.tsx          # Mục bình luận
│   │   └── FloatingCommentButton.tsx # Nút bình luận nổi
│   │
│   ├── 📁 ui/                       # UI components (shadcn/ui)
│   │   ├── accordion.tsx            # Accordion component
│   │   ├── alert.tsx                # Alert component
│   │   ├── alert-dialog.tsx         # Alert dialog component
│   │   ├── aspect-ratio.tsx         # Aspect ratio component
│   │   ├── avatar.tsx               # Avatar component
│   │   ├── badge.tsx                # Badge component
│   │   ├── breadcrumb.tsx           # Breadcrumb component
│   │   ├── button.tsx               # Button component
│   │   ├── button-group.tsx         # Button group component
│   │   ├── calendar.tsx             # Calendar component
│   │   ├── card.tsx                 # Card component
│   │   ├── carousel.tsx             # Carousel component
│   │   ├── chart.tsx                # Chart component
│   │   ├── checkbox.tsx             # Checkbox component
│   │   ├── collapsible.tsx          # Collapsible component
│   │   ├── command.tsx              # Command component
│   │   ├── context-menu.tsx         # Context menu component
│   │   ├── dialog.tsx               # Dialog component
│   │   ├── drawer.tsx               # Drawer component
│   │   ├── dropdown-menu.tsx        # Dropdown menu component
│   │   ├── empty.tsx                # Empty state component
│   │   ├── field.tsx                # Field component
│   │   ├── form.tsx                 # Form component
│   │   ├── hover-card.tsx           # Hover card component
│   │   ├── input.tsx                # Input component
│   │   ├── input-group.tsx          # Input group component
│   │   ├── input-otp.tsx            # OTP input component
│   │   ├── item.tsx                 # Item component
│   │   ├── kbd.tsx                  # Keyboard component
│   │   ├── label.tsx                # Label component
│   │   ├── menubar.tsx              # Menu bar component
│   │   ├── navigation-menu.tsx      # Navigation menu component
│   │   ├── pagination.tsx           # Pagination component
│   │   ├── popover.tsx              # Popover component
│   │   ├── progress.tsx             # Progress component
│   │   ├── radio-group.tsx          # Radio group component
│   │   ├── resizable.tsx            # Resizable component
│   │   ├── scroll-area.tsx          # Scroll area component
│   │   ├── select.tsx               # Select component
│   │   ├── separator.tsx            # Separator component
│   │   ├── sheet.tsx                # Sheet component
│   │   ├── sidebar.tsx              # Sidebar component
│   │   ├── skeleton.tsx             # Skeleton loader component
│   │   ├── slider.tsx               # Slider component
│   │   ├── sonner.tsx               # Sonner toast component
│   │   ├── spinner.tsx              # Spinner component
│   │   ├── switch.tsx               # Switch component
│   │   ├── table.tsx                # Table component
│   │   ├── tabs.tsx                 # Tabs component
│   │   ├── textarea.tsx             # Textarea component
│   │   ├── toast.tsx                # Toast component
│   │   ├── toaster.tsx              # Toaster component
│   │   ├── toggle.tsx               # Toggle component
│   │   ├── toggle-group.tsx         # Toggle group component
│   │   ├── tooltip.tsx              # Tooltip component
│   │   ├── use-mobile.tsx           # Hook phát hiện mobile
│   │   └── use-toast.ts             # Hook toast
│   │
│   └── theme-provider.tsx           # Provider cho theme
│
├── 📁 hooks/                        # Custom React hooks
│   ├── use-mobile.ts                # Hook phát hiện thiết bị mobile
│   └── use-toast.ts                 # Hook quản lý toast
│
├── 📁 lib/                          # Các hàm utility và services
│   ├── liveblocks.config.ts         # Cấu hình Liveblocks
│   ├── commentService.ts            # Service bình luận
│   └── utils.ts                     # Các hàm utility chung
│
├── 📁 types/                        # TypeScript type definitions
│   ├── comment.ts                   # Type cho bình luận
│   ├── editor-menu.ts               # Type cho menu editor
│   ├── editor-selection.ts          # Type cho selection editor
│   ├── editor-toolbar.ts            # Type cho toolbar editor
│   └── page-layout.ts               # Type cho page layout
│
├── 📁 styles/                       # Kiểu CSS
│   └── globals.css                  # CSS toàn cục
│
├── 📁 public/                       # Assets tĩnh
│   └── (hình ảnh, fonts, etc.)
│
└── 📁 frontend/                     # Thư mục frontend (có thể là phiên bản khác)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── postcss.config.mjs
    ├── components.json
    ├── next-env.d.ts
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── public/
    └── styles/
```

## Mô Tả Từng Thư Mục

### `/app`
- **Mục đích**: Chứa Next.js App Router pages và layouts
- **File chính**: 
  - `layout.tsx`: Root layout cho toàn bộ ứng dụng
  - `page.tsx`: Trang chủ
  - `documents/[documentId]/page.tsx`: Trang chi tiết tài liệu

### `/components`
- **Mục đích**: Chứa tất cả React components
- **Tổ chức**:
  - **layout**: Navigation, sidebar, layout chính
  - **editor**: Document editor và các thành phần liên quan
  - **comments**: Hệ thống bình luận
  - **ui**: Reusable UI components từ shadcn/ui

### `/hooks`
- **Mục đích**: Custom React hooks
- **Chứa**: `use-mobile.ts`, `use-toast.ts`

### `/lib`
- **Mục đích**: Services, utilities, và configurations
- **File chính**:
  - `liveblocks.config.ts`: Cấu hình real-time collaboration
  - `commentService.ts`: Logic bình luận
  - `utils.ts`: Hàm utility chung

### `/types`
- **Mục đích**: TypeScript type definitions
- **Chứa**: Các interface cho comments, editor, layouts

### `/styles`
- **Mục đích**: CSS toàn cục
- **Chứa**: `globals.css` cho styling chung

### `/public`
- **Mục đích**: Assets tĩnh (ảnh, fonts, favicons, etc.)

## Công Nghệ Sử Dụng
- **Framework**: Next.js 14+ (App Router)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: shadcn/ui
- **Real-time**: Liveblocks
- **Package Manager**: pnpm
- **Notifications**: Sonner (Toast)

## Quy Ước Đặt Tên
- **Thư mục**: lowercase với dấu gạch ngang (kebab-case)
- **Components**: PascalCase (e.g., `CommentPanel.tsx`)
- **Hooks**: `use` prefix với camelCase (e.g., `use-mobile.ts`)
- **Utilities/Services**: camelCase (e.g., `commentService.ts`)
- **Types**: camelCase hoặc PascalCase tuỳ theo sử dụng

---

**Lần cập nhật cuối**: May 3, 2026
