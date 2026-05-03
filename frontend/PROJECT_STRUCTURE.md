# Cấu Trúc Thư Mục Dự Án - Collaborative Workspace Platform

## Tổng Quan
Đây là một dự án Next.js 14+ được xây dựng với TypeScript, Tailwind CSS, và các công nghệ hiện đại khác. Dự án là một nền tảng làm việc hợp tác cho phép người dùng tạo, chỉnh sửa và quản lý tài liệu cùng với các tính năng bình luận và trò chuyện thời gian thực.

## Cấu Trúc Thư Mục Chi Tiết

```
Collaborative-Workspace-Platform/
│
└── 📁 frontend/                     # Thư mục dự án chính
    │
    ├── 📄 Các File Cấu Hình Gốc
    │   ├── package.json                 # Dependencies và scripts dự án
    │   ├── package-lock.json            # Lock file npm
    │   ├── pnpm-lock.yaml               # Lock file pnpm
    │   ├── tsconfig.json                # Cấu hình TypeScript
    │   ├── tsconfig.tsbuildinfo         # TypeScript build info
    │   ├── next.config.mjs              # Cấu hình Next.js
    │   ├── postcss.config.mjs           # Cấu hình PostCSS
    │   ├── components.json              # Cấu hình UI components (shadcn)
    │   ├── next-env.d.ts                # Kiểu TypeScript cho Next.js
    │   ├── .env.local                   # Environment variables
    │   ├── .gitignore                   # Git ignore file
    │   ├── README.md                    # Tài liệu chính của dự án
    │   └── PROJECT_STRUCTURE.md         # File cấu trúc này
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
    │   ├── 📄 Trang Chủ Components
    │   │   ├── hero-section.tsx         # Phần hero của trang chủ
    │   │   ├── features-section.tsx     # Phần tính năng
    │   │   ├── calendar-section.tsx     # Phần lịch
    │   │   ├── templates-section.tsx    # Phần templates
    │   │   ├── workspaces-section.tsx   # Phần không gian làm việc
    │   │   ├── recent-documents.tsx     # Danh sách tài liệu gần đây
    │   │   ├── header.tsx               # Header trang chủ
    │   │   ├── footer.tsx               # Footer
    │   │   ├── chat-panel.tsx           # Chat panel component
    │   │   └── theme-provider.tsx       # Provider cho theme (Dark/Light)
    │   │
    │   ├── 📁 layout/                   # Layout components
    │   │   ├── AppLayout.tsx            # Layout chính của ứng dụng
    │   │   ├── Navbar.tsx               # Thanh điều hướng trên cùng
    │   │   └── Sidebar.tsx              # Thanh bên (sidebar)
    │   │
    │   ├── 📁 editor/                   # Document Editor components
    │   │   ├── DocumentEditorShell.tsx    # Vỏ editor chính
    │   │   ├── PaginatedEditorShell.tsx   # Editor với phân trang
    │   │   ├── EditorMenuBar.tsx        # Menu bar của editor (File, Edit, View, etc.)
    │   │   ├── EditorToolbar.tsx        # Thanh công cụ chính editor
    │   │   ├── EditorDynamicToolbar.tsx # Thanh công cụ động (hiển thị tuỳ theo lựa chọn)
    │   │   ├── Toolbar.tsx              # Wrapper cho toolbars
    │   │   ├── ToolbarButton.tsx        # Nút cơ bản cho thanh công cụ
    │   │   ├── ToolbarIconButton.tsx    # Nút icon cho thanh công cụ
    │   │   ├── ToolbarDivider.tsx       # Dấu phân cách giữa các nhóm nút
    │   │   ├── ToolbarSelect.tsx        # Select dropdown cho thanh công cụ
    │   │   ├── TiptapEditor.tsx         # Integrated Tiptap editor component
    │   │   ├── MarginControls.tsx       # Điều khiển lề trang
    │   │   ├── PageRuler.tsx            # Thước trang (ruler)
    │   │   └── toolbars/                # Thư mục chứa toolbar variants
    │   │
    │   ├── 📁 comments/                 # Comment/Annotation components
    │   │   ├── CommentPanel.tsx         # Bảng bình luận chính
    │   │   ├── CommentInput.tsx         # Ô nhập bình luận
    │   │   ├── CommentItem.tsx          # Mục bình luận đơn lẻ
    │   │   └── FloatingCommentButton.tsx # Nút bình luận nổi
    │   │
    │   └── 📁 ui/                       # UI components (shadcn/ui Library)
    │       ├── 📄 Form & Input
    │       │   ├── input.tsx            # Text input component
    │       │   ├── textarea.tsx         # Textarea component
    │       │   ├── input-group.tsx      # Input group wrapper
    │       │   ├── input-otp.tsx        # OTP input component
    │       │   ├── form.tsx             # Form wrapper
    │       │   ├── field.tsx            # Form field wrapper
    │       │   ├── label.tsx            # Label component
    │       │   ├── checkbox.tsx         # Checkbox component
    │       │   ├── radio-group.tsx      # Radio group component
    │       │   ├── select.tsx           # Select dropdown
    │       │   ├── toggle.tsx           # Toggle button
    │       │   ├── toggle-group.tsx     # Toggle group
    │       │   ├── switch.tsx           # Switch toggle
    │       │   ├── slider.tsx           # Slider component
    │       │   └── kbd.tsx              # Keyboard key display
    │       │
    │       ├── 📄 Layout & Container
    │       │   ├── card.tsx             # Card container
    │       │   ├── button.tsx           # Button component
    │       │   ├── button-group.tsx     # Grouped buttons
    │       │   ├── separator.tsx        # Separator/divider
    │       │   ├── breadcrumb.tsx       # Breadcrumb navigation
    │       │   ├── pagination.tsx       # Pagination controls
    │       │   ├── scroll-area.tsx      # Scrollable area
    │       │   ├── sheet.tsx            # Sheet component
    │       │   ├── sidebar.tsx          # Sidebar component
    │       │   ├── resizable.tsx        # Resizable container
    │       │   ├── skeleton.tsx         # Loading skeleton
    │       │   ├── empty.tsx            # Empty state component
    │       │   ├── item.tsx             # Item component
    │       │   └── aspect-ratio.tsx     # Aspect ratio container
    │       │
    │       ├── 📄 Dialog & Overlay
    │       │   ├── dialog.tsx           # Dialog/modal component
    │       │   ├── drawer.tsx           # Drawer/sidebar overlay
    │       │   ├── alert.tsx            # Alert component
    │       │   ├── alert-dialog.tsx     # Alert dialog component
    │       │   ├── context-menu.tsx     # Context menu
    │       │   ├── dropdown-menu.tsx    # Dropdown menu
    │       │   ├── popover.tsx          # Popover component
    │       │   ├── hover-card.tsx       # Hover card
    │       │   ├── tooltip.tsx          # Tooltip component
    │       │   ├── menubar.tsx          # Menu bar component
    │       │   └── navigation-menu.tsx  # Navigation menu
    │       │
    │       ├── 📄 Data Display
    │       │   ├── table.tsx            # Table component
    │       │   ├── tabs.tsx             # Tabs component
    │       │   ├── accordion.tsx        # Accordion component
    │       │   ├── carousel.tsx         # Carousel component
    │       │   ├── badge.tsx            # Badge component
    │       │   ├── avatar.tsx           # Avatar component
    │       │   ├── progress.tsx         # Progress bar
    │       │   ├── spinner.tsx          # Loading spinner
    │       │   ├── calendar.tsx         # Calendar component
    │       │   └── chart.tsx            # Chart component
    │       │
    │       ├── 📄 Notifications & Feedback
    │       │   ├── toast.tsx            # Toast notification
    │       │   ├── toaster.tsx          # Toast container
    │       │   └── sonner.tsx           # Sonner toast integration
    │       │
    │       └── 📄 Utilities & Hooks
    │           ├── use-mobile.tsx       # Hook phát hiện responsive mobile
    │           ├── use-toast.ts         # Hook quản lý toast notifications
    │           └── collapsible.tsx      # Collapsible component
    │
    ├── 📁 hooks/                        # Custom React hooks
    │   ├── use-mobile.ts                # Detect mobile/responsive breakpoints
    │   └── use-toast.ts                 # Toast notification management
    │
    ├── 📁 lib/                          # Utilities, services, & configurations
    │   ├── liveblocks.config.ts         # Cấu hình Liveblocks cho real-time collaboration
    │   ├── commentService.ts            # Service xử lý bình luận
    │   └── utils.ts                     # Hàm utility chung (helpers, formatters)
    │
    ├── 📁 types/                        # TypeScript type definitions & interfaces
    │   ├── comment.ts                   # Type definitions cho bình luận
    │   ├── editor-menu.ts               # Type cho menu editor
    │   ├── editor-selection.ts          # Type cho text selection
    │   ├── editor-toolbar.ts            # Type cho toolbar state/actions
    │   └── page-layout.ts               # Type cho page layout configuration
    │
    ├── 📁 styles/                       # CSS & styling
    │   └── globals.css                  # Global CSS styles
    │
    ├── 📁 public/                       # Static assets
    │   └── (icons, images, fonts, etc.)
    │
    └── 📁 .next/                        # Next.js build output (ignored in git)
        └── (compiled files, cache)
```

