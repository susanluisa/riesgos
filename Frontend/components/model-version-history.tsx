"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Calendar, CheckCircle2, Clock, Download, History, RotateCcw, User } from "lucide-react"

export function ModelVersionHistory() {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  // Mock data - in a real app, this would come from your API
  const versions = [
    {
      id: "v1.3.0",
      name: "Modelo de Producción v1.3",
      date: "2023-05-10T14:30:00",
      author: "Maria Rodriguez",
      accuracy: 0.87,
      f1Score: 0.81,
      status: "active",
      description: "Versión actual en producción con mejoras en la detección de riesgos ergonómicos.",
    },
    {
      id: "v1.2.1",
      name: "Hotfix Riesgos Químicos",
      date: "2023-04-22T09:15:00",
      author: "Carlos Mendoza",
      accuracy: 0.85,
      f1Score: 0.79,
      status: "archived",
      description: "Corrección en la clasificación de riesgos químicos para sustancias corrosivas.",
    },
    {
      id: "v1.2.0",
      name: "Actualización Trimestral",
      date: "2023-03-15T11:45:00",
      author: "Maria Rodriguez",
      accuracy: 0.83,
      f1Score: 0.77,
      status: "archived",
      description: "Incorporación de nuevas variables relacionadas con factores ambientales.",
    },
    {
      id: "v1.1.0",
      name: "Mejora de Precisión",
      date: "2023-02-01T16:20:00",
      author: "Juan Perez",
      accuracy: 0.79,
      f1Score: 0.74,
      status: "archived",
      description: "Optimización de hiperparámetros para mejorar la precisión general del modelo.",
    },
    {
      id: "v1.0.0",
      name: "Modelo Base",
      date: "2023-01-10T10:00:00",
      author: "Juan Perez",
      accuracy: 0.75,
      f1Score: 0.71,
      status: "archived",
      description: "Versión inicial del modelo de predicción de riesgos ocupacionales.",
    },
  ]

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId) ? prev.filter((id) => id !== versionId) : [...prev, versionId],
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
      case "archived":
        return <Badge variant="outline">Archivado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Historial de Versiones</CardTitle>
            <CardDescription>Registro de versiones anteriores del modelo y sus métricas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedVersions.length !== 1}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedVersions.length === 0}
              className="flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="flex items-center gap-1">
              <History className="h-3.5 w-3.5" />
              <span>Lista</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Comparación</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="w-10 px-3 py-3 text-left">
                        <span className="sr-only">Seleccionar</span>
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Versión</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Nombre</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Fecha</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Autor</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Precisión</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {versions.map((version) => (
                      <tr
                        key={version.id}
                        className={`hover:bg-muted/50 ${selectedVersions.includes(version.id) ? "bg-primary/5" : ""}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(version.id)}
                            onChange={() => toggleVersionSelection(version.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-3 font-medium">{version.id}</td>
                        <td className="px-3 py-3">{version.name}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(version.date)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{version.author}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-medium">{(version.accuracy * 100).toFixed(1)}%</td>
                        <td className="px-3 py-3">
                          {getStatusBadge(version.status)}
                          {version.status === "active" && (
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>En producción</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            {selectedVersions.length < 2 ? (
              <div className="border rounded-md p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Seleccione versiones para comparar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Seleccione al menos dos versiones en la pestaña "Lista" para ver una comparación detallada.
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.querySelector('[value="list"]')?.dispatchEvent(new Event("click"))}
                >
                  Ir a la lista de versiones
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-3 text-left font-medium text-sm">Métrica</th>
                          {selectedVersions.map((versionId) => {
                            const version = versions.find((v) => v.id === versionId)
                            return (
                              <th key={versionId} className="px-3 py-3 text-left font-medium text-sm">
                                {version?.id} ({version?.name})
                              </th>
                            )
                          })}
                          <th className="px-3 py-3 text-left font-medium text-sm">Diferencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-3 py-3 font-medium">Precisión</td>
                          {selectedVersions.map((versionId) => {
                            const version = versions.find((v) => v.id === versionId)
                            return (
                              <td key={versionId} className="px-3 py-3">
                                {version ? (version.accuracy * 100).toFixed(1) + "%" : "-"}
                              </td>
                            )
                          })}
                          <td className="px-3 py-3">
                            {selectedVersions.length === 2 &&
                              (() => {
                                const v1 = versions.find((v) => v.id === selectedVersions[0])
                                const v2 = versions.find((v) => v.id === selectedVersions[1])
                                if (v1 && v2) {
                                  const diff = (v1.accuracy - v2.accuracy) * 100
                                  return (
                                    <span className={diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : ""}>
                                      {diff > 0 ? "+" : ""}
                                      {diff.toFixed(1)}%
                                    </span>
                                  )
                                }
                                return "-"
                              })()}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-3 font-medium">F1-Score</td>
                          {selectedVersions.map((versionId) => {
                            const version = versions.find((v) => v.id === versionId)
                            return (
                              <td key={versionId} className="px-3 py-3">
                                {version ? (version.f1Score * 100).toFixed(1) + "%" : "-"}
                              </td>
                            )
                          })}
                          <td className="px-3 py-3">
                            {selectedVersions.length === 2 &&
                              (() => {
                                const v1 = versions.find((v) => v.id === selectedVersions[0])
                                const v2 = versions.find((v) => v.id === selectedVersions[1])
                                if (v1 && v2) {
                                  const diff = (v1.f1Score - v2.f1Score) * 100
                                  return (
                                    <span className={diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : ""}>
                                      {diff > 0 ? "+" : ""}
                                      {diff.toFixed(1)}%
                                    </span>
                                  )
                                }
                                return "-"
                              })()}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-3 font-medium">Fecha</td>
                          {selectedVersions.map((versionId) => {
                            const version = versions.find((v) => v.id === versionId)
                            return (
                              <td key={versionId} className="px-3 py-3">
                                {version ? formatDate(version.date) : "-"}
                              </td>
                            )
                          })}
                          <td className="px-3 py-3">
                            {selectedVersions.length === 2 &&
                              (() => {
                                const v1 = versions.find((v) => v.id === selectedVersions[0])
                                const v2 = versions.find((v) => v.id === selectedVersions[1])
                                if (v1 && v2) {
                                  const date1 = new Date(v1.date)
                                  const date2 = new Date(v2.date)
                                  const diffTime = Math.abs(date1.getTime() - date2.getTime())
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                  return (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>{diffDays} días</span>
                                    </div>
                                  )
                                }
                                return "-"
                              })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVersions.map((versionId) => {
                    const version = versions.find((v) => v.id === versionId)
                    if (!version) return null

                    return (
                      <Card key={versionId}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {version.id} - {version.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 text-sm">
                            <p>{version.description}</p>
                            <div className="pt-2 border-t flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{version.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(version.date)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
