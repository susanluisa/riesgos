"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Laptop, Moon, Sun } from "lucide-react"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { logger } from "@/lib/logger"
import { Settings, defaultSettings } from "../settings-model"

const GENERAL_SETTINGS_QUERY_KEY = ["settings", "general"]

export function GeneralSettingsTab() {
  const queryClient = useQueryClient()
  const { setTheme } = useTheme()
  const [draft, setDraft] = useState<Settings["general"]>(defaultSettings.general)

  const { data: storedGeneral, isLoading } = useQuery<Settings["general"]>({
    queryKey: GENERAL_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const stored = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      return stored.general
    },
  })

  useEffect(() => {
    if (storedGeneral) {
      setDraft(storedGeneral)
      setTheme(storedGeneral.theme)
    }
  }, [storedGeneral, setTheme])

  const saveMutation = useMutation({
    mutationFn: async (next: Settings["general"]) => {
      const current = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const updated = { ...current, general: next }
      LocalStorage.set(STORAGE_KEYS.SETTINGS, updated)
      return next
    },
    onSuccess: (data) => {
      queryClient.setQueryData(GENERAL_SETTINGS_QUERY_KEY, data)
      setTheme(data.theme)
      toast({
        title: "Configuraciones guardadas",
        description: "Preferencias generales actualizadas.",
      })
    },
    onError: (err) => {
      logger.error("Error guardando configuraciones generales:", err)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones generales.",
        variant: "destructive",
      })
    },
  })

  const hasUnsavedChanges = useMemo(() => {
    if (!storedGeneral) return false
    return JSON.stringify(draft) !== JSON.stringify(storedGeneral)
  }, [draft, storedGeneral])

  const handleChange = (changes: Partial<Settings["general"]>) => {
    setDraft((prev) => ({
      ...prev,
      ...changes,
    }))
  }

  if (isLoading && !storedGeneral) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Generales</CardTitle>
          <CardDescription>Cargando preferencias...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuraciones Generales</CardTitle>
        <CardDescription>Gestiona tus preferencias generales de la aplicacion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input id="company-name" value={draft.companyName} onChange={(e) => handleChange({ companyName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={draft.language} onValueChange={(value) => handleChange({ language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Espanol">Espanol</SelectItem>
                <SelectItem value="Ingles">Ingles</SelectItem>
                <SelectItem value="Frances">Frances</SelectItem>
                <SelectItem value="Aleman">Aleman</SelectItem>
                <SelectItem value="Chino">Chino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zona Horaria</Label>
            <Select value={draft.timezone} onValueChange={(value) => handleChange({ timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
                <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokio (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-save">Guardado Automatico</Label>
            <p className="text-sm text-muted-foreground">Guardar cambios automaticamente mientras trabajas</p>
          </div>
          <Switch id="auto-save" checked={draft.autoSave} onCheckedChange={(checked) => handleChange({ autoSave: checked })} />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Tema</Label>
          <div className="flex items-center space-x-4">
            <Button
              variant={draft.theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => handleChange({ theme: "light" })}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={draft.theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => handleChange({ theme: "dark" })}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button
              variant={draft.theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => handleChange({ theme: "system" })}
              className="flex items-center gap-2"
            >
              <Laptop className="h-4 w-4" />
              Sistema
            </Button>
          </div>
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
