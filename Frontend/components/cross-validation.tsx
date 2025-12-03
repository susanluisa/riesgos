"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CrossValidationProps {
  trainingCompleted: boolean
}

export function CrossValidation({ trainingCompleted }: CrossValidationProps) {
  const [viewType, setViewType] = useState<"fold" | "class">("fold")
  const [metric, setMetric] = useState<"accuracy" | "f1" | "precision" | "recall">("f1")

  // Datos simulados para la validación cruzada
  const crossValidationData = {
    folds: [
      { fold: 1, accuracy: 0.85, f1: 0.79, precision: 0.81, recall: 0.77 },
      { fold: 2, accuracy: 0.88, f1: 0.82, precision: 0.84, recall: 0.80 },
      { fold: 3, accuracy: 0.86, f1: 0.80, precision: 0.82, recall: 0.78 },
      { fold: 4, accuracy: 0.89, f1: 0.83, precision: 0.85, recall: 0.81 },
      { fold: 5, accuracy: 0.87, f1: 0.81, precision: 0.83, recall: 0.79 }
    ],
    classes: [
      { class: "Riesgo Bajo", accuracy: 0.91, f1: 0.88, precision: 0.90, recall: 0.86 },
      { class: "Riesgo Medio", accuracy: 0.85, f1: 0.79, precision: 0.81, recall: 0.77 },
      { class: "Riesgo Alto", accuracy: 0.86, f1: 0.80, precision: 0.82, recall: 0.78 }
    ],
    mean: { accuracy: 0.87, f1: 0.81, precision: 0.83, recall: 0.79 },
    std: { accuracy: 0.015, f1: 0.014, precision: 0.014, recall: 0.014 }
  }

  // Función para renderizar el gráfico de validación cruzada por pliegue
  const renderFoldChart = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 600
    const height = 300
    const padding = 60
    const barWidth = (width - padding * 2) / crossValidationData.folds.length / 1.5
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Obtener los valores de la métrica seleccionada
    const metricValues = crossValidationData.folds.map(fold => fold[metric])
    const maxMetricValue = Math.max(...metricValues)
    const minMetricValue = Math.min(...metricValues) * 0.9 // Para que el gráfico no empiece desde 0

    return (
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          {/* Ejes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#94a3b8" strokeWidth="1" />
          
          {/* Etiquetas de ejes */}
          <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#64748b">Pliegue (Fold)</text>
          <text x={15} y={height / 2} textAnchor="middle" fontSize="12" fill="#64748b" transform={`rotate(-90, 15, ${height / 2})`}>
            {metric === "accuracy" ? "Exactitud" : 
             metric === "f1" ? "F1 Score" : 
             metric === "precision" ? "Precisión" : "Exhaustividad"}
          </text>
          
          {/* Línea de media */}
          <line 
            x1={padding} 
            y1={height - padding - (crossValidationData.mean[metric] - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight} 
            x2={width - padding} 
            y2={height - padding - (crossValidationData.mean[metric] - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight} 
            stroke="#10b981" 
            strokeWidth="2" 
            strokeDasharray="4,4" 
          />
          
          {/* Etiqueta de media */}
          <text 
            x={width - padding - 5} 
            y={height - padding - (crossValidationData.mean[metric] - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight - 5} 
            textAnchor="end" 
            fontSize="10" 
            fill="#10b981"
          >
            Media: {(crossValidationData.mean[metric] * 100).toFixed(1)}%
          </text>
          
          {/* Marcas en el eje Y */}
          {[0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1].map((tick, i) => {
            if (tick < minMetricValue || tick > maxMetricValue) return null;
            
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={height - padding - (tick - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight} 
                  x2={padding - 5} 
                  y2={height - padding - (tick - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight} 
                  stroke="#94a3b8" 
                  strokeWidth="1" 
                />
                <text 
                  x={padding - 10} 
                  y={height - padding - (tick - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight + 4} 
                  textAnchor="end" 
                  fontSize="10" 
                  fill="#64748b"
                >
                  {(tick * 100).toFixed(0)}%
                </text>
              </g>
            )
          })}
          
          {/* Barras y etiquetas */}
          {crossValidationData.folds.map((fold, i) => {
            const x = padding + (i + 0.5) * (plotWidth / crossValidationData.folds.length)
            const barHeight = (fold[metric] - minMetricValue) / (maxMetricValue - minMetricValue) * plotHeight
            const y = height - padding - barHeight
            
            return (
              <g key={i}>
                {/* Barra */}
                <rect 
                  x={x - barWidth / 2} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill="#3b82f6" 
                  rx={2}
                />
                
                {/* Valor en la parte superior de la barra */}
                <text 
                  x={x} 
                  y={y - 5} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill="#334155"
                >
                  {(fold[metric] * 100).toFixed(1)}%
                </text>
                
                {/* Etiqueta del pliegue */}
                <text 
                  x={x} 
                  y={height - padding + 15} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#64748b"
                >
                  Fold {fold.fold}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Función para renderizar el gráfico de validación cruzada por clase
  const renderClassChart = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const width = 600
    const height = 300
    const padding = 60
    const barWidth = (width - padding * 2) / crossValidationData.classes.length / 1.5
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Obtener los valores de la métrica seleccionada
    const metricValues = crossValidationData.classes.map(cls => cls[metric])
    const maxMetricValue = Math.max(...metricValues)
    const minMetricValue = Math.min(...metricValues) * 0.9 // Para que el gráfico no empiece desde 0

    return (
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          {/* Ejes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth="1" />
          <line

\
