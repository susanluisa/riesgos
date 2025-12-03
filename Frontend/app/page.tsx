import { DashboardStats } from "@/components/dashboard-stats"
import { MLModelDashboard } from "@/components/ml-model-dashboard"
import { RealTimePrediction } from "@/components/real-time-prediction"
import { MainHeader } from "@/components/main-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Sistema de Gestión de Riesgos</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Plataforma integral para análisis predictivo y gestión de riesgos ocupacionales
            </p>
          </div>

          <DashboardStats />

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard ML</TabsTrigger>
              <TabsTrigger value="prediction">Predicción en Tiempo Real</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <MLModelDashboard />
            </TabsContent>

            <TabsContent value="prediction" className="space-y-6">
              <RealTimePrediction />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
