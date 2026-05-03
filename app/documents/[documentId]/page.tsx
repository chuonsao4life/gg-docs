import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorShell } from "@/components/editor/DocumentEditorShell"

type Props = {
    params: Promise<{
        documentId: string
    }>
}

export default async function Page({ params }: Props) {
    const resolvedParams = await params

    return (
        <AppLayout documentId={resolvedParams.documentId} title={"Untitled document - CoWork"}>
            <DocumentEditorShell documentId={resolvedParams.documentId} />
        </AppLayout>
    )
}
