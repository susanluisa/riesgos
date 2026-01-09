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

const SECURITY_SETTINGS_QUERY_KEY = ["settings", "security"]

export function SecuritySettingsTab() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Settings["security"]>(defaultSettings.security)

  const { data: storedSecurity, isLoading } = useQuery<Settings["security"]>({
    queryKey: SECURITY_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const stored = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      return stored.security
    },
  })

  useEffect(() => {
    if (storedSecurity) {
      setDraft(storedSecurity)
    }
  }, [storedSecurity])

  const saveMutation = useMutation({
    mutationFn: async (next: Settings["security"]) => {
      const current = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const updated = { ...current, security: next }
      LocalStorage.set(STORAGE_KEYS.SETTINGS, updated)
      return next
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SECURITY_SETTINGS_QUERY_KEY, data)
      toast({
        title: "Configuraciones guardadas",
        description: "Preferencias de seguridad actualizadas.",
      })
    },
    onError: (err) => {
      logger.error("Error guardando seguridad:", err)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de seguridad.",
        variant: "destructive",
      })
    },
  })

  const hasUnsavedChanges = useMemo(() => {
    if (!storedSecurity) return false
    return JSON.stringify(draft) !== JSON.stringify(storedSecurity)
  }, [draft, storedSecurity])

  const handleChange = (changes: Partial<Settings["security"]>) => {
    setDraft((prev) => ({
      ...prev,
      ...changes,
    }))
  }

  if (isLoading && !storedSecurity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Cargando preferencias...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>Configura la seguridad de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Autenticacion de Dos Factores</Label>
              <p className="text-sm text-muted-foreground">Protege tu cuenta con 2FA</p>
            </div>
            <Switch id="two-factor" checked={draft.twoFactorAuth} onCheckedChange={(checked) => handleChange({ twoFactorAuth: checked })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tiempo de Sesion (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="240"
              value={draft.sessionTimeout}
              onChange={(e) => handleChange({ sessionTimeout: Number.parseInt(e.target.value, 10) || 30 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-encryption">Cifrado de Datos</Label>
              <p className="text-sm text-muted-foreground">Cifrar datos sensibles en reposo</p>
            </div>
            <Switch id="data-encryption" checked={draft.dataEncryption} onCheckedChange={(checked) => handleChange({ dataEncryption: checked })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-policy">Politica de Contrasenas</Label>
            <Select value={draft.passwordPolicy} onValueChange={(value) => handleChange({ passwordPolicy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-whitelist">Lista Blanca de IPs</Label>
            <Input
              id="ip-whitelist"
              placeholder="192.168.1.1, 10.0.0.1"
              value={draft.ipWhitelist.join(", ")}
              onChange={(e) =>
                handleChange({
                  ipWhitelist: e.target.value
                    .split(",")
                    .map((ip) => ip.trim())
                    .filter(Boolean),
                })
              }
            />
            <p className="text-xs text-muted-foreground">Separar por comas</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audit-log">Registro de Auditoria</Label>
              <p className="text-sm text-muted-foreground">Guardar log de actividades</p>
            </div>
            <Switch id="audit-log" checked={draft.auditLog} onCheckedChange={(checked) => handleChange({ auditLog: checked })} />
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
