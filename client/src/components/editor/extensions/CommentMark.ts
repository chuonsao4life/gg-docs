import { Mark, mergeAttributes } from "@tiptap/core"

export const CommentMark = Mark.create({
    name: "comment",

    addAttributes() {
        return {
            commentId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-comment-id"),
                renderHTML: (attributes) => {
                    if (!attributes.commentId) return {}
                    return {
                        "data-comment-id": attributes.commentId,
                    }
                },
            },
            isDraft: {
                default: false,
                parseHTML: (element) => element.getAttribute("data-comment-draft") === "true",
                renderHTML: (attributes) => {
                    if (!attributes.isDraft) return {}
                    return {
                        "data-comment-draft": "true",
                    }
                },
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: "span[data-comment-id]",
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        const { commentId, isDraft, ...restAttributes } = HTMLAttributes

        return [
            "span",
            mergeAttributes(restAttributes, {
                ...(commentId ? { "data-comment-id": commentId } : {}),
                ...(isDraft ? { "data-comment-draft": "true" } : {}),
                class: "comment-highlight",
            }),
            0,
        ]
    },
})
