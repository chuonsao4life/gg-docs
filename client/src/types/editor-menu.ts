export type EditorMenuKey =
    | "file"
    | "edit"
    | "view"
    | "insert"
    | "format"
    | "tools"
    | "extensions"
    | "help"

export const EDITOR_MENUS = [
    { key: "file", label: "Tệp" },
    { key: "edit", label: "Chỉnh sửa" },
    { key: "view", label: "Xem" },
    { key: "insert", label: "Chèn" },
    { key: "format", label: "Định dạng" },
    { key: "tools", label: "Công cụ" },
    { key: "extensions", label: "Tiện ích" },
    { key: "help", label: "Trợ giúp" },
] as const
