export type CommentUser = {
    id: string
    username: string
    avatar?: string
}

export type DocumentComment = {
    id: string
    documentId: string
    content: string
    selectedText: string
    fromPos: number | null
    toPos: number | null
    createdAt: string
    updatedAt?: string
    user: CommentUser
}

export type Comment = DocumentComment