## Mô Tả Chi Tiết Từng Thư Mục

### 📁 `/app` - Next.js Pages & Routes
**Mục đích**: Chứa tất cả pages và routing logic theo Next.js 14+ App Router
- `layout.tsx` - Root layout tổng quát cho toàn bộ ứng dụng
- `page.tsx` - Trang chủ (home page)
- `globals.css` - CSS toàn cục
- `documents/[documentId]/` - Dynamic route cho xem/chỉnh sửa tài liệu cụ thể

### 📁 `/components` - React Components
**Mục đích**: Chứa tất cả React components, tổ chức theo chức năng
- **`hero-section.tsx`** - Phần hero trang chủ
- **`features-section.tsx`** - Hiển thị các tính năng
- **`calendar-section.tsx`** - Widget lịch
- **`templates-section.tsx`** - Hiển thị templates
- **`workspaces-section.tsx`** - Danh sách không gian làm việc
- **`recent-documents.tsx`** - Danh sách tài liệu gần đây
- **`header.tsx`** - Header trang chủ
- **`footer.tsx`** - Footer
- **`chat-panel.tsx`** - Panel chat/conversation
- **`theme-provider.tsx`** - Provider cung cấp theme (dark/light mode)

#### 📁 `/components/layout` - Layout Components
Các component chịu trách nhiệm bố cục chính của ứng dụng
- `AppLayout.tsx` - Main layout wrapper cho tất cả pages
- `Navbar.tsx` - Thanh điều hướng trên cùng
- `Sidebar.tsx` - Sidebar navigation bên trái

