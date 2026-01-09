"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { LocalStorage } from "@/lib/storage"
import { logger } from "@/lib/logger"
import {
  UserCreateInput,
  UserType,
  useCreateUserMutation,
  useTeamQuery,
  useUpdateUserMutation,
  UserUpdateInput,
  UserRole,
} from "@/app/settings/features/services/team"
import { TeamMember, buildEmptyMemberForm, defaultSettings } from "../settings-model"
import { Edit, Loader2, Mail, Phone, Plus, Send, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function TeamSettingsTab() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<Partial<TeamMember>>(buildEmptyMemberForm())
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { data: teamData, isLoading, isFetching, refetch } = useTeamQuery({ auth: true })
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()

  const mappedTeam = useMemo(() => {
    if (teamData && Array.isArray(teamData)) {
      return teamData.map(mapUserToTeamMember)
    }
    const stored = LocalStorage.get<TeamMember[]>("TEAM_SETTINGS", defaultSettings.team)
    return stored
  }, [teamData])

  useEffect(() => {
    setTeam(mappedTeam)
    LocalStorage.set("TEAM_SETTINGS", mappedTeam)
  }, [mappedTeam])

  const resetMemberForm = () => setNewMember(buildEmptyMemberForm())

  const closeMemberDialog = () => {
    setDialogOpen(false)
    setEditingMember(null)
    resetMemberForm()
  }

  const handlePhoneChange = (value: string) => {
    let formatted = value.trim()
    if (formatted && !formatted.startsWith("+")) {
      formatted = "+" + formatted
    }
    setNewMember((prev) => ({ ...prev, phone: formatted }))
  }

  const persistTeam = (next: TeamMember[]) => {
    setTeam(next)
    LocalStorage.set("TEAM_SETTINGS", next)
  }

  // const addMember = async () => {
  //   if (!newMember.name || !newMember.email) {
  //     toast({
  //       title: "Error",
  //       description: "Por favor ingresa nombre y email.",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   try {
  //     setIsSending(true)
  //     const payload: Partial<UserType> = {
  //       username: newMember.email || newMember.name || "",
  //       email: newMember.email || "",
  //       first_name: newMember.name?.split(" ")[0] ?? "",
  //       last_name: newMember.name?.split(" ").slice(1).join(" ") ?? "",
  //       is_active: newMember.isActive ?? true,
  //     }

  //     const created = await createUserMutation.mutateAsync(payload)
  //     const memberToAdd = mapUserToTeamMember(created)

  //     persistTeam([...team, memberToAdd])
  //     resetMemberForm()
  //     closeMemberDialog()

  //     toast({
  //       title: "Miembro agregado",
  //       description: `${memberToAdd.name} ha sido agregado al equipo.`,
  //     })
  //   } catch (error) {
  //     logger.error("Error creando miembro:", error)
  //     toast({
  //       title: "Error",
  //       description: "No se pudo crear el miembro. Intentalo de nuevo.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsSending(false)
  //   }
  // }
  const addMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Por favor ingresa nombre y email.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)

      const payload: UserCreateInput = {
        username: newMember.email || newMember.name || "",
        password: "password123",
        full_name: newMember.name?.trim() || "",
        email: newMember.email || "",
        phone: newMember.phone || undefined,
        role: normalizeRole(newMember.role),
        department: newMember.department || "Seguridad Industrial",
        is_emergency_contact: newMember.emergencyContact ?? false,
        is_active: newMember.isActive ?? true,
      }

      const created = await createUserMutation.mutateAsync(payload)

      const memberToAdd = mapUserToTeamMember(created)

      persistTeam([...team, memberToAdd])
      resetMemberForm()
      closeMemberDialog()

      toast({
        title: "Miembro agregado",
        description: `${memberToAdd.name} ha sido agregado al equipo.`,
      })
    } catch (error) {
      logger.error("Error creando miembro:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }


  const handleToggleMemberStatus = (memberId: string) => {
    const numericId = Number(memberId)
    const member = team.find((m) => m.id === memberId)
    if (!member) return
    const nextStatus = !member.isActive
    updateUserMutation
      .mutateAsync({ id: numericId, data: { is_active: nextStatus } })
      .then(() => {
        const nextTeam = team.map((m) => (m.id === memberId ? { ...m, isActive: nextStatus } : m))
        persistTeam(nextTeam)
      })
      .catch((error) => {
        logger.error("Error cambiando estado miembro:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del miembro.",
          variant: "destructive",
        })
      })
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      isActive: member.isActive,
      notificationPreferences: { ...member.notificationPreferences },
      emergencyContact: member.emergencyContact,
    })
    setDialogOpen(true)
  }

  const handleSaveEditedMember = async () => {
    if (!editingMember || !newMember.name || !newMember.email || !newMember.phone || !newMember.role) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)

      const numericId = Number(editingMember.id)
      const payload: UserUpdateInput = {
        full_name: newMember.name?.trim() ?? editingMember.name,
        phone: newMember.phone ?? editingMember.phone,
        department: newMember.department ?? editingMember.department,
        role: normalizeRole(newMember.role ?? editingMember.role),
        is_emergency_contact: newMember.emergencyContact ?? editingMember.emergencyContact,
        is_active: newMember.isActive ?? editingMember.isActive,
      }

      const updated = await updateUserMutation.mutateAsync({ id: numericId, data: payload })
      const updatedMember: TeamMember = mapUserToTeamMember(updated)

      const nextTeam = team.map((member) => (member.id === editingMember.id ? updatedMember : member))
      persistTeam(nextTeam)

      toast({
        title: "Miembro actualizado",
        description: `${updatedMember.name} ha sido actualizado exitosamente.`,
      })

      closeMemberDialog()
    } catch (error) {
      logger.error("Error actualizando miembro:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el miembro. Intentalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      closeMemberDialog()
    }
  }

  if (isLoading && team.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipo de Seguridad</CardTitle>
          <CardDescription>Cargando equipo...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Equipo de Seguridad</CardTitle>
            <CardDescription>Gestiona los miembros del equipo y sus responsabilidades.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMember ? "Editar Miembro del Equipo" : "Agregar Miembro del Equipo"}</DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Modifica la informacion del miembro del equipo de seguridad industrial."
                    : "Agrega un nuevo miembro al equipo de seguridad industrial."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Informacion del Miembro</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">
                        Nombre Completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-name"
                        value={newMember.name || ""}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Juan Perez"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newMember.email || ""}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="juan@empresa.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-phone">
                        Telefono <span className="text-red-500">*</span> (con codigo pais)
                      </Label>
                      <Input
                        id="new-phone"
                        value={newMember.phone || ""}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+56912345678"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Formato: +56912345678 (incluir codigo de pais)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-role">
                        Rol <span className="text-red-500">*</span>
                      </Label>
                      <Select value={newMember.role || ""} onValueChange={(value) => setNewMember({ ...newMember, role: value })} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jefe de Seguridad">Jefe de Seguridad</SelectItem>
                          <SelectItem value="Supervisor de Seguridad">Supervisor de Seguridad</SelectItem>
                          <SelectItem value="Coordinador de Emergencias">Coordinador de Emergencias</SelectItem>
                          <SelectItem value="Especialista en Riesgos">Especialista en Riesgos</SelectItem>
                          <SelectItem value="Inspector de Seguridad">Inspector de Seguridad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-department">Departamento</Label>
                    <Input
                      id="new-department"
                      value={newMember.department || ""}
                      onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                      placeholder="Seguridad Industrial"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-emergency">Contacto de Emergencia</Label>
                    <Switch
                      id="new-emergency"
                      checked={newMember.emergencyContact || false}
                      onCheckedChange={(checked) => setNewMember({ ...newMember, emergencyContact: checked })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2 pt-4">
                <Button variant="outline" onClick={dialogOpen ? closeMemberDialog : resetMemberForm}>
                  {dialogOpen ? "Cancelar" : "Limpiar"}
                  Cancelar
                </Button>
                <Button
                  onClick={() => (editingMember ? handleSaveEditedMember() : addMember())}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingMember ? "Guardando..." : "Agregando..."}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {editingMember ? "Guardar Cambios" : "Agregar y Enviar"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.map((member) => (
            <div key={member.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      {member.emergencyContact && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Emergencia
                        </Badge>
                      )}
                      <Badge variant={member.isActive ? "default" : "secondary"}>{member.isActive ? "Activo" : "Inactivo"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </div>
                    )}
                  </div>
                  <Switch checked={member.isActive} onCheckedChange={() => handleToggleMemberStatus(member.id)} />
                  <Button variant="ghost" size="icon" onClick={() => handleEditMember(member)} className="text-blue-500 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preferencias de notificacion:</span>
                  <div className="flex gap-2">
                    {member.notificationPreferences.email && (
                      <Badge variant="outline" className="text-xs">
                        Email
                      </Badge>
                    )}
                    {member.notificationPreferences.sms && (
                      <Badge variant="outline" className="text-xs">
                        SMS
                      </Badge>
                    )}
                    {member.notificationPreferences.push && (
                      <Badge variant="outline" className="text-xs">
                        Push
                      </Badge>
                    )}
                    {member.notificationPreferences.criticalOnly && (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                        Solo Criticas
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Ultima actividad:</span>
                  <span className="text-xs">{new Date(member.lastActive).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => refetch()} disabled={isFetching} className={cn(isFetching && "cursor-not-allowed")}>
          {isFetching ? "Actualizando..." : "Refrescar equipo"}
        </Button>
      </CardFooter>
    </Card>
  )
}

const mapUserToTeamMember = (user: UserType): TeamMember => ({
  id: String(user.id),
  name: user.full_name || user.username || "Sin nombre",
  email: user.email,
  phone: user.phone || "",
  role: user.role || "Miembro",
  department: user.department || "Seguridad Industrial",
  isActive: user.is_active,
  notificationPreferences: {
    email: true,
    sms: false,
    push: true,
    criticalOnly: false,
  },
  emergencyContact: false,
  lastActive: new Date(user.created_at || user.updated_at || new Date().toISOString()),
})

const normalizeRole = (role?: string | null): UserRole | undefined => {
  if (!role) return undefined
  const value = role.toLowerCase().trim()
  if (value === "admin") return "admin"
  if (value === "supervisor") return "supervisor"
  if (value === "seguridad") return "seguridad"
  return undefined
}
