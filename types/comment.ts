export type CommentUser = {
    id: string
    username?: string
    email?: string
    avatar?: string
}

export type Comment = {
    id: string
    content: string
    fromPos?: number | null
    toPos?: number | null
    selectedText?: string | null
    createdAt: string
    updatedAt?: string
    user: CommentUser
    documentId: string
}
