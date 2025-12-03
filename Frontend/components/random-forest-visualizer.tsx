"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TreesIcon as Tree, Info, Download, Play } from "lucide-react"

interface RandomForestVisualizerProps {
  trainingCompleted: boolean
}

export function RandomForestVisualizer({ trainingCompleted }: RandomForestVisualizerProps) {
  const [nEstimators, setNEstimators] = useState([100])
  const [maxDepth, setMaxDepth] = useState([10])
  const [minSamplesSplit, setMinSamplesSplit] = useState([5])
  const [selectedTree, setSelectedTree] = useState("0")
  const [selectedFeature, setSelectedFeature] = useState("all")

  // Datos simulados de Random Forest
  const rfMetrics = {
    oobScore: 0.85,
    nTrees: nEstimators[0],
    avgDepth: 8.3,
    trainingTime: 145.3,
    memoryUsage: 24.5,
    featureImportances: [
      { name: "edad", importance: 0.15, type: "numerical", isDummy: false },
      { name: "experiencia_años", importance: 0.12, type: "numerical", isDummy: false },
      { name: "departamento_produccion", importance: 0.11, type: "categorical", isDummy: true },
      { name: "departamento_mantenimiento", importance: 0.09, type: "categorical", isDummy: true },
      { name: "departamento_oficina", importance: 0.08, type: "categorical", isDummy: true },
      { name: "turno_mañana", importance: 0.1, type: "categorical", isDummy: true },
      { name: "turno_tarde", importance: 0.08, type: "categorical", isDummy: true },
      { name: "turno_noche", importance: 0.07, type: "categorical", isDummy: true },
      { name: "horas_trabajo_semanal", importance: 0.09, type: "numerical", isDummy: false },
      { name: "tipo_trabajo_fisico", importance: 0.06, type: "categorical", isDummy: true },
      { name: "tipo_trabajo_mental", importance: 0.05, type: "categorical", isDummy: true },
    ],
  }

  const renderFeatureImportance = () => {
    const filteredFeatures =
      selectedFeature === "all"
        ? rfMetrics.featureImportances
        : selectedFeature === "dummy"
          ? rfMetrics.featureImportances.filter((f) => f.isDummy)
          : rfMetrics.featureImportances.filter((f) => !f.isDummy)

    const maxImportance = Math.max(...filteredFeatures.map((f) => f.importance))

    return (
      <div className="space-y-3">
        {filteredFeatures.map((feature, index) => (
          <div key={feature.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${feature.isDummy ? "bg-blue-500" : "bg-green-500"}`} />
                <span className="text-sm font-medium">{feature.name}</span>
                {feature.isDummy && (
                  <Badge variant="outline" className="text-xs">
                    Dummy
                  </Badge>
                )}
              </div>
              <span className="text-sm font-semibold">{(feature.importance * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  feature.isDummy ? "bg-blue-500" : "bg-green-500"
                }`}
                style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTreeVisualization = () => {
    // Simulación de estructura de árbol
    const treeData = {
      nodes: [
        { id: 1, feature: "edad", threshold: 35, samples: 1000, level: 0 },
        { id: 2, feature: "departamento_produccion", threshold: 0.5, samples: 600, level: 1 },
        { id: 3, feature: "turno_noche", threshold: 0.5, samples: 400, level: 1 },
        { id: 4, feature: "experiencia_años", threshold: 5, samples: 350, level: 2 },
        { id: 5, feature: "horas_trabajo_semanal", threshold: 45, samples: 250, level: 2 },
      ],
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Árbol seleccionado:</label>
          <Select value={selectedTree} onValueChange={setSelectedTree}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: Math.min(nEstimators[0], 10) }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  Árbol {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="space-y-3">
            {treeData.nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 bg-white rounded border-l-4 ${
                  node.feature.includes("_") ? "border-blue-500" : "border-green-500"
                }`}
                style={{ marginLeft: `${node.level * 20}px` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{node.feature}</div>
                    <div className="text-xs text-muted-foreground">
                      {node.feature.includes("_") ? "Variable Dummy" : "Variable Numérica"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">≤ {node.threshold}</div>
                    <div className="text-xs text-muted-foreground">{node.samples} muestras</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderParameterTuning = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Número de Árboles (n_estimators)</label>
            <Slider
              value={nEstimators}
              onValueChange={setNEstimators}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">{nEstimators[0]} árboles</div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Profundidad Máxima (max_depth)</label>
            <Slider value={maxDepth} onValueChange={setMaxDepth} max={20} min={3} step={1} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">{maxDepth[0]} niveles</div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Min. Muestras División (min_samples_split)</label>
            <Slider
              value={minSamplesSplit}
              onValueChange={setMinSamplesSplit}
              max={20}
              min={2}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">{minSamplesSplit[0]} muestras</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OOB Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{(rfMetrics.oobScore * 100).toFixed(1)}%</div>
              <Progress value={rfMetrics.oobScore * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profundidad Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{rfMetrics.avgDepth}</div>
              <div className="text-xs text-muted-foreground mt-1">de {maxDepth[0]} máximo</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tiempo Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{rfMetrics.trainingTime.toFixed(1)}s</div>
              <div className="text-xs text-muted-foreground mt-1">{nEstimators[0]} árboles</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Uso de Memoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{rfMetrics.memoryUsage.toFixed(1)}MB</div>
              <div className="text-xs text-muted-foreground mt-1">en memoria</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Reentrenar con Nuevos Parámetros
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Configuración
          </Button>
        </div>
      </div>
    )
  }

  if (!trainingCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tree className="h-5 w-5" />
            Visualizador Random Forest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Complete el entrenamiento del modelo Random Forest para ver las visualizaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tree className="h-5 w-5" />
          Visualizador Random Forest - Análisis Detallado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="importance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="importance">Importancia</TabsTrigger>
            <TabsTrigger value="trees">Árboles</TabsTrigger>
            <TabsTrigger value="parameters">Parámetros</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="importance" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium">Filtrar características:</label>
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las variables</SelectItem>
                  <SelectItem value="dummy">Solo variables dummy</SelectItem>
                  <SelectItem value="numerical">Solo variables numéricas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderFeatureImportance()}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Info className="h-4 w-4 text-blue-600" />
                Interpretación de Variables Dummy
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  • <strong>Variables Dummy (azul):</strong> Representan categorías específicas de variables categóricas
                </p>
                <p>
                  • <strong>departamento_produccion:</strong> Indica si el empleado trabaja en producción
                </p>
                <p>
                  • <strong>turno_noche:</strong> Indica si el empleado trabaja en turno nocturno
                </p>
                <p>
                  • <strong>Importancia alta en dummies:</strong> Sugiere que esas categorías son predictores
                  importantes de riesgo
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trees" className="space-y-4">
            {renderTreeVisualization()}
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            {renderParameterTuning()}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ventajas del Random Forest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Manejo de Variables Dummy</div>
                        <div className="text-sm text-muted-foreground">
                          Procesa naturalmente variables categóricas sin necesidad de escalado
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Resistencia al Overfitting</div>
                        <div className="text-sm text-muted-foreground">
                          El ensemble de árboles reduce la varianza y mejora la generalización
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Importancia de Características</div>
                        <div className="text-sm text-muted-foreground">
                          Calcula automáticamente la importancia de cada variable
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Robustez a Outliers</div>
                        <div className="text-sm text-muted-foreground">
                          Los árboles son naturalmente resistentes a valores atípicos
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración Recomendada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="font-medium text-green-800">Configuración Actual</div>
                      <div className="text-sm text-green-700 mt-1">
                        • n_estimators: {nEstimators[0]}
                        <br />• max_depth: {maxDepth[0]}
                        <br />• min_samples_split: {minSamplesSplit[0]}
                        <br />• OOB Score: {(rfMetrics.oobScore * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Para datos de riesgo ocupacional:</strong>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        • <strong>100-200 árboles:</strong> Balance entre rendimiento y tiempo
                        <br />• <strong>Profundidad 8-12:</strong> Evita overfitting manteniendo capacidad
                        <br />• <strong>Min samples 5-10:</strong> Previene divisiones con pocos datos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
