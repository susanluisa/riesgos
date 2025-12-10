"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiSettingsTab } from "./tabs/ai-tab"
import { GeneralSettingsTab } from "./tabs/general-tab"
import { NotificationsSettingsTab } from "./tabs/notifications-tab"
import { SecuritySettingsTab } from "./tabs/security-tab"
import { TeamSettingsTab } from "./tabs/team-tab"

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuraciones</h2>
        <p className="text-muted-foreground">Gestiona la configuracion de tu cuenta y preferencias.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="ai">Configuracion IA</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettingsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab />
        </TabsContent>

        <TabsContent value="ai">
          <AiSettingsTab />
        </TabsContent>

        <TabsContent value="team">
          <TeamSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
