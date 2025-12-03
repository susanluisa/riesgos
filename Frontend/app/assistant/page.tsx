import { MainHeader } from "@/components/main-header"
import { AIRiskAssistant } from "@/components/ai-risk-assistant"

export default function AssistantPage() {
  return (
    <>
      <MainHeader />
      <main className="container mx-auto py-6 space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Asistente IA de Riesgos Ocupacionales</h1>
          <p className="text-muted-foreground">
            Consulte información sobre normativas, procedimientos y escenarios de riesgo con nuestro asistente
            inteligente
          </p>
        </div>

        <AIRiskAssistant />
      </main>
    </>
  )
}
