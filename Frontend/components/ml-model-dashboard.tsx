"use client"

import { logger } from "@/lib/logger"
import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUploader } from "./FileUploader"
import { PreviewTable } from "./PreviewTable"
import { ModelResultsDashboard } from "./model-results-dashboard"
import { useDataset } from "./hooks/useDataset"
import { useTraining } from "./hooks/useTraining"
import {
  RotateCcw,
  Upload,
  Database,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  TreesIcon as Tree,
} from "lucide-react"

export function MLModelDashboard() {
  const [activeTab, setActiveTab] = useState("data")
  const { datasetId, preview, columns, filename, isUploading, error, upload, reset } = useDataset()
  const { status, progress, result, start, reset: resetTraining } = useTraining(datasetId)

  const handleFileUpload = async (file: File, content: string) => {
    try {
      await upload(file, content)
      setActiveTab("preview")
    } catch (error) {
      logger.error("Error uploading file:", error)
    }
  }

  const handleStartTraining = async () => {
    if (!datasetId) return

    try {
      await start()
      setActiveTab("training")
    } catch (error) {
      logger.error("Error starting training:", error)
    }
  }

  const handleReset = () => {
    reset()
    resetTraining()
    setActiveTab("data")
  }

  const hasDataset = datasetId && preview.length > 0
  const isTraining = status === "training"
  const trainingCompleted = status === "completed"
  const trainingError = status === "error"

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case "data":
        return hasDataset ? "completed" : "pending"
      case "preview":
        return hasDataset ? "completed" : "disabled"
      case "training":
        return trainingCompleted ? "completed" : isTraining ? "active" : hasDataset ? "pending" : "disabled"
      case "results":
        return trainingCompleted ? "completed" : "disabled"
      default:
        return "pending"
    }
  }

  const TabTriggerWithStatus = ({
    value,
    children,
    icon: Icon,
  }: { value: string; children: React.ReactNode; icon: any }) => {
    const status = getTabStatus(value)

    return (
      <TabsTrigger
        value={value}
        disabled={status === "disabled"}
        className={`flex items-center gap-2 ${
          status === "completed"
            ? "text-green-600"
            : status === "active"
              ? "text-blue-600"
              : status === "disabled"
                ? "text-gray-400"
                : ""
        }`}
      >
        <Icon className="h-4 w-4" />
        {children}
        {status === "completed" && <CheckCircle className="h-3 w-3 text-green-600" />}
        {status === "active" && <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />}
      </TabsTrigger>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tree className="h-5 w-5 text-green-600" />
            Dashboard Random Forest - Machine Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabTriggerWithStatus value="data" icon={Upload}>
                Datos
              </TabTriggerWithStatus>
              <TabTriggerWithStatus value="preview" icon={Database}>
                Vista Previa
              </TabTriggerWithStatus>
              <TabTriggerWithStatus value="training" icon={Settings}>
                Entrenamiento
              </TabTriggerWithStatus>
              <TabTriggerWithStatus value="results" icon={BarChart3}>
                Resultados
              </TabTriggerWithStatus>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Carga de Datos para Random Forest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasDataset ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Random Forest - Ideal para Variables Dummy</h4>
                        <p className="text-sm text-green-700">
                          Random Forest maneja automáticamente variables categóricas y dummy sin necesidad de escalado.
                          Perfecto para análisis de riesgos ocupacionales con datos mixtos.
                        </p>
                      </div>
                      <FileUploader onFileUpload={handleFileUpload} />
                      {isUploading && (
                        <Alert>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <AlertDescription>Cargando archivo...</AlertDescription>
                        </Alert>
                      )}
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Error al cargar el archivo: {error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Dataset cargado exitosamente: {filename} ({preview.length} filas, {columns.length} columnas)
                        </AlertDescription>
                      </Alert>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Datos Preparados para Random Forest</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• Variables categóricas serán convertidas automáticamente a dummy</p>
                          <p>• Random Forest optimizará la importancia de cada característica</p>
                          <p>• El modelo manejará naturalmente datos mixtos (numéricos y categóricos)</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                          <Upload className="h-4 w-4 mr-2" />
                          Cargar Nuevo Dataset
                        </Button>
                        <Button onClick={() => setActiveTab("preview")}>Ver Vista Previa</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Vista Previa de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasDataset ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{preview.length}</div>
                          <div className="text-sm text-blue-600">Filas</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{columns.length}</div>
                          <div className="text-sm text-green-600">Columnas</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{filename}</div>
                          <div className="text-sm text-purple-600">Archivo</div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Preparación para Random Forest</h4>
                        <div className="text-sm text-green-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>• Variables categóricas → Variables dummy</div>
                          <div>• Sin necesidad de normalización</div>
                          <div>• Manejo automático de valores faltantes</div>
                          <div>• Cálculo de importancia de características</div>
                        </div>
                      </div>

                      <PreviewTable />

                      <div className="flex gap-2">
                        <Button
                          onClick={handleStartTraining}
                          disabled={isTraining || !datasetId}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isTraining ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Entrenando Random Forest...
                            </>
                          ) : (
                            <>
                              <Tree className="h-4 w-4 mr-2" />
                              Entrenar Random Forest
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab("data")}>
                          Cambiar Dataset
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No hay datos cargados. Por favor, carga un dataset primero.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tree className="h-5 w-5 text-green-600" />
                    Entrenamiento Random Forest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isTraining && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progreso del entrenamiento Random Forest</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="w-full" />
                        </div>
                        <Alert>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <AlertDescription>
                            Entrenando Random Forest con {columns.length} características. Creando variables dummy y
                            calculando importancia...
                          </AlertDescription>
                        </Alert>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Proceso de Entrenamiento</h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>✓ Conversión de variables categóricas a dummy</p>
                            <p>✓ Construcción de {result?.nEstimators || 100} árboles de decisión</p>
                            <p>✓ Cálculo de importancia de características</p>
                            <p>✓ Validación out-of-bag (OOB)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {trainingCompleted && (
                      <div className="space-y-4">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            ¡Random Forest entrenado exitosamente! F1 Score:{" "}
                            {result ? (result.f1 * 100).toFixed(1) : "N/A"}%, OOB Score:{" "}
                            {result ? (result.oobScore * 100).toFixed(1) : "N/A"}%
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{result ? result.nEstimators : 100}</div>
                            <div className="text-sm text-green-600">Árboles</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {result ? (result.oobScore * 100).toFixed(1) : "N/A"}%
                            </div>
                            <div className="text-sm text-blue-600">OOB Score</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                              {result ? result.trainingTime.toFixed(1) : "N/A"}s
                            </div>
                            <div className="text-sm text-purple-600">Tiempo</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {trainingError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ocurrió un error durante el entrenamiento del Random Forest. Por favor, intenta nuevamente.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      {!isTraining && !trainingCompleted && (
                        <Button
                          onClick={handleStartTraining}
                          disabled={!hasDataset}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Tree className="h-4 w-4 mr-2" />
                          Entrenar Random Forest
                        </Button>
                      )}

                      {trainingCompleted && (
                        <Button onClick={() => setActiveTab("results")} className="bg-blue-600 hover:bg-blue-700">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Ver Resultados Completos
                        </Button>
                      )}

                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reiniciar Sistema
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {trainingCompleted && result ? (
                <ModelResultsDashboard trainingCompleted={trainingCompleted} results={result} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay resultados disponibles. Por favor, completa el entrenamiento del Random Forest primero.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Export as default for backward compatibility
export default MLModelDashboard
