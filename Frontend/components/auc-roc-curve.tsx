"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface AUCROCCurveProps {
  trainingCompleted: boolean
}

export function AUCROCCurve({ trainingCompleted }: AUCROCCurveProps) {
  const [curveType, setCurveType] = useState<"roc" | "pr">("roc")
  const [selectedClass, setSelectedClass] = useState<string>("all")

  // Datos simulados para la curva ROC
  const rocCurveData = {
    auc: 0.89,
    data: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.02, tpr: 0.18 },
      { fpr: 0.05, tpr: 0.42 },
      { fpr: 0.1, tpr: 0.65 },
      { fpr: 0.2, tpr: 0.78 },
      { fpr: 0.3, tpr: 0.86 },
      { fpr: 0.4, tpr: 0.91 },
      { fpr: 0.5, tpr: 0.94 },
      { fpr: 0.6, tpr: 0.96 },
      { fpr: 0.7, tpr: 0.97 },
      { fpr: 0.8, tpr: 0.98 },
      { fpr: 0.9, tpr: 0.99 },
      { fpr: 1, tpr: 1 },
    ],
  }

  // Datos simulados para la curva PR
  const prCurveData = {
    auc: 0.83,
    data: [
      { recall: 0, precision: 1 },
      { recall: 0.1, precision: 0.98 },
      { recall: 0.2, precision: 0.95 },
      { recall: 0.3, precision: 0.92 },
      { recall: 0.4, precision: 0.88 },
      { recall: 0.5, precision: 0.82 },
      { recall: 0.6, precision: 0.75 },
      { recall: 0.7, precision: 0.68 },
      { recall: 0.8, precision: 0.58 },
      { recall: 0.9, precision: 0.45 },
      { recall: 1, precision: 0.35 },
    ],
  }

  // Función para renderizar la curva ROC
  const renderROCCurve = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 500
    const height = 300
    const padding = 40
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Generar puntos para la curva ROC
    const points = rocCurveData.data
      .map((point) => {
        const x = padding + point.fpr * plotWidth
        const y = height - padding - point.tpr * plotHeight
        return `${x},${y}`
      })
      .join(" ")

    // Generar puntos para la línea diagonal (baseline)
    const diagonalPoints = `${padding},${height - padding} ${padding + plotWidth},${padding}`

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
            Tasa de Falsos Positivos (FPR)
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Tasa de Verdaderos Positivos (TPR)
          </text>

          {/* Marcas en los ejes */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick, i) => (
            <g key={i}>
              <line
                x1={padding + tick * plotWidth}
                y1={height - padding}
                x2={padding + tick * plotWidth}
                y2={height - padding + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={padding + tick * plotWidth}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {tick}
              </text>

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
                {tick}
              </text>
            </g>
          ))}

          {/* Línea diagonal (baseline) */}
          <polyline points={diagonalPoints} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Curva ROC */}
          <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Área bajo la curva */}
          <path
            d={`M ${padding},${height - padding} ${points} L ${padding + plotWidth},${height - padding} Z`}
            fill="#3b82f680"
            opacity="0.2"
          />

          {/* Etiqueta AUC */}
          <rect
            x={padding + 10}
            y={height - padding - 60}
            width={100}
            height={25}
            rx={4}
            fill="white"
            stroke="#e2e8f0"
          />
          <text
            x={padding + 60}
            y={height - padding - 45}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#1e40af"
          >
            AUC = {rocCurveData.auc.toFixed(3)}
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

  // Función para renderizar la curva PR
  const renderPRCurve = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 500
    const height = 300
    const padding = 40
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Generar puntos para la curva PR
    const points = prCurveData.data
      .map((point) => {
        const x = padding + point.recall * plotWidth
        const y = height - padding - point.precision * plotHeight
        return `${x},${y}`
      })
      .join(" ")

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
            Exhaustividad (Recall)
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Precisión (Precision)
          </text>

          {/* Marcas en los ejes */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick, i) => (
            <g key={i}>
              <line
                x1={padding + tick * plotWidth}
                y1={height - padding}
                x2={padding + tick * plotWidth}
                y2={height - padding + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={padding + tick * plotWidth}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {tick}
              </text>

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
                {tick}
              </text>
            </g>
          ))}

          {/* Curva PR */}
          <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Área bajo la curva */}
          <path
            d={`M ${padding},${height - padding} ${points} L ${padding + plotWidth},${height - padding} Z`}
            fill="#10b98180"
            opacity="0.2"
          />

          {/* Etiqueta AUC */}
          <rect
            x={padding + 10}
            y={height - padding - 60}
            width={100}
            height={25}
            rx={4}
            fill="white"
            stroke="#e2e8f0"
          />
          <text
            x={padding + 60}
            y={height - padding - 45}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#047857"
          >
            AUC = {prCurveData.auc.toFixed(3)}
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <Tabs value={curveType} onValueChange={(value: "roc" | "pr") => setCurveType(value)}>
            <TabsList>
              <TabsTrigger value="roc">Curva ROC</TabsTrigger>
              <TabsTrigger value="pr">Curva PR</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Información</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Seleccionar clase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las clases (macro)</SelectItem>
              <SelectItem value="high">Riesgo Alto</SelectItem>
              <SelectItem value="medium">Riesgo Medio</SelectItem>
              <SelectItem value="low">Riesgo Bajo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {curveType === "roc" ? renderROCCurve() : renderPRCurve()}

      <div className="bg-slate-50 p-4 rounded-md border text-sm">
        <h4 className="font-medium mb-2 flex items-center gap-1">
          <Info className="h-4 w-4 text-blue-600" />
          Interpretación
        </h4>
        {curveType === "roc" ? (
          <div className="space-y-2">
            <p>
              La curva ROC (Receiver Operating Characteristic) muestra la relación entre la tasa de verdaderos positivos
              (sensibilidad) y la tasa de falsos positivos (1-especificidad) para diferentes umbrales de clasificación.
            </p>
            <p>
              Un modelo perfecto tendría un AUC (Área Bajo la Curva) de 1.0, mientras que un modelo aleatorio tendría un
              AUC de 0.5 (línea diagonal).
            </p>
            <p className="font-medium">
              El AUC actual de {rocCurveData.auc.toFixed(3)} indica un excelente poder discriminativo del modelo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              La curva Precision-Recall (PR) muestra la relación entre la precisión (valor predictivo positivo) y la
              exhaustividad (sensibilidad) para diferentes umbrales de clasificación.
            </p>
            <p>
              Es especialmente útil cuando las clases están desequilibradas, ya que no tiene en cuenta los verdaderos
              negativos.
            </p>
            <p className="font-medium">
              El AUC actual de {prCurveData.auc.toFixed(3)} indica un buen equilibrio entre precisión y exhaustividad.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
