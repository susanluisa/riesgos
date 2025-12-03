import { MainHeader } from "@/components/main-header"
import { SettingsPanel } from "@/components/settings-panel"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <div className="container py-6">
          <SettingsPanel />
        </div>
      </main>
    </div>
  )
}
