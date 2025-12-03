import { MainHeader } from "@/components/main-header"
import { RealTimePrediction } from "@/components/real-time-prediction"

export default function PredictionPage() {
  return (
    <>
      <MainHeader />
      <main className="container mx-auto py-6 space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Predicción de Riesgos en Tiempo Real</h1>
          <p className="text-muted-foreground">
            Analice y prediga riesgos ocupacionales basados en datos en tiempo real de sensores y condiciones de trabajo
          </p>
        </div>

        <RealTimePrediction />
      </main>
    </>
  )
}
