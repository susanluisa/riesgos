"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Download, Play, Settings, CheckCircle2, AlertTriangle } from "lucide-react"

interface HyperparameterTuningProps {
  trainingCompleted: boolean
}

export function HyperparameterTuning({ trainingCompleted }: HyperparameterTuningProps) {
  const [tuningMethod, setTuningMethod] = useState<"grid" | "random" | "bayesian">("grid")
  const [tuningStatus, setTuningStatus] = useState<"idle" | "running" | "completed" | "error">("idle")
  const [tuningProgress, setTuningProgress] = useState(0)

  // Datos simulados para los resultados de ajuste de hiperparámetros
  const tuningResults = [
    {
      rank: 1,
      params: {
        n_estimators: 200,
        max_depth: 15,
        min_samples_split: 2,
        min_samples_leaf: 1,
      },
      score: 0.872,
      std: 0.015,
      time: 12.5,
    },
    {
      rank: 2,
      params: {
        n_estimators: 150,
        max_depth: 10,
        min_samples_split: 2,
        min_samples_leaf: 1,
      },
      score: 0.865,
      std: 0.018,
      time: 9.8,
    },
    {
      rank: 3,
      params: {
        n_estimators: 100,
        max_depth: 20,
        min_samples_split: 2,
        min_samples_leaf: 1,
      },
      score: 0.858,
      std: 0.021,
      time: 7.2,
    },
    {
      rank: 4,
      params: {
        n_estimators: 200,
        max_depth: 10,
        min_samples_split: 5,
        min_samples_leaf: 2,
      },
      score: 0.851,
      std: 0.019,
      time: 11.9,
    },
    {
      rank: 5,
      params: {
        n_estimators: 100,
        max_depth: 15,
        min_samples_split: 5,
        min_samples_leaf: 2,
      },
      score: 0.843,
      std: 0.022,
      time: 6.8,
    },
  ]

  // Función para iniciar el ajuste de hiperparámetros
  const startTuning = () => {
    setTuningStatus("running")
    setTuningProgress(0)

    // Simular progreso
    const interval = setInterval(() => {
      setTuningProgress((prev) => {
        const newProgress = prev + Math.random() * 5

        if (newProgress >= 100) {
          clearInterval(interval)
          setTuningStatus("completed")
          return 100
        }

        return newProgress
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {tuningStatus === "idle" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Configuración de Ajuste de Hiperparámetros</h3>
              <p className="text-sm text-muted-foreground">
                Configure los parámetros para la búsqueda automática de hiperparámetros óptimos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                value={tuningMethod}
                onValueChange={(value: "grid" | "random" | "bayesian") => setTuningMethod(value)}
              >
                <TabsList>
                  <TabsTrigger value="grid">Búsqueda en Cuadrícula</TabsTrigger>
                  <TabsTrigger value="random">Búsqueda Aleatoria</TabsTrigger>
                  <TabsTrigger value="bayesian">Búsqueda Bayesiana</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Espacio de Búsqueda</h4>
              <p className="text-sm text-muted-foreground">Defina el rango de valores para cada hiperparámetro</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>n_estimators</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="Min" defaultValue="50" className="w-20" />
                    <span>a</span>
                    <Input type="number" placeholder="Max" defaultValue="300" className="w-20" />
                    <span>paso</span>
                    <Input type="number" placeholder="Step" defaultValue="50" className="w-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>max_depth</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="Min" defaultValue="5" className="w-20" />
                    <span>a</span>
                    <Input type="number" placeholder="Max" defaultValue="30" className="w-20" />
                    <span>paso</span>
                    <Input type="number" placeholder="Step" defaultValue="5" className="w-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>min_samples_split</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="Min" defaultValue="2" className="w-20" />
                    <span>a</span>
                    <Input type="number" placeholder="Max" defaultValue="10" className="w-20" />
                    <span>paso</span>
                    <Input type="number" placeholder="Step" defaultValue="2" className="w-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>min_samples_leaf</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="Min" defaultValue="1" className="w-20" />
                    <span>a</span>
                    <Input type="number" placeholder="Max" defaultValue="5" className="w-20" />
                    <span>paso</span>
                    <Input type="number" placeholder="Step" defaultValue="1" className="w-20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Configuración de Validación</h4>
              <p className="text-sm text-muted-foreground">Configure los parámetros para la validación cruzada</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv-folds">Número de pliegues (k-fold)</Label>
                  <Input id="cv-folds" type="number" defaultValue="5" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scoring">Métrica de evaluación</Label>
                  <Select defaultValue="f1_weighted">
                    <SelectTrigger id="scoring">
                      <SelectValue placeholder="Seleccionar métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Exactitud (Accuracy)</SelectItem>
                      <SelectItem value="f1_weighted">F1 Score (ponderado)</SelectItem>
                      <SelectItem value="precision_weighted">Precisión (ponderada)</SelectItem>
                      <SelectItem value="recall_weighted">Exhaustividad (ponderada)</SelectItem>
                      <SelectItem value="roc_auc_ovr">AUC ROC (one-vs-rest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n-jobs">Procesos paralelos</Label>
                  <Input id="n-jobs" type="number" defaultValue="-1" />
                  <p className="text-xs text-muted-foreground">-1 para usar todos los núcleos disponibles</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="verbose" defaultChecked />
                  <Label htmlFor="verbose">Mostrar progreso detallado</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="refit" defaultChecked />
                  <Label htmlFor="refit">Reentrenar con los mejores parámetros</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">
                <span className="font-medium">Combinaciones totales:</span> 120
              </p>
              <p className="text-sm">
                <span className="font-medium">Tiempo estimado:</span> ~30 minutos
              </p>
            </div>
            <Button onClick={startTuning} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Iniciar Ajuste</span>
            </Button>
          </div>
        </div>
      )}

      {tuningStatus === "running" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ajuste de Hiperparámetros en Progreso</h3>
            <Badge className="bg-blue-100 text-blue-800">En ejecución</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso general</span>
              <span className="text-sm">{Math.round(tuningProgress)}%</span>
            </div>
            <Progress value={tuningProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-md border">
              <h4 className="font-medium mb-2">Detalles</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Método:</span>{" "}
                  {tuningMethod === "grid"
                    ? "Búsqueda en Cuadrícula"
                    : tuningMethod === "random"
                      ? "Búsqueda Aleatoria"
                      : "Búsqueda Bayesiana"}
                </p>
                <p>
                  <span className="font-medium">Combinaciones evaluadas:</span>{" "}
                  {Math.round((tuningProgress / 100) * 120)} / 120
                </p>
                <p>
                  <span className="font-medium">Mejor puntuación actual:</span> 0.865
                </p>
                <p>
                  <span className="font-medium">Tiempo transcurrido:</span> {Math.round((tuningProgress / 100) * 30)}{" "}
                  minutos
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border">
              <h4 className="font-medium mb-2">Mejores parámetros actuales</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">n_estimators:</span> 150
                </p>
                <p>
                  <span className="font-medium">max_depth:</span> 10
                </p>
                <p>
                  <span className="font-medium">min_samples_split:</span> 2
                </p>
                <p>
                  <span className="font-medium">min_samples_leaf:</span> 1
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Cancelar Ajuste</span>
            </Button>
          </div>
        </div>
      )}

      {tuningStatus === "completed" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Resultados del Ajuste de Hiperparámetros</h3>
            <Badge className="bg-green-100 text-green-800">Completado</Badge>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Ajuste completado exitosamente</h4>
              <p className="text-sm text-green-700 mt-1">
                Se han evaluado 120 combinaciones de hiperparámetros en 32 minutos. Se encontró una configuración óptima
                con una mejora del 2.5% en la métrica F1 Score.
              </p>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-slate-50 p-3 border-b">
              <h4 className="font-medium">Mejores Configuraciones</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Parámetros</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Std</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tiempo (s)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tuningResults.map((result) => (
                    <tr key={result.rank} className={result.rank === 1 ? "bg-green-50" : ""}>
                      <td className="px-4 py-3 text-sm">
                        {result.rank === 1 ? <Badge className="bg-green-100 text-green-800">Mejor</Badge> : result.rank}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          {Object.entries(result.params).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{result.score.toFixed(3)}</td>
                      <td className="px-4 py-3 text-sm">±{result.std.toFixed(3)}</td>
                      <td className="px-4 py-3 text-sm">{result.time.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="outline" size="sm">
                          Aplicar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Exportar Resultados</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Aplicar Mejores Parámetros</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
