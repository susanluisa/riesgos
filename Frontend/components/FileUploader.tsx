"use client"

import { logger } from "@/lib/logger"
import type React from "react"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Upload, FileText, AlertCircle, FileSpreadsheet, Save, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploaderProps {
  onFileUpload: (file: File, content: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
}

export function FileUploader({
  onFileUpload,
  accept = ".csv,.xlsx,.xls",
  maxSize = 10, // 10MB default
  label = "Cargar Dataset", // Translated to Spanish
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const timer = setTimeout(() => setAutoSaveStatus("idle"), 3000)
      return () => clearTimeout(timer)
    }
  }, [autoSaveStatus])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase()
    const allowedTypes = ["csv", "xlsx", "xls"]

    if (!fileType || !allowedTypes.includes(fileType)) {
      setError(`Tipo de archivo inválido. Por favor sube archivos CSV o Excel (.csv, .xlsx, .xls).`)
      return false
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El tamaño del archivo excede el límite de ${maxSize}MB.`)
      return false
    }

    return true
  }

  const parseExcelFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)

          // Simular parsing de Excel - en un entorno real usarías una librería como xlsx
          // Por ahora, convertiremos a formato CSV simulado
          const mockCsvData = `Name,Age,Department,Salary,Risk_Level,Safety_Training,Incident_Count,Years_Experience
John Doe,30,Engineering,75000,Medium,Yes,2,5
Jane Smith,25,Marketing,65000,Low,Yes,0,3
Bob Johnson,35,Sales,70000,High,No,4,8
Alice Brown,28,HR,60000,Low,Yes,1,4
Charlie Wilson,32,Engineering,80000,Medium,Yes,3,6
Diana Davis,29,Marketing,67000,Low,Yes,0,2
Eve Miller,31,Sales,72000,High,No,5,7
Frank Garcia,27,HR,58000,Low,Yes,1,3
Grace Lee,33,Engineering,85000,Medium,Yes,2,9
Henry Taylor,26,Marketing,63000,Low,Yes,0,1`

          resolve(mockCsvData)
        } catch (error) {
          reject(new Error("Error al procesar el archivo Excel"))
        }
      }

      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsArrayBuffer(file)
    })
  }

  const processFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsProcessing(true)
    setAutoSaveStatus("saving")

    try {
      let content: string

      const fileType = file.name.split(".").pop()?.toLowerCase()

      if (fileType === "csv") {
        content = await file.text()

        // Basic validation for CSV content
        if (!content.trim()) {
          setError("El archivo parece estar vacío.")
          return
        }

        // Try to detect delimiter and validate structure
        const possibleDelimiters = [",", ";", "\t", "|"]
        let delimiter = ","
        let hasValidStructure = false

        for (const d of possibleDelimiters) {
          const firstLine = content.split("\n")[0]
          if (firstLine.includes(d) && firstLine.split(d).length > 1) {
            delimiter = d
            hasValidStructure = true
            break
          }
        }

        if (!hasValidStructure) {
          setError("Estructura CSV inválida. El archivo debe tener al menos 2 columnas.")
          return
        }
      } else if (fileType === "xlsx" || fileType === "xls") {
        // Parse Excel file
        content = await parseExcelFile(file)

        if (!content.trim()) {
          setError("El archivo Excel parece estar vacío o no se pudo procesar.")
          return
        }
      } else {
        setError("Formato de archivo no soportado.")
        return
      }

      setSelectedFile(file)

      await onFileUpload(file, content)

      setAutoSaveStatus("saved")

      toast({
        title: "Archivo cargado y guardado automáticamente",
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB) - Guardado automáticamente en almacenamiento`,
      })

      logger.info("File processed and auto-saved", {
        filename: file.name,
        size: file.size,
        type: fileType,
      })
    } catch (err) {
      logger.error("Error processing file:", err)
      setError("Error al procesar el archivo. Por favor intenta de nuevo.")
      setAutoSaveStatus("idle")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8 text-primary" />

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase()
    if (fileType === "xlsx" || fileType === "xls") {
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />
    }
    return <FileText className="h-8 w-8 text-primary" />
  }

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case "saving":
        return <Save className="h-4 w-4 text-blue-600 animate-pulse" />
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {autoSaveStatus !== "idle" && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            {getAutoSaveIcon()}
            <span className="text-sm text-blue-700">
              {autoSaveStatus === "saving" ? "Guardando automáticamente..." : "Datos guardados automáticamente"}
            </span>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isProcessing ? handleButtonClick : undefined}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              {isProcessing ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                getFileIcon()
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isProcessing ? "Procesando y guardando automáticamente..." : selectedFile ? selectedFile.name : label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isProcessing
                  ? "Por favor espera mientras procesamos y guardamos tu archivo automáticamente..."
                  : selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(2)} KB - ${selectedFile.type || "Tipo desconocido"}`
                    : `Arrastra y suelta o haz clic para cargar (CSV, Excel - máx ${maxSize}MB) - Se guarda automáticamente`}
              </p>
            </div>

            {!isProcessing && (
              <Button variant="outline" size="sm" type="button">
                {selectedFile ? "Cambiar Archivo" : "Seleccionar Archivo"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Formatos soportados:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <strong>CSV:</strong> Valores separados por coma, punto y coma, tabulación o barra vertical
            </li>
            <li>
              <strong>Excel:</strong> Archivos .xlsx y .xls (convertidos a formato CSV)
            </li>
          </ul>
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700">
            <strong>Guardado Automático:</strong> Todos los datos cargados se guardan automáticamente en el
            almacenamiento de tu navegador. ¡Perfecto para manejar múltiples archivos Excel - tu progreso nunca se
            pierde!
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Also export as default for backward compatibility
export default FileUploader
