import { Comment } from "@/types/comment"

const STORAGE_KEY = "mock_comments_v1"

function load(): Comment[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        return JSON.parse(raw) as Comment[]
    } catch {
        return []
    }
}

function save(list: Comment[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const commentService = {
    async getComments(documentId: string) {
        // simulate delay
        await new Promise((r) => setTimeout(r, 150))
        const all = load()
        return all.filter((c) => c.documentId === documentId)
    },

    async createComment(documentId: string, data: { content: string; fromPos?: number | null; toPos?: number | null; selectedText?: string | null; user?: any }) {
        const all = load()
        const now = new Date().toISOString()
        const comment: Comment = {
            id: makeId(),
            content: data.content,
            fromPos: data.fromPos ?? null,
            toPos: data.toPos ?? null,
            selectedText: data.selectedText ?? null,
            createdAt: now,
            updatedAt: now,
            user: data.user ?? { id: "user-1", username: "Member 4" },
            documentId,
        }
        all.push(comment)
        save(all)
        return comment
    },

    async deleteComment(commentId: string) {
        const all = load()
        const remaining = all.filter((c) => c.id !== commentId)
        save(remaining)
        return true
    },
}
