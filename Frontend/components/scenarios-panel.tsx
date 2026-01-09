"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Plus, Edit, Trash2, Eye, Search, FileX } from "lucide-react"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"

interface Scenario {
  id: string
  name: string
  description: string
  riskLevel: "low" | "medium" | "high" | "critical"
  category: string
  probability: number
  impact: number
  status: "active" | "inactive" | "archived"
  createdAt: string
  lastUpdated: string
}

export function ScenariosPanel() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("all")
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const savedScenarios = LocalStorage.get(STORAGE_KEYS.SCENARIOS, [])
    setScenarios(savedScenarios)
  }, [])

  const saveScenarios = (newScenarios: Scenario[]) => {
    setScenarios(newScenarios)
    LocalStorage.set(STORAGE_KEYS.SCENARIOS, newScenarios)
  }

  const handleDeleteScenario = (scenarioId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este escenario?")) {
      const updatedScenarios = scenarios.filter((s) => s.id !== scenarioId)
      saveScenarios(updatedScenarios)
    }
  }

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario)
    setIsEditDialogOpen(true)
  }

  const handleCreateScenario = (formData: FormData) => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      riskLevel: formData.get("riskLevel") as Scenario["riskLevel"],
      category: formData.get("category") as string,
      probability: Number.parseInt(formData.get("probability") as string),
      impact: Number.parseInt(formData.get("impact") as string),
      status: "active",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    const updatedScenarios = [...scenarios, newScenario]
    saveScenarios(updatedScenarios)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateScenario = (formData: FormData) => {
    if (!editingScenario) return

    const updatedScenario: Scenario = {
      ...editingScenario,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      riskLevel: formData.get("riskLevel") as Scenario["riskLevel"],
      category: formData.get("category") as string,
      probability: Number.parseInt(formData.get("probability") as string),
      impact: Number.parseInt(formData.get("impact") as string),
      lastUpdated: new Date().toISOString(),
    }

    const updatedScenarios = scenarios.map((s) => (s.id === editingScenario.id ? updatedScenario : s))
    saveScenarios(updatedScenarios)
    setIsEditDialogOpen(false)
    setEditingScenario(null)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case "critical":
        return "Crítico"
      case "high":
        return "Alto"
      case "medium":
        return "Medio"
      case "low":
        return "Bajo"
      default:
        return level
    }
  }

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch =
      scenario.name?.includes(searchTerm) ||
      scenario.description?.includes(searchTerm)
    const matchesCategory = filterCategory === "all" || scenario.category === filterCategory
    const matchesRiskLevel = filterRiskLevel === "all" || scenario.riskLevel === filterRiskLevel

    return matchesSearch && matchesCategory && matchesRiskLevel
  })

  const categories = Array.from(new Set(scenarios.map((s) => s.category)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Escenarios de Riesgo</h2>
          <p className="text-muted-foreground">Gestione y analice diferentes escenarios de riesgo ocupacional</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Escenario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Escenario</DialogTitle>
              <DialogDescription>Defina un nuevo escenario de riesgo para análisis y seguimiento</DialogDescription>
            </DialogHeader>
            <form action={handleCreateScenario} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Escenario</Label>
                  <Input id="name" placeholder="Ej: Trabajo en alturas..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seguridad Industrial">Seguridad Industrial</SelectItem>
                      <SelectItem value="Salud Ocupacional">Salud Ocupacional</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Bienestar Laboral">Bienestar Laboral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describa detalladamente el escenario de riesgo..." rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidad (%)</Label>
                  <Input id="probability" type="number" min="0" max="100" placeholder="0-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impacto (%)</Label>
                  <Input id="impact" type="number" min="0" max="100" placeholder="0-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                  <Select name="riskLevel">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Escenario</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar escenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Bajo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {filteredScenarios.length === 0 ? (
            <Card className="p-8 text-center">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay escenarios de riesgo</h3>
              <p className="text-muted-foreground mb-4">
                {scenarios.length === 0
                  ? "Comience creando su primer escenario de riesgo para análisis."
                  : "No se encontraron escenarios que coincidan con los filtros aplicados."}
              </p>
              {scenarios.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Escenario
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{scenario.name}</CardTitle>
                        <CardDescription className="mt-1">{scenario.category}</CardDescription>
                      </div>
                      <Badge className={getRiskLevelColor(scenario.riskLevel)}>
                        {getRiskLevelText(scenario.riskLevel)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{scenario.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Probabilidad:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${scenario.probability}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">{scenario.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Impacto:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${scenario.impact}%` }} />
                          </div>
                          <span className="ml-2 text-xs">{scenario.impact}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Actualizado: {new Date(scenario.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(scenario)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditScenario(scenario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteScenario(scenario.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          {filteredScenarios.length === 0 ? (
            <Card className="p-8 text-center">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay escenarios de riesgo</h3>
              <p className="text-muted-foreground mb-4">
                {scenarios.length === 0
                  ? "Comience creando su primer escenario de riesgo para análisis."
                  : "No se encontraron escenarios que coincidan con los filtros aplicados."}
              </p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-medium">Escenario</th>
                        <th className="text-left p-4 font-medium">Categoría</th>
                        <th className="text-left p-4 font-medium">Riesgo</th>
                        <th className="text-left p-4 font-medium">Probabilidad</th>
                        <th className="text-left p-4 font-medium">Impacto</th>
                        <th className="text-left p-4 font-medium">Estado</th>
                        <th className="text-left p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScenarios.map((scenario) => (
                        <tr key={scenario.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{scenario.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{scenario.description}</div>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{scenario.category}</td>
                          <td className="p-4">
                            <Badge className={getRiskLevelColor(scenario.riskLevel)}>
                              {getRiskLevelText(scenario.riskLevel)}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{scenario.probability}%</td>
                          <td className="p-4 text-sm">{scenario.impact}%</td>
                          <td className="p-4">
                            <Badge variant={scenario.status === "active" ? "default" : "secondary"}>
                              {scenario.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(scenario)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditScenario(scenario)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteScenario(scenario.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {selectedScenario?.name}
            </DialogTitle>
            <DialogDescription>Detalles completos del escenario de riesgo</DialogDescription>
          </DialogHeader>
          {selectedScenario && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Categoría</Label>
                  <p className="text-sm text-muted-foreground">{selectedScenario.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nivel de Riesgo</Label>
                  <div className="mt-1">
                    <Badge className={getRiskLevelColor(selectedScenario.riskLevel)}>
                      {getRiskLevelText(selectedScenario.riskLevel)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedScenario.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Probabilidad</Label>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${selectedScenario.probability}%` }}
                      />
                    </div>
                    <span className="ml-3 text-sm font-medium">{selectedScenario.probability}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Impacto</Label>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-red-600 h-3 rounded-full" style={{ width: `${selectedScenario.impact}%` }} />
                    </div>
                    <span className="ml-3 text-sm font-medium">{selectedScenario.impact}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Fecha de Creación</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedScenario.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Actualización</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedScenario.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedScenario(null)}>
                  Cerrar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Escenario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Escenario</DialogTitle>
            <DialogDescription>Modifique los detalles del escenario de riesgo</DialogDescription>
          </DialogHeader>
          {editingScenario && (
            <form action={handleUpdateScenario} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Escenario</Label>
                  <Input id="edit-name" name="name" defaultValue={editingScenario.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Select name="category" defaultValue={editingScenario.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seguridad Industrial">Seguridad Industrial</SelectItem>
                      <SelectItem value="Salud Ocupacional">Salud Ocupacional</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Bienestar Laboral">Bienestar Laboral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingScenario.description}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-probability">Probabilidad (%)</Label>
                  <Input
                    id="edit-probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingScenario.probability}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-impact">Impacto (%)</Label>
                  <Input
                    id="edit-impact"
                    name="impact"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingScenario.impact}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-riskLevel">Nivel de Riesgo</Label>
                  <Select name="riskLevel" defaultValue={editingScenario.riskLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Escenario</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
