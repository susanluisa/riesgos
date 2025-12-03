"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle,
  Database,
  FileSpreadsheet,
  FileText,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react"
import { useDataset } from "./hooks/useDataset"
import { toast } from "@/hooks/use-toast"

interface DatasetManagerProps {
  onSelectDataset: (datasetName: string | null) => void
  activeDataset: string | null
}

export function DatasetManager({ onSelectDataset, activeDataset }: DatasetManagerProps) {
  const { getAllDatasets, loadDataset } = useDataset()
  const [datasets, setDatasets] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadDatasets = async () => {
    setIsRefreshing(true)
    try {
      const storedDatasets = getAllDatasets()
      setDatasets(storedDatasets)
    } catch (error) {
      console.error("Error loading datasets:", error)
      toast({
        title: "Error loading datasets",
        description: "Failed to load stored datasets",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadDatasets()
  }, [getAllDatasets])

  useEffect(() => {
    const interval = setInterval(() => {
      const storedDatasets = getAllDatasets()
      if (storedDatasets.length !== datasets.length) {
        setDatasets(storedDatasets)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [datasets.length, getAllDatasets])

  const handleDeleteDataset = (datasetId: string) => {
    try {
      // Remove from localStorage
      const storedDatasets = getAllDatasets()
      const updatedDatasets = storedDatasets.filter((d) => d.id !== datasetId)
      localStorage.setItem("ml-dashboard-datasets-list", JSON.stringify(updatedDatasets))

      // Update local state
      setDatasets(updatedDatasets)

      // Clear active dataset if it was deleted
      const deletedDataset = storedDatasets.find((d) => d.id === datasetId)
      if (activeDataset === deletedDataset?.name) {
        onSelectDataset(null)
      }

      toast({
        title: "Dataset deleted",
        description: `${deletedDataset?.name} has been removed`,
      })
    } catch (error) {
      toast({
        title: "Error deleting dataset",
        description: "Failed to delete dataset",
        variant: "destructive",
      })
    }
  }

  const handleSelectDataset = (datasetId: string, datasetName: string) => {
    const success = loadDataset(datasetId)
    if (success) {
      onSelectDataset(datasetName)
      toast({
        title: "Dataset loaded",
        description: `${datasetName} is now active`,
      })
    } else {
      toast({
        title: "Error loading dataset",
        description: "Failed to load the selected dataset",
        variant: "destructive",
      })
    }
  }

  const handleExportDataset = (dataset: any) => {
    try {
      const dataStr = JSON.stringify(dataset, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${dataset.name.replace(/\.[^/.]+$/, "")}_export.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Dataset exported",
        description: `${dataset.name} exported successfully`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export dataset",
        variant: "destructive",
      })
    }
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
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Auto-Saved</span>
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span>Procesando</span>
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Error</span>
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case "csv":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "json":
        return <FileText className="h-5 w-5 text-yellow-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Datasets Auto-Guardados</CardTitle>
            <CardDescription>
              {datasets.length} datasets guardados automáticamente - Perfecto para múltiples archivos Excel
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadDatasets} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {datasets.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No hay datasets guardados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suba un archivo Excel, CSV o JSON para comenzar. Se guardará automáticamente.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="w-10 px-3 py-3 text-left">
                        <span className="sr-only">Icono</span>
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Nombre</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Filas</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Columnas</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Tamaño</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Fecha</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Estado</th>
                      <th className="px-3 py-3 text-left font-medium text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {datasets.map((dataset) => (
                      <tr
                        key={dataset.id}
                        className={`hover:bg-muted/50 ${activeDataset === dataset.name ? "bg-primary/5" : ""}`}
                      >
                        <td className="px-3 py-3">{getFileIcon(dataset.name)}</td>
                        <td className="px-3 py-3 font-medium">
                          {dataset.name}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {dataset.fileType?.toUpperCase()} • Auto-guardado
                          </p>
                        </td>
                        <td className="px-3 py-3">{dataset.rows.toLocaleString()}</td>
                        <td className="px-3 py-3">{dataset.columns.length}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {(dataset.fileSize / 1024).toFixed(1)} KB
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(dataset.uploadDate)}
                        </td>
                        <td className="px-3 py-3">{getStatusBadge(dataset.status)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={activeDataset === dataset.name ? "default" : "outline"}
                              size="sm"
                              disabled={dataset.status !== "processed"}
                              onClick={() => handleSelectDataset(dataset.id, dataset.name)}
                            >
                              {activeDataset === dataset.name ? "Activo" : "Cargar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => handleExportDataset(dataset)}
                              title="Exportar dataset"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteDataset(dataset.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {datasets.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Sistema de Auto-Guardado Activo</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>✓ Todos los datasets se guardan automáticamente al cargar</p>
                <p>✓ Historial de hasta 50 datasets más recientes</p>
                <p>✓ Datos persistentes - no se pierden al recargar la página</p>
                <p>✓ Perfecto para procesar múltiples archivos Excel</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
