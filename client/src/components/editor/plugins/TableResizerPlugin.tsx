"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import { $getTableNodeFromLexicalNodeOrThrow, TableCellNode } from "@lexical/table";

export default function TableResizerPlugin() {
    const [editor] = useLexicalComposerContext();
    const [activeCell, setActiveCell] = useState<HTMLElement | null>(null);
    const [resizerStyles, setResizerStyles] = useState<React.CSSProperties>({ display: 'none' });
    
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    // Dò tìm vị trí chuột để hiện thanh Resizer
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging.current) return; // Không dò tìm khi đang kéo

            const target = e.target as HTMLElement;
            const cell = target.closest('td, th') as HTMLElement;

            if (cell) {
                const rect = cell.getBoundingClientRect();
                // Nếu chuột nằm sát mép phải của cột (sai số 5px)
                if (Math.abs(e.clientX - rect.right) < 5) {
                    setActiveCell(cell);
                    setResizerStyles({
                        display: 'block',
                        position: 'fixed', // Dùng fixed để đè lên mọi thứ
                        top: rect.top,
                        left: rect.right - 2, // Đặt thanh resizer ngay đường viền
                        height: rect.height,
                        width: '5px',
                        backgroundColor: '#3b82f6', // Màu xanh dương highlight
                        cursor: 'col-resize',
                        zIndex: 9999
                    });
                    return;
                }
            }
            // Ẩn thanh kéo nếu chuột đi chỗ khác
            setActiveCell(null);
            setResizerStyles({ display: 'none' });
        };

        document.addEventListener('mousemove', onMouseMove);
        return () => document.removeEventListener('mousemove', onMouseMove);
    }, []);

    // Xử lý sự kiện Kéo (Drag)
    const onMouseDown = (e: React.MouseEvent) => {
        if (!activeCell) return;
        e.preventDefault();
        
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = activeCell.getBoundingClientRect().width;

        // Khi đang kéo
        const onDrag = (dragEvent: MouseEvent) => {
            const diff = dragEvent.clientX - startX.current;
            // Giới hạn độ rộng tối thiểu là 30px để không bị bóp nghẹt
            const newWidth = Math.max(30, startWidth.current + diff); 
            activeCell.style.width = `${newWidth}px`;
            
            // Di chuyển thanh xanh dương theo chuột
            setResizerStyles(prev => ({ ...prev, left: dragEvent.clientX - 2 }));
        };

        // Khi thả chuột ra (Save vào Lexical & Đồng bộ Yjs)
        const onMouseUp = (upEvent: MouseEvent) => {
            isDragging.current = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onMouseUp);

            editor.update(() => {
                const cellNode = $getNearestNodeFromDOMNode(activeCell);
                if (cellNode instanceof TableCellNode) {
                    const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
                    const cellIndex = cellNode.getIndexWithinParent();
                    
                    // Lấy mảng kích thước hiện tại, nếu chưa có thì gán mặc định 100
                    let widths = tableNode.getColWidths();
                    if (!widths) widths = Array(tableNode.getColumnCount()).fill(100);
                    
                    const newWidths = [...widths];
                    newWidths[cellIndex] = Math.max(30, startWidth.current + (upEvent.clientX - startX.current));
                    
                    // Lệnh này sẽ kích hoạt việc cập nhật node và báo cho Yjs đồng bộ
                    tableNode.setColWidths(newWidths);
                }
            });
            setResizerStyles({ display: 'none' });
        };

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div 
            style={resizerStyles} 
            onMouseDown={onMouseDown}
            className="hover:bg-blue-600 transition-colors"
        />
    );
}