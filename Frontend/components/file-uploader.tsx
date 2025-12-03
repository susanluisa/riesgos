"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File, content: string) => void
  accept?: string
  maxSize?: number // in bytes
}

export function FileUploader({ onFileUpload, accept = ".csv", maxSize = 5 * 1024 * 1024 }: FileUploaderProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      setError(null)

      try {
        // Validar tipo de archivo
        if (!file.name.endsWith(".csv")) {
          throw new Error("Solo se permiten archivos CSV")
        }

        // Validar tamaño
        if (file.size > maxSize) {
          throw new Error(`El archivo excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`)
        }

        // Leer el archivo
        const content = await file.text()

        // Validar que tenga contenido
        if (!content.trim()) {
          throw new Error("El archivo está vacío")
        }

        // Detectar delimitador automáticamente
        const firstLine = content.split("\n")[0]
        let delimiter = ","
        if (firstLine.includes(";")) delimiter = ";"
        else if (firstLine.includes("\t")) delimiter = "\t"
        else if (firstLine.includes("|")) delimiter = "|"

        // Validar estructura básica (al menos 2 columnas)
        const headers = firstLine.split(delimiter)
        if (headers.length < 2) {
          throw new Error("El CSV debe tener al menos 2 columnas")
        }

        setSelectedFile(file)
        onFileUpload(file, content)

        toast({
          title: "Archivo cargado correctamente",
          description: `Se ha procesado el archivo ${file.name}`,
          variant: "success",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar el archivo")
        toast({
          title: "Error al cargar el archivo",
          description: err instanceof Error ? err.message : "Error desconocido",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [maxSize, onFileUpload, toast],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        processFile(file)
      }
    },
    [processFile],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0]
        processFile(file)
      }
    },
    [processFile],
  )

  return (
    <Card
      className={`border-2 border-dashed ${
        isDragging ? "border-primary bg-primary/10" : error ? "border-destructive/50" : "border-muted-foreground/20"
      } transition-colors duration-200`}
    >
      <CardContent
        className="flex flex-col items-center justify-center p-6 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB • {new Date().toLocaleString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSelectedFile(null)
                setError(null)
              }}
            >
              Cambiar archivo
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error al cargar el archivo</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setError(null)
              }}
            >
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-muted p-3">
              {isProcessing ? (
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="mb-1 text-lg font-semibold">Arrastre su archivo aquí</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Soporte para archivos CSV hasta {maxSize / 1024 / 1024}MB
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild disabled={isProcessing}>
                <label className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Seleccionar archivo
                  <input
                    type="file"
                    className="sr-only"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </label>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Para compatibilidad con importaciones existentes
export default FileUploader
