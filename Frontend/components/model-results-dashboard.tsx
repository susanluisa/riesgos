"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AUCROCCurve } from "./auc-roc-curve"
import { ConfusionMatrix } from "./confusion-matrix"
import { ModelComparison } from "./model-comparison"
import { RandomForestVisualizer } from "./random-forest-visualizer"
import { BarChart3, Table, TrendingUp, Target, Activity, Download, TreesIcon as Tree } from "lucide-react"

interface ModelResultsDashboardProps {
  trainingCompleted: boolean
  results?: any
}

export function ModelResultsDashboard({ trainingCompleted, results }: ModelResultsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<"accuracy" | "f1" | "precision" | "recall" | "auc">("f1")
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")

  // Datos simulados de métricas del Random Forest
  const randomForestMetrics = {
    accuracy: 0.87,
    f1: 0.81,
    precision: 0.83,
    recall: 0.79,
    auc: 0.89,
    oobScore: 0.85,
    trainingTime: 145.3,
    modelName: "Random Forest",
    nEstimators: 100,
    maxDepth: 10,
  }

  // Datos de comparación con otras métricas
  const metricsComparison = [
    {
      name: "Exactitud",
      value: randomForestMetrics.accuracy,
      color: "#3b82f6",
      description: "Predicciones correctas del total",
    },
    {
      name: "F1 Score",
      value: randomForestMetrics.f1,
      color: "#10b981",
      description: "Media armónica de precisión y exhaustividad",
    },
    {
      name: "Precisión",
      value: randomForestMetrics.precision,
      color: "#f59e0b",
      description: "Verdaderos positivos del total de positivos predichos",
    },
    {
      name: "Exhaustividad",
      value: randomForestMetrics.recall,
      color: "#ef4444",
      description: "Verdaderos positivos del total de positivos reales",
    },
    {
      name: "AUC",
      value: randomForestMetrics.auc,
      color: "#8b5cf6",
      description: "Área bajo la curva ROC",
    },
  ]

  const renderMetricsChart = () => {
    const width = 600
    const height = 300
    const padding = 60
    const barWidth = (width - padding * 2) / metricsComparison.length / 1.5
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    return (
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          {/* Ejes */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#94a3b8" strokeWidth="1" />

          {/* Etiquetas de ejes */}
          <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#64748b">
            Métricas de Random Forest
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Valor (%)
          </text>

          {/* Marcas en el eje Y */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={height - padding - tick * plotHeight}
                x2={padding - 5}
                y2={height - padding - tick * plotHeight}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={height - padding - tick * plotHeight + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {(tick * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Barras y etiquetas */}
          {metricsComparison.map((metric, i) => {
            const x = padding + (i + 0.5) * (plotWidth / metricsComparison.length)
            const barHeight = (metric.value / 1) * plotHeight
            const y = height - padding - barHeight

            // Destacar la métrica seleccionada
            const isSelected =
              metric.name.toLowerCase().includes(selectedMetric) ||
              (selectedMetric === "f1" && metric.name === "F1 Score") ||
              (selectedMetric === "accuracy" && metric.name === "Exactitud")

            return (
              <g key={i}>
                {/* Barra */}
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={metric.color}
                  rx={2}
                  opacity={isSelected ? 1 : 0.7}
                  stroke={isSelected ? "#1f2937" : "none"}
                  strokeWidth={isSelected ? 2 : 0}
                />

                {/* Valor en la parte superior de la barra */}
                <text x={x} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  {(metric.value * 100).toFixed(1)}%
                </text>

                {/* Etiqueta del modelo */}
                <text
                  x={x}
                  y={height - padding + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  transform={`rotate(45, ${x}, ${height - padding + 15})`}
                >
                  {metric.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderMetricsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-sm font-medium">Métrica</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Porcentaje</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {metricsComparison.map((metric) => {
              const isSelected =
                metric.name.toLowerCase().includes(selectedMetric) ||
                (selectedMetric === "f1" && metric.name === "F1 Score") ||
                (selectedMetric === "accuracy" && metric.name === "Exactitud")

              const getStatus = (value: number) => {
                if (value >= 0.9) return { label: "Excelente", color: "bg-green-100 text-green-800" }
                if (value >= 0.8) return { label: "Bueno", color: "bg-blue-100 text-blue-800" }
                if (value >= 0.7) return { label: "Aceptable", color: "bg-yellow-100 text-yellow-800" }
                return { label: "Necesita mejora", color: "bg-red-100 text-red-800" }
              }

              const status = getStatus(metric.value)

              return (
                <tr key={metric.name} className={isSelected ? "bg-blue-50 border-blue-200" : ""}>
                  <td className="px-4 py-3 text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                    {metric.name}
                    {isSelected && (
                      <Badge variant="outline" className="text-xs">
                        Principal
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{metric.value.toFixed(3)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{(metric.value * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{metric.description}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={status.color}>{status.label}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderOverviewCards = () => {
    const selectedMetricData = metricsComparison.find(
      (m) =>
        m.name.toLowerCase().includes(selectedMetric) ||
        (selectedMetric === "f1" && m.name === "F1 Score") ||
        (selectedMetric === "accuracy" && m.name === "Exactitud"),
    )

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo Principal</CardTitle>
            <Tree className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{randomForestMetrics.modelName}</div>
            <p className="text-xs text-muted-foreground">
              {randomForestMetrics.nEstimators} árboles, profundidad {randomForestMetrics.maxDepth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OOB Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(randomForestMetrics.oobScore * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Validación out-of-bag</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">F1 Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(randomForestMetrics.f1 * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Métrica principal de evaluación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Entrenamiento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{randomForestMetrics.trainingTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Eficiencia del algoritmo</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trainingCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tree className="h-5 w-5" />
            Resultados del Random Forest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Complete el entrenamiento del modelo Random Forest para ver los resultados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tree className="h-5 w-5 text-green-600" />
            Random Forest - Análisis Completo de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="forest">Random Forest</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="roc">Curvas ROC/PR</TabsTrigger>
              <TabsTrigger value="confusion">Matriz Confusión</TabsTrigger>
              <TabsTrigger value="comparison">Comparación</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {renderOverviewCards()}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento Random Forest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metricsComparison.map((metric) => (
                        <div key={metric.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
                              {metric.name}
                            </span>
                            <span>{(metric.value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${metric.value * 100}%`,
                                backgroundColor: metric.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuración del Modelo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Algoritmo</div>
                          <div className="font-semibold">{randomForestMetrics.modelName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Número de Árboles</div>
                          <div className="font-semibold">{randomForestMetrics.nEstimators}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Profundidad Máxima</div>
                          <div className="font-semibold">{randomForestMetrics.maxDepth}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">OOB Score</div>
                          <div className="font-semibold">{(randomForestMetrics.oobScore * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Badge className="bg-green-100 text-green-800">Optimizado para Variables Dummy</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forest" className="space-y-4">
              <RandomForestVisualizer trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium">Métrica Principal:</label>
                    <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                      <SelectTrigger className="w-[180px] mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Exactitud</SelectItem>
                        <SelectItem value="f1">F1 Score</SelectItem>
                        <SelectItem value="precision">Precisión</SelectItem>
                        <SelectItem value="recall">Exhaustividad</SelectItem>
                        <SelectItem value="auc">AUC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Vista:</label>
                    <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="mt-1">
                      <TabsList>
                        <TabsTrigger value="chart" className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Gráfico
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex items-center gap-1">
                          <Table className="h-3.5 w-3.5" />
                          Tabla
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Métricas
                </Button>
              </div>

              {viewMode === "chart" ? renderMetricsChart() : renderMetricsTable()}
            </TabsContent>

            <TabsContent value="roc" className="space-y-4">
              <AUCROCCurve trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="confusion" className="space-y-4">
              <ConfusionMatrix trainingCompleted={trainingCompleted} />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <ModelComparison trainingCompleted={trainingCompleted} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
