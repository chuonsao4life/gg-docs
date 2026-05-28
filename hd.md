# MIGRATION PLAN: TipTap to Lexical

**Project:** Google Docs Clone (Real-time Collaborative Editor)
**Status:** Planning Phase

## 1. Executive Summary

Chuyển đổi engine editor từ **TipTap (ProseMirror-based)** sang **Lexical (Meta-backed)** nhằm phục vụ nhu cầu tạo Pagination Layer (A4 simulation) mà không phá vỡ kiến trúc Real-time hiện có (Liveblocks + Yjs).

## 2. Infrastructure Inventory (Phase 0 Output)

_Để thực hiện migrate, cần điền thông tin vào bảng dưới sau khi khảo sát:_

| Category           | TipTap Implementation (Current) | Lexical Counterpart (Target)         | Risk Level |
| :----------------- | :------------------------------ | :----------------------------------- | :--------- |
| **Editor Shell**   | `useEditor()` hook              | `<LexicalComposer>`                  | Low        |
| **Real-time**      | `@liveblocks/yjs`               | `@lexical/yjs`                       | **High**   |
| **Command System** | `editor.chain().focus()...`     | `editor.dispatchCommand(...)`        | Medium     |
| **Data Format**    | ProseMirror JSON                | Lexical EditorState JSON             | Medium     |
| **Annotations**    | TipTap Marks/Nodes              | `MarkNode` / `DecoratorNode`         | **High**   |
| **Read-only**      | `editor.setEditable(false)`     | `readOnly` prop in `LexicalComposer` | Low        |

---

## 3. Detailed Execution Roadmap

### PHASE 0: Discovery

- **0.1 Component Map:** Xác định các file chứa `useEditor`, `EditorContent`, `BubbleMenu`.
- **0.2 Liveblocks Binding:** Ghi lại cách khởi tạo `YjsProvider` và `Awareness`.
- **0.3 Comment Anchor:** Phân tích cách lưu trữ `commentId` trong ProseMirror attributes.
- **0.4 Pagination Requirements:** Đo lường đơn vị đo (px/rem) cho chiều cao trang A4.

### PHASE 1: Parallel Build

- **Feature Flag:** `const IS_LEXICAL = process.env.NEXT_PUBLIC_USE_LEXICAL === 'true';`
- **Pagination Strategy:**
  - Sử dụng `Lexical` với `DOM` container có `overflow-y: auto`.
  - Sử dụng `CSS Grid/Flex` hoặc `absolute positioning` để chèn "Page Break Line" dựa trên `scroll position`.
  - _Lưu ý:_ Tuyệt đối không tách nhỏ editor thành nhiều `contenteditable` để tránh lỗi chọn text (selection) và focus.

### PHASE 2: Re-integration

- **2.1 CRDT Sync:** Cần map `Yjs` của Liveblocks vào `LexicalCollaborationPlugin`. Kiểm tra sự xung đột giữa `ProseMirror Schema` cũ và `Lexical JSON` mới.
- **2.2 Comment Adapter:**
  - Thay vì dùng `TipTap Mark`, sử dụng `Lexical` `MarkNode` để bao quanh text.
  - Tạo `CommentPlugin` để đăng ký các `MarkNode` này.
- **2.3 Command Bridge:** Tạo một lớp `EditorAdapter` pattern:
  ```typescript
  interface EditorAdapter {
    bold: () => void;
    insertLink: (url: string) => void;
    // ...
  }
  ```
  Giúp UI Toolbar không cần sửa code khi đổi engine.

### PHASE 3: Migration (Data Strategy)

- **Lazy Migration:** 1. Kiểm tra version trong DB/Liveblocks. 2. Nếu là `TipTap`, gọi `TipTapToLexicalConverter`. 3. Lưu lại bản mới với flag `version: 'lexical'`.
- **Yjs Binary:** Do Yjs là dạng binary, việc convert trực tiếp dữ liệu đang chạy là rất khó. **Chiến lược:** Đối với document đang mở, ưu tiên reset `Yjs Room` cho user đó nếu version không khớp.

### PHASE 4: Verification

- **Stress Test:**
  - Mở document 50+ trang (kiểm tra performance rendering của Lexical).
  - Giả lập mất kết nối mạng đột ngột (Offline mode).
  - Test copy-paste từ Word/Google Docs vào Lexical.

---

## 4. Critical Path & Risks

1. **Yjs Schema Incompatibility:** Lexical yêu cầu cấu trúc Yjs khác với ProseMirror/TipTap. Cần test kỹ phần `sync` giữa các client dùng phiên bản khác nhau.
2. **Pagination Logic:** Việc tính toán vị trí ngắt trang (page break) trong môi trường contenteditable cực kỳ phức tạp. Cần đảm bảo `Selection` không bị mất khi render thêm các page break elements.
3. **Comment Anchor Persistence:** Đảm bảo khi chèn/xóa text, `MarkNode` của Lexical bám theo đúng vị trí (Lexical xử lý cái này tốt hơn TipTap nhờ `LexicalSelection`).

## 5. Rollback Plan

- Nếu `Phase 2` thất bại (Sync lỗi quá nặng), chuyển `process.env.EDITOR` về `tiptap`.
- Giữ lại codebase cũ trong 1 branch riêng cho đến khi đạt `100% stability` trên staging.
