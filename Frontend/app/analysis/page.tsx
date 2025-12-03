import { ScenariosPanel } from "@/components/scenarios-panel"
import { AIRiskAssistant } from "@/components/ai-risk-assistant"
import { RealTimePrediction } from "@/components/real-time-prediction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainHeader } from "@/components/main-header"

export default function AnalysisPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Análisis de Riesgos</h1>
          <p className="text-muted-foreground">
            Gestione escenarios de riesgo, consulte al asistente IA y realice predicciones en tiempo real
          </p>
        </div>

        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Escenarios de Riesgo</TabsTrigger>
            <TabsTrigger value="assistant">Asistente IA</TabsTrigger>
            <TabsTrigger value="prediction">Predicción en Tiempo Real</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <ScenariosPanel />
          </TabsContent>

          <TabsContent value="assistant">
            <AIRiskAssistant />
          </TabsContent>

          <TabsContent value="prediction">
            <RealTimePrediction />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