#### 📁 `/components/editor` - Document Editor Components
Các component tạo nên editor tài liệu
- `DocumentEditorShell.tsx` - Container chính cho editor
- `PaginatedEditorShell.tsx` - Variant editor với phân trang
- `EditorMenuBar.tsx` - Menu bar (File, Edit, View, Insert, Format, etc.)
- `EditorToolbar.tsx` - Thanh công cụ định dạng chính
- `EditorDynamicToolbar.tsx` - Thanh công cụ động (hiện/ẩn tuỳ theo lựa chọn)
- `Toolbar.tsx` - Wrapper/container cho toolbar
- `ToolbarButton.tsx` - Component nút cơ bản
- `ToolbarIconButton.tsx` - Component nút icon
- `ToolbarDivider.tsx` - Dấu phân cách giữa nhóm nút
- `ToolbarSelect.tsx` - Select dropdown cho toolbar
- `TiptapEditor.tsx` - Integrated Tiptap rich text editor
- `MarginControls.tsx` - Điều khiển lề trang
- `PageRuler.tsx` - Thước trang (ruler)
- `toolbars/` - Thư mục chứa các toolbar variants

#### 📁 `/components/comments` - Comment System
Các component cho hệ thống bình luận
- `CommentPanel.tsx` - Panel hiển thị danh sách bình luận
- `CommentInput.tsx` - Ô input để viết bình luận mới
- `CommentItem.tsx` - Component đơn lẻ cho mỗi bình luận
- `FloatingCommentButton.tsx` - Nút nổi để thêm bình luận

