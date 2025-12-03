"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, PieChart, Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface FeatureImportanceProps {
  trainingCompleted: boolean
}

export function FeatureImportance({ trainingCompleted }: FeatureImportanceProps) {
  const [viewType, setViewType] = useState<"bar" | "pie">("bar")
  const [featureCount, setFeatureCount] = useState<string>("all")

  // Mock data - in a real app, this would come from your API
  const features = [
    { name: "Tipo de actividad", importance: 0.23, category: "Operacional" },
    { name: "Experiencia del trabajador", importance: 0.18, category: "Personal" },
    { name: "Equipos de protección", importance: 0.15, category: "Seguridad" },
    { name: "Condiciones ambientales", importance: 0.12, category: "Ambiental" },
    { name: "Horas de trabajo", importance: 0.09, category: "Operacional" },
    { name: "Capacitación recibida", importance: 0.08, category: "Personal" },
    { name: "Historial de incidentes", importance: 0.07, category: "Histórico" },
    { name: "Edad del trabajador", importance: 0.05, category: "Personal" },
    { name: "Ubicación geográfica", importance: 0.03, category: "Ambiental" },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Operacional":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Personal":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Seguridad":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Ambiental":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Histórico":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Filtrar características según el conteo seleccionado
  const filteredFeatures = featureCount === "all" ? features : features.slice(0, Number.parseInt(featureCount))

  // Renderizar gráfico de barras
  const renderBarChart = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 600
    const height = 400
    const padding = 60
    const barHeight = 25
    const gap = 15
    const plotWidth = width - padding * 2

    // Ordenar características por importancia
    const sortedFeatures = [...filteredFeatures].sort((a, b) => b.importance - a.importance)

    return (
      <div className="relative">
        <svg
          width={width}
          height={Math.max(300, sortedFeatures.length * (barHeight + gap) + padding * 2)}
          viewBox={`0 0 ${width} ${Math.max(300, sortedFeatures.length * (barHeight + gap) + padding * 2)}`}
          className="mx-auto"
        >
          {/* Eje Y (nombres de características) */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + sortedFeatures.length * (barHeight + gap) - gap}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Eje X (importancia) */}
          <line
            x1={padding}
            y1={padding + sortedFeatures.length * (barHeight + gap) - gap}
            x2={width - padding}
            y2={padding + sortedFeatures.length * (barHeight + gap) - gap}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Etiqueta del eje X */}
          <text
            x={width / 2}
            y={padding + sortedFeatures.length * (barHeight + gap) + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
          >
            Importancia Relativa
          </text>

          {/* Marcas en el eje X */}
          {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((tick, i) => (
            <g key={i}>
              <line
                x1={padding + (tick * plotWidth) / 0.25}
                y1={padding + sortedFeatures.length * (barHeight + gap) - gap}
                x2={padding + (tick * plotWidth) / 0.25}
                y2={padding + sortedFeatures.length * (barHeight + gap) - gap + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={padding + (tick * plotWidth) / 0.25}
                y={padding + sortedFeatures.length * (barHeight + gap) - gap + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {(tick * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Barras y etiquetas */}
          {sortedFeatures.map((feature, i) => {
            const y = padding + i * (barHeight + gap)
            const barWidth = (feature.importance * plotWidth) / 0.25

            // Color según categoría
            let barColor
            switch (feature.category) {
              case "Operacional":
                barColor = "#3b82f6"
                break
              case "Personal":
                barColor = "#10b981"
                break
              case "Seguridad":
                barColor = "#ef4444"
                break
              case "Ambiental":
                barColor = "#f59e0b"
                break
              case "Histórico":
                barColor = "#8b5cf6"
                break
              default:
                barColor = "#6b7280"
            }

            return (
              <g key={i}>
                {/* Nombre de la característica */}
                <text
                  x={padding - 10}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#334155"
                  fontWeight={i < 3 ? "bold" : "normal"}
                >
                  {feature.name}
                </text>

                {/* Barra */}
                <rect x={padding} y={y} width={barWidth} height={barHeight} fill={barColor} rx={4} opacity={0.8} />

                {/* Valor de importancia */}
                <text
                  x={padding + barWidth + 5}
                  y={y + barHeight / 2 + 4}
                  fontSize="11"
                  fill="#334155"
                  fontWeight="bold"
                >
                  {(feature.importance * 100).toFixed(1)}%
                </text>

                {/* Categoría */}
                <text x={padding + barWidth + 50} y={y + barHeight / 2 + 4} fontSize="10" fill="#64748b">
                  {feature.category}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  // Renderizar gráfico circular
  const renderPieChart = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 600
    const height = 400
    const radius = 150
    const centerX = width / 2
    const centerY = height / 2

    // Agrupar por categoría
    const categoryData: Record<string, number> = {}
    features.forEach((feature) => {
      if (categoryData[feature.category]) {
        categoryData[feature.category] += feature.importance
      } else {
        categoryData[feature.category] = feature.importance
      }
    })

    // Convertir a array y ordenar
    const categories = Object.entries(categoryData)
      .map(([category, importance]) => ({ category, importance }))
      .sort((a, b) => b.importance - a.importance)

    // Colores para las categorías
    const categoryColors: Record<string, string> = {
      Operacional: "#3b82f6",
      Personal: "#10b981",
      Seguridad: "#ef4444",
      Ambiental: "#f59e0b",
      Histórico: "#8b5cf6",
    }

    // Calcular ángulos para el gráfico circular
    let startAngle = 0
    const total = categories.reduce((sum, item) => sum + item.importance, 0)

    const pieSegments = categories.map((item) => {
      const angle = (item.importance / total) * 2 * Math.PI
      const endAngle = startAngle + angle

      // Calcular puntos para el arco
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)

      // Determinar si el arco es mayor a 180 grados
      const largeArcFlag = angle > Math.PI ? 1 : 0

      // Crear path para el segmento
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      // Calcular posición para la etiqueta
      const labelAngle = startAngle + angle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(labelAngle)
      const labelY = centerY + labelRadius * Math.sin(labelAngle)

      // Calcular posición para la línea
      const lineEndRadius = radius * 1.1
      const lineEndX = centerX + lineEndRadius * Math.cos(labelAngle)
      const lineEndY = centerY + lineEndRadius * Math.sin(labelAngle)

      // Calcular posición para el texto
      const textRadius = radius * 1.3
      const textX = centerX + textRadius * Math.cos(labelAngle)
      const textY = centerY + textRadius * Math.sin(labelAngle)
      const textAnchor = labelAngle > Math.PI / 2 && labelAngle < (3 * Math.PI) / 2 ? "end" : "start"

      const segment = {
        path,
        color: categoryColors[item.category] || "#6b7280",
        labelX,
        labelY,
        lineEndX,
        lineEndY,
        textX,
        textY,
        textAnchor,
        category: item.category,
        importance: item.importance,
        percentage: (item.importance / total) * 100,
      }

      startAngle = endAngle
      return segment
    })

    return (
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          {/* Segmentos del gráfico circular */}
          {pieSegments.map((segment, i) => (
            <g key={i}>
              <path d={segment.path} fill={segment.color} stroke="white" strokeWidth="2" opacity={0.8} />

              {/* Línea hacia la etiqueta */}
              <line
                x1={segment.labelX}
                y1={segment.labelY}
                x2={segment.lineEndX}
                y2={segment.lineEndY}
                stroke="#94a3b8"
                strokeWidth="1"
              />

              {/* Texto de la categoría */}
              <text
                x={segment.textX}
                y={segment.textY}
                textAnchor={segment.textAnchor}
                fontSize="12"
                fontWeight="bold"
                fill="#334155"
              >
                {segment.category} ({segment.percentage.toFixed(1)}%)
              </text>
            </g>
          ))}

          {/* Círculo central (opcional, para un efecto de dona) */}
          <circle cx={centerX} cy={centerY} r={radius * 0.4} fill="white" stroke="#e2e8f0" strokeWidth="1" />

          {/* Texto central */}
          <text x={centerX} y={centerY - 10} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">
            Importancia por
          </text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">
            Categoría
          </text>
        </svg>

        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importancia de Características</CardTitle>
        <CardDescription>Análisis de las variables más influyentes en la predicción de riesgos</CardDescription>
      </CardHeader>
      <CardContent>
        {trainingCompleted ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <Tabs value={viewType} onValueChange={(value: "bar" | "pie") => setViewType(value)}>
                <TabsList>
                  <TabsTrigger value="bar" className="flex items-center gap-1">
                    <BarChart className="h-3.5 w-3.5" />
                    <span>Barras</span>
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center gap-1">
                    <PieChart className="h-3.5 w-3.5" />
                    <span>Circular</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {viewType === "bar" && (
                <div className="flex items-center gap-2">
                  <Select value={featureCount} onValueChange={setFeatureCount}>
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Número de características" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las características</SelectItem>
                      <SelectItem value="5">Top 5 características</SelectItem>
                      <SelectItem value="3">Top 3 características</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {viewType === "bar" ? renderBarChart() : renderPieChart()}

            <div className="bg-muted/50 p-4 rounded-md mt-6">
              <h4 className="font-medium mb-2">Interpretación</h4>
              <p className="text-sm text-muted-foreground">
                Las características con mayor importancia tienen un impacto más significativo en las predicciones del
                modelo. El "Tipo de actividad" y la "Experiencia del trabajador" son los factores más determinantes para
                la predicción de riesgos ocupacionales, lo que sugiere que las estrategias de mitigación deberían
                enfocarse principalmente en estos aspectos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-medium mb-2">Importancia por Categoría</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operacional</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Personal</span>
                    <span className="text-sm font-medium">31%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seguridad</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ambiental</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Histórico</span>
                    <span className="text-sm font-medium">7%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recomendaciones</h4>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li>Priorizar la evaluación del tipo de actividad en las evaluaciones de riesgo</li>
                  <li>Considerar la experiencia del trabajador al asignar tareas</li>
                  <li>Reforzar el uso adecuado de equipos de protección</li>
                  <li>Monitorear las condiciones ambientales de trabajo</li>
                  <li>Revisar las políticas de horas de trabajo y descanso</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
