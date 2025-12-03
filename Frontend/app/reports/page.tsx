import { MainHeader } from "@/components/main-header"
import { RecommendationsPanel } from "@/components/recommendations-panel"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <div className="container py-6">
          <RecommendationsPanel />
        </div>
      </main>
    </div>
  )
}
