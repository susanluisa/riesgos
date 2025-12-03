import { MainHeader } from "@/components/main-header"
import { DocumentsPanel } from "@/components/documents-panel"

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <div className="container py-6">
          <DocumentsPanel />
        </div>
      </main>
    </div>
  )
}
