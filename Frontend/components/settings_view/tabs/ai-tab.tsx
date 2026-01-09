"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"
import { Settings, defaultSettings } from "../settings-model"

const AI_SETTINGS_QUERY_KEY = ["settings", "ai"]

export function AiSettingsTab() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Settings["ai"]>(defaultSettings.ai)

  const { data: storedAi, isLoading } = useQuery<Settings["ai"]>({
    queryKey: AI_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const stored = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      return stored.ai
    },
  })

  useEffect(() => {
    if (storedAi) {
      setDraft(storedAi)
    }
  }, [storedAi])

  const saveMutation = useMutation({
    mutationFn: async (next: Settings["ai"]) => {
      const current = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const updated = { ...current, ai: next }
      LocalStorage.set(STORAGE_KEYS.SETTINGS, updated)
      return next
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AI_SETTINGS_QUERY_KEY, data)
      toast({
        title: "Configuraciones guardadas",
        description: "Preferencias de IA actualizadas.",
      })
    },
    onError: (err) => {
      logger.error("Error guardando configuraciones IA:", err)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de IA.",
        variant: "destructive",
      })
    },
  })

  const hasUnsavedChanges = useMemo(() => {
    if (!storedAi) return false
    return JSON.stringify(draft) !== JSON.stringify(storedAi)
  }, [draft, storedAi])

  const handleChange = (changes: Partial<Settings["ai"]>) => {
    setDraft((prev) => ({
      ...prev,
      ...changes,
    }))
  }

  if (isLoading && !storedAi) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuracion IA</CardTitle>
          <CardDescription>Cargando preferencias...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion IA</CardTitle>
        <CardDescription>Ajusta las preferencias del modelo de IA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="model-explanations">Explicaciones del modelo</Label>
                <p className="text-sm text-muted-foreground">Mostrar explicaciones de las predicciones</p>
              </div>
              <Switch
                id="model-explanations"
                checked={draft.modelExplanations}
                onCheckedChange={(checked) => handleChange({ modelExplanations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-tuning">Auto ajuste</Label>
                <p className="text-sm text-muted-foreground">Optimizar parametros automaticamente</p>
              </div>
              <Switch id="auto-tuning" checked={draft.autoTuning} onCheckedChange={(checked) => handleChange({ autoTuning: checked })} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-importance">Importancia de caracteristicas</Label>
                <p className="text-sm text-muted-foreground">Mostrar importancia de variables</p>
              </div>
              <Switch
                id="feature-importance"
                checked={draft.featureImportance}
                onCheckedChange={(checked) => handleChange({ featureImportance: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Umbral de confianza</Label>
              <Input
                id="confidence-threshold"
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={draft.confidenceThreshold}
                onChange={(e) => handleChange({ confidenceThreshold: Number.parseFloat(e.target.value) || 0.8 })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retraining-frequency">Frecuencia de reentrenamiento</Label>
          <Select value={draft.retrainingFrequency} onValueChange={(value) => handleChange({ retrainingFrequency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending || !hasUnsavedChanges}>
          {saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
