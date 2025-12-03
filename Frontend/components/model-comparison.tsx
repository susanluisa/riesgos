"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Download, BarChart, PieChart } from "lucide-react"

interface ModelComparisonProps {
  trainingCompleted: boolean
}

export function ModelComparison({ trainingCompleted }: ModelComparisonProps) {
  const [viewType, setViewType] = useState<"table" | "chart">("chart")
  const [metric, setMetric] = useState<"accuracy" | "f1" | "precision" | "recall" | "auc">("f1")

  // Datos simulados para la comparación de modelos
  const modelComparisonData = [
    {
      name: "Random Forest",
      metrics: {
        accuracy: 0.87,
        f1: 0.81,
        precision: 0.83,
        recall: 0.79,
        auc: 0.89,
      },
      trainingTime: 145.3,
      inferenceTime: 0.12,
      parameters: 12500,
      isBest: true,
    },
    {
      name: "Gradient Boosting",
      metrics: {
        accuracy: 0.85,
        f1: 0.8,
        precision: 0.82,
        recall: 0.78,
        auc: 0.88,
      },
      trainingTime: 210.5,
      inferenceTime: 0.15,
      parameters: 8500,
      isBest: false,
    },
    {
      name: "Neural Network",
      metrics: {
        accuracy: 0.83,
        f1: 0.78,
        precision: 0.8,
        recall: 0.76,
        auc: 0.86,
      },
      trainingTime: 320.8,
      inferenceTime: 0.18,
      parameters: 25000,
      isBest: false,
    },
    {
      name: "SVM",
      metrics: {
        accuracy: 0.81,
        f1: 0.76,
        precision: 0.79,
        recall: 0.74,
        auc: 0.84,
      },
      trainingTime: 180.2,
      inferenceTime: 0.22,
      parameters: 5000,
      isBest: false,
    },
    {
      name: "Logistic Regression",
      metrics: {
        accuracy: 0.78,
        f1: 0.73,
        precision: 0.75,
        recall: 0.71,
        auc: 0.81,
      },
      trainingTime: 95.6,
      inferenceTime: 0.08,
      parameters: 120,
      isBest: false,
    },
  ]

  // Función para renderizar la tabla de comparación
  const renderComparisonTable = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-sm font-medium">Modelo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Exactitud</th>
              <th className="px-4 py-3 text-left text-sm font-medium">F1 Score</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Precisión</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Exhaustividad</th>
              <th className="px-4 py-3 text-left text-sm font-medium">AUC</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tiempo (s)</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Parámetros</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelComparisonData.map((model) => (
              <tr key={model.name} className={model.isBest ? "bg-green-50" : ""}>
                <td className="px-4 py-3 text-sm font-medium">
                  {model.name}
                  {model.isBest && <Badge className="ml-2 bg-green-100 text-green-800">Mejor</Badge>}
                </td>
                <td className="px-4 py-3 text-sm">{(model.metrics.accuracy * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">{(model.metrics.f1 * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">{(model.metrics.precision * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">{(model.metrics.recall * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">{(model.metrics.auc * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">{model.trainingTime.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm">{model.parameters.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Función para renderizar el gráfico de comparación
  const renderComparisonChart = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 600
    const height = 300
    const padding = 60
    const barWidth = (width - padding * 2) / modelComparisonData.length / 1.5
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Obtener los valores de la métrica seleccionada
    const metricValues = modelComparisonData.map((model) => model.metrics[metric])
    const maxMetricValue = Math.max(...metricValues)

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
            Modelo
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            {metric === "accuracy"
              ? "Exactitud"
              : metric === "f1"
                ? "F1 Score"
                : metric === "precision"
                  ? "Precisión"
                  : metric === "recall"
                    ? "Exhaustividad"
                    : "AUC"}
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
          {modelComparisonData.map((model, i) => {
            const x = padding + (i + 0.5) * (plotWidth / modelComparisonData.length)
            const barHeight = (model.metrics[metric] / 1) * plotHeight
            const y = height - padding - barHeight

            // Color según si es el mejor modelo
            const barColor = model.isBest ? "#10b981" : "#3b82f6"

            return (
              <g key={i}>
                {/* Barra */}
                <rect x={x - barWidth / 2} y={y} width={barWidth} height={barHeight} fill={barColor} rx={2} />

                {/* Valor en la parte superior de la barra */}
                <text x={x} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  {(model.metrics[metric] * 100).toFixed(1)}%
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
                  {model.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <Tabs value={viewType} onValueChange={(value: "table" | "chart") => setViewType(value)}>
            <TabsList>
              <TabsTrigger value="chart" className="flex items-center gap-1">
                <BarChart className="h-3.5 w-3.5" />
                <span>Gráfico</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <PieChart className="h-3.5 w-3.5" />
                <span>Tabla</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewType === "chart" && (
          <div className="flex items-center gap-2">
            <Select
              value={metric}
              onValueChange={(value: "accuracy" | "f1" | "precision" | "recall" | "auc") => setMetric(value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Seleccionar métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accuracy">Exactitud</SelectItem>
                <SelectItem value="f1">F1 Score</SelectItem>
                <SelectItem value="precision">Precisión</SelectItem>
                <SelectItem value="recall">Exhaustividad</SelectItem>
                <SelectItem value="auc">AUC</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {viewType === "table" ? renderComparisonTable() : renderComparisonChart()}

      <div className="bg-slate-50 p-4 rounded-md border text-sm">
        <h4 className="font-medium mb-2 flex items-center gap-1">
          <Info className="h-4 w-4 text-blue-600" />
          Análisis Comparativo
        </h4>
        <div className="space-y-2">
          <p>
            El modelo <span className="font-medium">Random Forest</span> muestra el mejor rendimiento general con un F1
            Score de 81% y AUC de 89%, superando a los demás algoritmos en todas las métricas.
          </p>
          <p>
            Aunque el <span className="font-medium">Gradient Boosting</span> tiene un rendimiento similar (F1 Score de
            80%), requiere un 45% más de tiempo de entrenamiento.
          </p>
          <p>
            La <span className="font-medium">Regresión Logística</span> es el modelo más rápido y ligero, pero con un
            rendimiento significativamente inferior (F1 Score de 73%).
          </p>
          <p className="font-medium">
            Recomendación: Utilizar el modelo Random Forest para la predicción de riesgos ocupacionales, ya que ofrece
            el mejor equilibrio entre rendimiento y eficiencia.
          </p>
        </div>
      </div>
    </div>
  )
}
