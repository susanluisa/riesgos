"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { TrainingResult } from "@/lib/jobs"

interface ModelMetricsProps {
  metrics: TrainingResult
}

export function ModelMetrics({ metrics }: ModelMetricsProps) {
  const getMetricColor = (value: number) => {
    if (value >= 0.9) return "bg-green-100 text-green-800"
    if (value >= 0.8) return "bg-blue-100 text-blue-800"
    if (value >= 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getMetricLabel = (value: number) => {
    if (value >= 0.9) return "Excelente"
    if (value >= 0.8) return "Bueno"
    if (value >= 0.7) return "Aceptable"
    return "Necesita mejora"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas del Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Precisión</span>
                <Badge className={getMetricColor(metrics.accuracy)}>{getMetricLabel(metrics.accuracy)}</Badge>
              </div>
              <div className="text-2xl font-bold">{(metrics.accuracy * 100).toFixed(1)}%</div>
              <Progress value={metrics.accuracy * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">F1-Score</span>
                <Badge className={getMetricColor(metrics.f1Score)}>{getMetricLabel(metrics.f1Score)}</Badge>
              </div>
              <div className="text-2xl font-bold">{(metrics.f1Score * 100).toFixed(1)}%</div>
              <Progress value={metrics.f1Score * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Precisión</span>
                <Badge className={getMetricColor(metrics.precision)}>{getMetricLabel(metrics.precision)}</Badge>
              </div>
              <div className="text-2xl font-bold">{(metrics.precision * 100).toFixed(1)}%</div>
              <Progress value={metrics.precision * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Exhaustividad</span>
                <Badge className={getMetricColor(metrics.recall)}>{getMetricLabel(metrics.recall)}</Badge>
              </div>
              <div className="text-2xl font-bold">{(metrics.recall * 100).toFixed(1)}%</div>
              <Progress value={metrics.recall * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Confusión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-700">{metrics.confusionMatrix.truePositive}</div>
                <div className="text-sm text-green-600">Verdaderos Positivos</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-700">{metrics.confusionMatrix.falsePositive}</div>
                <div className="text-sm text-red-600">Falsos Positivos</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-700">{metrics.confusionMatrix.falseNegative}</div>
                <div className="text-sm text-red-600">Falsos Negativos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-700">{metrics.confusionMatrix.trueNegative}</div>
                <div className="text-sm text-green-600">Verdaderos Negativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importancia de Características</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.featureImportance)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([feature, importance]) => (
                  <div key={feature} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{feature}</span>
                      <span>{(importance * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={importance * 100} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tiempo de Entrenamiento</div>
              <div className="text-lg font-semibold">{metrics.trainingTime.toFixed(1)}s</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Versión del Modelo</div>
              <div className="text-lg font-semibold">{metrics.modelVersion}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fecha de Creación</div>
              <div className="text-lg font-semibold">{new Date(metrics.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
