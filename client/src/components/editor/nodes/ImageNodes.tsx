import { DecoratorNode, NodeKey, SerializedLexicalNode } from 'lexical';
import React from 'react';

export type SerializedImageNode = SerializedLexicalNode & { src: string };

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;

  static getType(): string { return 'image'; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__key); }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  // 2 hàm này đặc biệt quan trọng để ảnh không bị mất khi load lại trang (Yjs Sync)
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(serializedNode.src);
  }
  exportJSON(): SerializedImageNode {
    return { ...super.exportJSON(), type: 'image', src: this.__src, version: 1 };
  }

  createDOM(): HTMLElement { return document.createElement('span'); }
  updateDOM(): false { return false; }

  decorate(): React.ReactNode {
    return (
      <img 
        src={this.__src} 
        alt="Editor Image" 
        className="max-w-full h-auto rounded border border-gray-200 shadow-sm my-2" 
      />
    );
  }
}

export function $createImageNode(src: string): ImageNode {
  return new ImageNode(src);
}