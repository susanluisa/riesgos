"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Download } from "lucide-react"

interface ConfusionMatrixProps {
  trainingCompleted: boolean
}

export function ConfusionMatrix({ trainingCompleted }: ConfusionMatrixProps) {
  const [normalization, setNormalization] = useState<"count" | "percent">("count")
  const [colorScheme, setColorScheme] = useState<"blue" | "green" | "red" | "purple">("blue")

  // Datos simulados para la matriz de confusión
  const confusionMatrixData = {
    labels: ["Riesgo Bajo", "Riesgo Medio", "Riesgo Alto"],
    matrix: [
      [120, 15, 5], // Verdaderos Bajo, Predichos Medio, Predichos Alto
      [18, 95, 12], // Predichos Bajo, Verdaderos Medio, Predichos Alto
      [7, 14, 89], // Predichos Bajo, Predichos Medio, Verdaderos Alto
    ],
    total: 375,
  }

  // Función para obtener el color según el valor normalizado y el esquema de color
  const getColor = (value: number, max: number, scheme: string) => {
    const intensity = Math.min(0.9, Math.max(0.1, value / max))

    switch (scheme) {
      case "blue":
        return `rgba(59, 130, 246, ${intensity})`
      case "green":
        return `rgba(16, 185, 129, ${intensity})`
      case "red":
        return `rgba(239, 68, 68, ${intensity})`
      case "purple":
        return `rgba(139, 92, 246, ${intensity})`
      default:
        return `rgba(59, 130, 246, ${intensity})`
    }
  }

  // Función para renderizar la matriz de confusión
  const renderConfusionMatrix = () => {
    if (!trainingCompleted) {
      return <Skeleton className="w-full h-[300px] rounded-md" />
    }

    const { labels, matrix, total } = confusionMatrixData

    // Encontrar el valor máximo para la normalización de colores
    const maxValue = normalization === "count" ? Math.max(...matrix.flat()) : 100

    return (
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-muted-foreground"></th>
              <th className="p-2 text-center text-sm font-medium text-muted-foreground" colSpan={labels.length}>
                Predicción
              </th>
            </tr>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-muted-foreground"></th>
              {labels.map((label, i) => (
                <th key={i} className="p-2 text-center text-sm font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {i === 0 && (
                  <th className="p-2 text-left text-sm font-medium text-muted-foreground" rowSpan={labels.length}>
                    <div className="transform -rotate-90 origin-center whitespace-nowrap">Valor Real</div>
                  </th>
                )}
                <th className="p-2 text-left text-sm font-medium">{labels[i]}</th>
                {row.map((cell, j) => {
                  const isCorrect = i === j
                  const value =
                    normalization === "count" ? cell : ((cell / row.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                  const displayValue = normalization === "count" ? value : `${value}%`

                  return (
                    <td key={j} className={`p-0 text-center ${isCorrect ? "font-medium" : ""}`}>
                      <div
                        className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20"
                        style={{
                          backgroundColor: getColor(
                            normalization === "count" ? cell : (cell / row.reduce((a, b) => a + b, 0)) * 100,
                            maxValue,
                            colorScheme,
                          ),
                          color: isCorrect ? "white" : "inherit",
                        }}
                      >
                        {displayValue}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <Tabs value={normalization} onValueChange={(value: "count" | "percent") => setNormalization(value)}>
            <TabsList>
              <TabsTrigger value="count">Conteo</TabsTrigger>
              <TabsTrigger value="percent">Porcentaje</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Información</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={colorScheme}
            onValueChange={(value: "blue" | "green" | "red" | "purple") => setColorScheme(value)}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Esquema de color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Azul</SelectItem>
              <SelectItem value="green">Verde</SelectItem>
              <SelectItem value="red">Rojo</SelectItem>
              <SelectItem value="purple">Púrpura</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {renderConfusionMatrix()}

      <div className="bg-slate-50 p-4 rounded-md border text-sm">
        <h4 className="font-medium mb-2 flex items-center gap-1">
          <Info className="h-4 w-4 text-blue-600" />
          Interpretación
        </h4>
        <div className="space-y-2">
          <p>La matriz de confusión muestra la distribución de predicciones correctas e incorrectas para cada clase.</p>
          <p>
            Los elementos de la diagonal representan predicciones correctas, mientras que los elementos fuera de la
            diagonal son errores.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Precisión</Badge>
              <span>83.2%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Exhaustividad</Badge>
              <span>79.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">F1-Score</Badge>
              <span>81.3%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800">Exactitud</Badge>
              <span>87.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