#### 📁 `/components/ui` - UI Component Library (shadcn/ui)
Tập hợp các reusable UI components từ shadcn/ui, được tổ chức theo chức năng
- **Form & Input**: `input.tsx`, `textarea.tsx`, `form.tsx`, `checkbox.tsx`, `select.tsx`, v.v.
- **Buttons & Navigation**: `button.tsx`, `button-group.tsx`, `breadcrumb.tsx`, `pagination.tsx`
- **Dialogs & Overlays**: `dialog.tsx`, `drawer.tsx`, `popover.tsx`, `tooltip.tsx`
- **Data Display**: `table.tsx`, `tabs.tsx`, `accordion.tsx`, `badge.tsx`, `avatar.tsx`
- **Notifications**: `toast.tsx`, `toaster.tsx`, `sonner.tsx`, `alert.tsx`
- **Utilities**: `skeleton.tsx`, `spinner.tsx`, `empty.tsx`, `separator.tsx`

### 📁 `/hooks` - Custom React Hooks
**Mục đích**: Chứa custom hooks cho logic tái sử dụng
- `use-mobile.ts` - Hook phát hiện thiết bị/breakpoint mobile
- `use-toast.ts` - Hook quản lý toast notifications

### 📁 `/lib` - Utilities & Services
**Mục đích**: Chứa business logic, services, và helper functions
- `liveblocks.config.ts` - Cấu hình Liveblocks để real-time collaboration (concurrent editing)
- `commentService.ts` - Service xử lý các thao tác bình luận (create, update, delete)
- `utils.ts` - Các hàm utility chung (formatters, validators, helpers)

### 📁 `/types` - TypeScript Type Definitions
**Mục đích**: Chứa tất cả type definitions và interfaces
- `comment.ts` - Types cho bình luận (Comment, CommentThread, etc.)
- `editor-menu.ts` - Types cho menu editor
- `editor-selection.ts` - Types cho text selection
- `editor-toolbar.ts` - Types cho toolbar state và actions
- `page-layout.ts` - Types cho page layout configuration

### 📁 `/styles` - CSS & Styling
**Mục đích**: Chứa stylesheets toàn cục
- `globals.css` - Global CSS styles (Tailwind directives, custom utilities, etc.)

### 📁 `/public` - Static Assets
**Mục đích**: Chứa các file tĩnh (images, fonts, icons, etc.)
- Các hình ảnh, favicons, fonts, v.v.

### 📄 File Cấu Hình Gốc
- **package.json** - Dependencies, scripts, project metadata
- **tsconfig.json** - TypeScript configuration
- **next.config.mjs** - Next.js configuration (customization, plugins)
- **postcss.config.mjs** - PostCSS configuration (Tailwind, autoprefixer)
- **components.json** - shadcn/ui configuration
- **.env.local** - Environment variables (development)
- **.gitignore** - Git ignore rules

## Công Nghệ & Stack
- **Frontend Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui (Radix UI based)
- **Rich Text Editor**: Tiptap
- **Real-time Collaboration**: Liveblocks
- **Toast Notifications**: Sonner
- **Package Manager**: pnpm (npm/yarn supported)
- **Build Tool**: Next.js (Webpack)

## Quy Ước Đặt Tên
| Loại | Quy Ước | Ví Dụ |
|------|--------|-------|
| Thư mục | kebab-case | `components`, `editor-toolbar` |
| Components | PascalCase | `CommentPanel.tsx`, `EditorToolbar.tsx` |
| Hooks | use prefix + camelCase | `use-mobile.ts`, `use-toast.ts` |
| Services | camelCase | `commentService.ts`, `utils.ts` |
| Types | camelCase hoặc PascalCase | `comment.ts`, `EditorState` |
| Constants | UPPER_CASE | `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT` |

## Các Tính Năng Chính
- 📝 **Document Editor** - Rich text editor với Tiptap
- 💬 **Comment System** - Bình luận inline và threads
- 🔄 **Real-time Collaboration** - Liveblocks integration
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Dark/Light Theme** - Theme switching support
- 📅 **Calendar & Scheduling** - Integrated calendar widget
- 🔍 **Full-text Search** - Tìm kiếm tài liệu
- 🤝 **Workspace Management** - Quản lý không gian làm việc

---

**Lần cập nhật cuối**: May 3, 2026 (Updated & Verified)
