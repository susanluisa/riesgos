"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { TeamMember } from "../settings-model"
import { Edit, Loader2, Mail, Phone, Plus, Send, Shield, Trash2 } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

type TeamSettingsTabProps = {
  team: TeamMember[]
  newMember: Partial<TeamMember>
  setNewMember: Dispatch<SetStateAction<Partial<TeamMember>>>
  editingMember: TeamMember | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  isSending: boolean
  onAddMember: () => void
  onSaveEditedMember: () => void
  onEditMember: (member: TeamMember) => void
  onRemoveMember: (id: string) => void
  onToggleMemberStatus: (id: string) => void
  onCloseDialog: () => void
  onSaveSettings: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function TeamSettingsTab({
  team,
  newMember,
  setNewMember,
  editingMember,
  dialogOpen,
  setDialogOpen,
  isSending,
  onAddMember,
  onSaveEditedMember,
  onEditMember,
  onRemoveMember,
  onToggleMemberStatus,
  onCloseDialog,
  onSaveSettings,
  isSaving,
  hasUnsavedChanges,
}: TeamSettingsTabProps) {
  const handlePhoneChange = (value: string) => {
    let formatted = value.trim()
    if (formatted && !formatted.startsWith("+")) {
      formatted = "+" + formatted
    }
    setNewMember({ ...newMember, phone: formatted })
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      onCloseDialog()
    }
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
                <Button variant="outline" onClick={onCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => (editingMember ? onSaveEditedMember() : onAddMember())}
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
                  <Switch checked={member.isActive} onCheckedChange={() => onToggleMemberStatus(member.id)} />
                  <Button variant="ghost" size="icon" onClick={() => onEditMember(member)} className="text-blue-500 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveMember(member.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
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
        <Button onClick={onSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
