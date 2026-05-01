'use client'

import { Editor } from '@tiptap/react'
import { Bold, Italic, Undo, Redo, ListOrdered, List } from 'lucide-react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  // Hàm helper để tạo style cho nút bấm
  const getBtnClass = (name: string) => {
    const isActive = editor.isActive(name);
    return `p-2 rounded transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' // Sáng xanh khi Active
        : 'hover:bg-gray-200 text-gray-600'  // Xám khi bình thường
    }`;
  };

  return (
    <div className="flex gap-1 p-2 border-b bg-white items-center">
      {/* Nút Bold - Kiểm tra độc lập */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-all ${
          editor.isActive('bold') 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'hover:bg-gray-200 text-gray-600'
        }`}
      >
        <Bold size={18} />
      </button>

      {/* Nút Italic - Kiểm tra độc lập */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-all ${
          editor.isActive('italic') 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'hover:bg-gray-200 text-gray-600'
        }`}
      >
        <Italic size={18} />
      </button>
      
      {/* Nút Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getBtnClass('bulletList')}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      {/* Thêm nút Ordered List vào đây */}
        <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getBtnClass('orderedList')}
            title="Ordered List"
        >
            <ListOrdered size={18} /> {/* Nhớ import ListOrdered từ lucide-react */}
        </button>
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Nút Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
      >
        <Undo size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}