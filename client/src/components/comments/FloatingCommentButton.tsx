"use client"

import { MessageSquare } from "lucide-react"
import { useEffect, useState, useRef } from "react"

type FloatingCommentButtonProps = {
    visible: boolean
    onClick: () => void
}

export function FloatingCommentButton({ visible, onClick }: FloatingCommentButtonProps) {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (visible) {
            const updatePosition = () => {
                const selection = window.getSelection()
                if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    const range = selection.getRangeAt(0)
                    const rect = range.getBoundingClientRect()
                    const parent = buttonRef.current?.parentElement
                    
                    if (parent) {
                        const parentRect = parent.getBoundingClientRect()
                        
                        let top = rect.top - parentRect.top
                        
                        // Đặt cách chữ cuối cùng được bôi đen khoảng 1cm (~40px)
                        // Bỏ giới hạn tràn viền để nút có thể nổi lọt thỏm ra ngoài lề giấy
                        let left = rect.right - parentRect.left + 40

                        // Ngăn nút bấm bị chui tọt lên trên hoặc tràn sang trái nếu bôi đen lỗi
                        top = Math.max(0, top)
                        left = Math.max(0, left)

                        setPosition({ top, left })
                    }
                }
            }
            
            // Tính toán sau khi DOM render nút hiển thị
            const timer = setTimeout(updatePosition, 10)
            
            // Cập nhật lại khi kéo cuộn
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', updatePosition, true)
            
            return () => {
                clearTimeout(timer)
                window.removeEventListener('resize', updatePosition)
                window.removeEventListener('scroll', updatePosition, true)
            }
        } else {
            setPosition(null)
        }
    }, [visible])

    if (!visible) return null

    return (
        <button
            ref={buttonRef}
            type="button"
            data-floating-comment-button
            aria-label="Add comment"
            title="Add comment"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            style={position ? { top: `${position.top}px`, left: `${position.left}px`, right: 'auto' } : undefined}
            className={`absolute z-10 inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md border bg-white px-3 text-sm shadow-sm transition hover:bg-gray-50 ${!position ? 'right-4 top-4' : ''}`}
        >
            <MessageSquare className="h-4 w-4" />
            Thêm bình luận
        </button>
    )
}
