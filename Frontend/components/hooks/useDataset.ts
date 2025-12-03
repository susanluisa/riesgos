"use client"

import { logger } from "@/lib/logger"
import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

// Define types
interface DatasetState {
  id: string | null
  preview: any[]
  columns: string[]
  filename: string | null
  isUploading: boolean
  error: string | null
}

interface StoredDataset {
  id: string
  name: string
  filename: string
  preview: any[]
  columns: string[]
  rows: number
  uploadDate: string
  status: "processed" | "processing" | "error"
  fileType: string
  fileSize: number
}

// Initial state
const initialState: DatasetState = {
  id: null,
  preview: [],
  columns: [],
  filename: null,
  isUploading: false,
  error: null,
}

// LocalStorage keys
const STORAGE_KEYS = {
  DATASET_ID: "ml-dashboard-dataset-id",
  DATASET_PREVIEW: "ml-dashboard-dataset-preview",
  DATASET_COLUMNS: "ml-dashboard-dataset-columns",
  DATASET_FILENAME: "ml-dashboard-dataset-filename",
  DATASETS_LIST: "ml-dashboard-datasets-list", // Added for storing multiple datasets
  AUTO_SAVE_ENABLED: "ml-dashboard-auto-save-enabled",
}

export function useDataset() {
  const [state, setState] = useState<DatasetState>(initialState)

  const autoSave = useCallback((datasetData: Partial<DatasetState>) => {
    try {
      if (datasetData.id) localStorage.setItem(STORAGE_KEYS.DATASET_ID, datasetData.id)
      if (datasetData.preview) localStorage.setItem(STORAGE_KEYS.DATASET_PREVIEW, JSON.stringify(datasetData.preview))
      if (datasetData.columns) localStorage.setItem(STORAGE_KEYS.DATASET_COLUMNS, JSON.stringify(datasetData.columns))
      if (datasetData.filename) localStorage.setItem(STORAGE_KEYS.DATASET_FILENAME, datasetData.filename)

      logger.info("Dataset auto-saved successfully", { filename: datasetData.filename })
    } catch (error) {
      logger.error("Error auto-saving dataset:", error)
    }
  }, [])

  const saveToDatasetsList = useCallback((dataset: StoredDataset) => {
    try {
      const existingDatasets = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATASETS_LIST) || "[]")
      const updatedDatasets = existingDatasets.filter((d: StoredDataset) => d.id !== dataset.id)
      updatedDatasets.unshift(dataset) // Add to beginning

      // Keep only last 50 datasets to prevent storage overflow
      const limitedDatasets = updatedDatasets.slice(0, 50)
      localStorage.setItem(STORAGE_KEYS.DATASETS_LIST, JSON.stringify(limitedDatasets))

      logger.info("Dataset saved to history", { filename: dataset.filename, total: limitedDatasets.length })
    } catch (error) {
      logger.error("Error saving to datasets list:", error)
    }
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEYS.DATASET_ID)
      const storedPreviewStr = localStorage.getItem(STORAGE_KEYS.DATASET_PREVIEW)
      const storedColumnsStr = localStorage.getItem(STORAGE_KEYS.DATASET_COLUMNS)
      const storedFilename = localStorage.getItem(STORAGE_KEYS.DATASET_FILENAME)

      if (storedId && storedPreviewStr && storedColumnsStr) {
        const storedPreview = JSON.parse(storedPreviewStr)
        const storedColumns = JSON.parse(storedColumnsStr)

        setState({
          ...initialState,
          id: storedId,
          preview: storedPreview,
          columns: storedColumns,
          filename: storedFilename,
        })

        logger.info("Dataset loaded from storage", { filename: storedFilename })
      }
    } catch (error) {
      logger.error("Error loading dataset from localStorage:", error)
    }
  }, [])

  // Parse CSV data
  const parseCSV = (content: string): { headers: string[]; rows: any[] } => {
    try {
      // Try to detect delimiter
      const firstLine = content.split("\n")[0]
      let delimiter = ","

      // Check common delimiters
      const delimiters = [",", ";", "\t", "|"]
      for (const d of delimiters) {
        if (firstLine.includes(d)) {
          delimiter = d
          break
        }
      }

      // Parse CSV
      const lines = content.split("\n").filter((line) => line.trim() !== "")

      if (lines.length === 0) {
        throw new Error("Empty CSV file")
      }

      // Extract headers
      const headers = lines[0].split(delimiter).map((h) => h.trim())

      if (headers.length < 2) {
        throw new Error("CSV must have at least 2 columns")
      }

      // Extract data rows
      const dataRows = lines.slice(1).map((line) => {
        const values = line.split(delimiter).map((cell) => cell.trim())

        // Create object with header keys
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        return row
      })

      // Filter out rows with missing values
      const validRows = dataRows.filter((row) => Object.values(row).filter(Boolean).length === headers.length)

      return { headers, rows: validRows }
    } catch (error) {
      logger.error("Error parsing CSV:", error)
      throw error
    }
  }

  // Parse Excel data (simplified simulation)
  const parseExcel = (content: string): { headers: string[]; rows: any[] } => {
    // In a real app, you would use a library like xlsx
    // This is a simplified version that treats Excel content as CSV
    return parseCSV(content)
  }

  // Upload dataset with immediate auto-save
  const upload = async (file: File, content: string) => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }))

    try {
      const fileType = file.name.split(".").pop()?.toLowerCase()
      let parsedData

      if (fileType === "xlsx" || fileType === "xls") {
        parsedData = parseExcel(content)
      } else {
        parsedData = parseCSV(content)
      }

      const { headers, rows } = parsedData
      const datasetId = uuidv4()
      const uploadDate = new Date().toISOString()

      const newDataset: StoredDataset = {
        id: datasetId,
        name: file.name,
        filename: file.name,
        preview: rows,
        columns: headers,
        rows: rows.length,
        uploadDate,
        status: "processed",
        fileType: fileType || "unknown",
        fileSize: file.size,
      }

      autoSave({
        id: datasetId,
        preview: rows,
        columns: headers,
        filename: file.name,
      })

      saveToDatasetsList(newDataset)

      setState({
        id: datasetId,
        preview: rows,
        columns: headers,
        filename: file.name,
        isUploading: false,
        error: null,
      })

      logger.info("Dataset uploaded and auto-saved", {
        filename: file.name,
        rows: rows.length,
        columns: headers.length,
      })

      return { success: true, datasetId }
    } catch (error: any) {
      logger.error("Error uploading dataset:", error)
      setState((prev) => ({ ...prev, isUploading: false, error: error.message }))
      return { success: false, error: error.message }
    }
  }

  const getAllDatasets = useCallback((): StoredDataset[] => {
    try {
      const datasets = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATASETS_LIST) || "[]")
      return datasets
    } catch (error) {
      logger.error("Error getting datasets list:", error)
      return []
    }
  }, [])

  const loadDataset = useCallback(
    (datasetId: string) => {
      try {
        const datasets = getAllDatasets()
        const dataset = datasets.find((d) => d.id === datasetId)

        if (dataset) {
          setState({
            id: dataset.id,
            preview: dataset.preview,
            columns: dataset.columns,
            filename: dataset.filename,
            isUploading: false,
            error: null,
          })

          // Auto-save as current dataset
          autoSave({
            id: dataset.id,
            preview: dataset.preview,
            columns: dataset.columns,
            filename: dataset.filename,
          })

          logger.info("Dataset loaded", { filename: dataset.filename })
          return true
        }
        return false
      } catch (error) {
        logger.error("Error loading dataset:", error)
        return false
      }
    },
    [getAllDatasets, autoSave],
  )

  // Reset dataset
  const reset = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.DATASET_ID)
    localStorage.removeItem(STORAGE_KEYS.DATASET_PREVIEW)
    localStorage.removeItem(STORAGE_KEYS.DATASET_COLUMNS)
    localStorage.removeItem(STORAGE_KEYS.DATASET_FILENAME)

    // Reset state
    setState(initialState)
    logger.info("Dataset reset")
  }

  return {
    datasetId: state.id,
    preview: state.preview,
    columns: state.columns,
    filename: state.filename,
    isUploading: state.isUploading,
    error: state.error,
    upload,
    reset,
    getAllDatasets, // Added
    loadDataset, // Added
    autoSave, // Added
  }
}
