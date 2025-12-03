"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AUCROCCurve } from "@/components/auc-roc-curve"
import { ConfusionMatrix } from "@/components/confusion-matrix"
import { ModelComparison } from "@/components/model-comparison"
import { CrossValidation } from "@/components/cross-validation"
import { HyperparameterTuning } from "@/components/hyperparameter-tuning"
import { BarChart3, LineChart, GitCompare, Layers, Sliders } from "lucide-react"

interface ModelMetricsProps {
  trainingCompleted: boolean
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    auc: number
    confusionMatrix: {
      truePositive: number
      falsePositive: number
      trueNegative: number
      falseNegative: number
    }
  }
}

export function ModelMetrics({ trainingCompleted, metrics }: ModelMetricsProps) {
  const [activeTab, setActiveTab] = useState("general")

  // The comment "// Mock data..." can now be removed because the data is coming from props.
  // The component that USES ModelMetrics will now be responsible for fetching the data.

  // Configuration array for metrics
  const metricCards = [
    {
      title: "Accuracy",
      value: metrics.accuracy,
      description: "Proporción de predicciones correctas sobre el total",
      colorClasses: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    {
      title: "F1-Score",
      value: metrics.f1Score,
      description: "Media armónica de precisión y exhaustividad",
      colorClasses: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    {
      title: "Precision",
      value: metrics.precision,
      description: "Proporción de positivos correctamente identificados",
      colorClasses: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
    {
      title: "Recall",
      value: metrics.recall,
      description: "Proporción de positivos reales identificados correctamente",
      colorClasses: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
  ]

  const renderMetricCard = (title: string, value: number, description: string, colorClasses: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {trainingCompleted ? (
          <>
            <div className="text-3xl font-bold">{(value * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            <Badge className={`mt-3 ${colorClasses}`}>{getMetricRating(value)}</Badge>
          </>
        ) : (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </>
        )}
      </CardContent>
    </Card>
  )

  const getMetricRating = (value: number) => {
    if (value >= 0.9) return "Excelente"
    if (value >= 0.8) return "Bueno"
    if (value >= 0.7) return "Aceptable"
    if (value >= 0.6) return "Regular"
    return "Necesita mejora"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas del Modelo</CardTitle>
          <CardDescription>Evaluación del rendimiento del modelo de predicción de riesgos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="curves" className="flex items-center gap-1">
                <LineChart className="h-3.5 w-3.5" />
                <span>Curvas ROC/PR</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                <span>Matriz de Confusión</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1">
                <GitCompare className="h-3.5 w-3.5" />
                <span>Comparación</span>
              </TabsTrigger>
              <TabsTrigger value="tuning" className="flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" />
                <span>Ajuste</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((metric) =>
                  renderMetricCard(
                    metric.title,
                    metric.value,
                    metric.description,
                    metric.colorClasses,
                  ),
                )}
              </div>

              <div className="mt-6">
                <CrossValidation trainingCompleted={trainingCompleted} />
              </div>
            </TabsContent>

            <TabsContent value="curves">
              <AUCROCCurve trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="matrix">
              <ConfusionMatrix trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="comparison">
              <ModelComparison trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="tuning">
              <HyperparameterTuning trainingCompleted={trainingCompleted} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
