import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentEditorShell } from "@/components/editor/DocumentEditorShell"

type Props = {
  params: {
    documentId: string
  }
}

export default function Page({ params }: Props) {
  const { documentId } = params

  return (
    <AppLayout documentId={documentId} title={"Untitled document - CoWork"}>
      <DocumentEditorShell documentId={documentId} />
    </AppLayout>
  )
}
