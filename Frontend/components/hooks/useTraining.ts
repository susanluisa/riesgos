"use client"

import { useState, useCallback } from "react"
import { useDataset } from "@/components/hooks/useDataset"
import { toast } from "@/hooks/use-toast"

export interface TrainingResult {
  accuracy: number; f1: number; precision: number; recall: number
  auc?: number; oobScore?: number; trainingTime: number; modelName: string
  nEstimators: number; maxDepth?: number; testSize: number; useSmote: boolean
}

export type StartOptions = {
  targetColumn: string
  useSmote: boolean
  nEstimators: number
  testSize: number
  standardize?: boolean
}

type Status = "disabled" | "pending" | "training" | "completed" | "error"

export function useTraining() {
  const { preview, columns } = useDataset()
  const [status, setStatus] = useState<Status>("disabled")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<TrainingResult | null>(null)

  const start = useCallback( async (opts?: Partial<StartOptions>) => {
    try {
      if (!preview || preview.length === 0) {
        toast({ title: "No hay datos", description: "Sube un dataset antes de entrenar." })
        return
      }
      setStatus("training"); setProgress(10)
      const t0 = performance.now()

      const safeTarget = opts?.targetColumn ?? (Array.isArray(columns) && columns.length ? columns[columns.length-1] : null)
      if (!safeTarget) {
        toast({ title: "Falta variable objetivo", description: "Selecciona la columna a predecir.", variant: "destructive" })
        setStatus("disabled")
        return
      }
      const nEstimators = Number(opts?.nEstimators ?? 100)
      const testSize = Number(opts?.testSize ?? 0.2)
      const useSmote = Boolean(opts?.useSmote ?? false)
      const standardize = Boolean(opts?.standardize ?? false)

      const resp = await fetch("/api/trainPersist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: preview,
          columns,
          target: safeTarget,
          options: { nEstimators, useSmote, testSize, standardize }
        })
      })
      if (!resp.ok) {
        const e = await resp.json().catch(()=>({error:"Error"}))
        throw new Error(e.error || "Error entrenando el modelo")
      }
      setProgress(80)
      const data = await resp.json(); const t1 = performance.now()
      const m = data.metrics ?? {}
      setResult({
        accuracy: m.accuracy ?? 0,
        f1: m.f1_macro ?? 0,
        precision: m.precision_macro ?? 0,
        recall: m.recall_macro ?? 0,
        auc: m.aucROC,
        oobScore: 0,
        trainingTime: Number(((t1 - t0)/1000).toFixed(1)),
        modelName: "Random Forest",
        nEstimators: data.options?.nEstimators ?? nEstimators,
        maxDepth: undefined,
        testSize: data.options?.testSize ?? testSize,
        useSmote: data.options?.useSmote ?? useSmote
      })
      setProgress(100); setStatus("completed")
      toast({ title: "Entrenamiento guardado", description: "Modelo entrenado y persistido correctamente." })
    } catch (error: any) {
      setStatus("error")
      toast({ title: "Error de entrenamiento", description: error?.message ?? String(error), variant: "destructive" })
    }
  }, [preview, columns])

  const reset = useCallback(() => { setStatus("disabled"); setProgress(0); setResult(null) }, [])

  return { status, progress, result, start, reset, isTraining: status === "training", trainingCompleted: status === "completed", trainingError: status === "error" }
}
