"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, User, LogOut, Menu, X } from "lucide-react"
import { cn, LocalStorage, STORAGE_KEYS } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Análisis", href: "/analysis" },
  { name: "Predicción", href: "/prediction" },
  { name: "Reportes", href: "/reports" },
  { name: "Documentos", href: "/documents" },
  // { name: "Asistente", href: "/assistant" },
  { name: "Configuración", href: "/settings" },
]

export function MainHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const notificationsData = LocalStorage.get(STORAGE_KEYS.NOTIFICATIONS, [])
  const notifications = Array.isArray(notificationsData) ? notificationsData : []
  const unreadCount = notifications.filter((n: any) => !n.read).length

  const handleNotificationsClick = () => {
    setNotificationsOpen(true)
  }

  const handleProfileClick = () => {
    setProfileOpen(true)
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleLogout = () => {
    // Clear user session data
    LocalStorage.remove(STORAGE_KEYS.USER_SESSION)
    LocalStorage.remove(STORAGE_KEYS.USER_PREFERENCES)

    // Show logout confirmation
    alert("Sesión cerrada exitosamente")

    // Redirect to home or login page
    router.push("/")
  }

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map((n: any) => (n.id === id ? { ...n, read: true } : n))
    LocalStorage.set(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
    setNotificationsOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded" />
              <span className="hidden font-bold sm:inline-block">RiskML</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link href="/" className="flex items-center space-x-2 md:hidden">
                <div className="h-6 w-6 bg-primary rounded" />
                <span className="font-bold">RiskML</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative" onClick={handleNotificationsClick}>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@usuario" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Usuario</p>
                      <p className="text-xs leading-none text-muted-foreground">usuario@empresa.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <nav className="flex flex-col space-y-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 text-sm transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
            <DialogDescription>Tienes {unreadCount} notificaciones sin leer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tienes notificaciones</p>
            ) : (
              notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    notification.read ? "bg-muted/50" : "bg-background border-primary/20",
                  )}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleString("es-ES")}
                      </p>
                    </div>
                    {!notification.read && <div className="h-2 w-2 bg-primary rounded-full mt-1" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil de Usuario</DialogTitle>
            <DialogDescription>Información de tu cuenta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/avatars/01.png" alt="@usuario" />
                <AvatarFallback className="text-lg">U</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">Usuario</h3>
                <p className="text-sm text-muted-foreground">usuario@empresa.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Rol</label>
                <p className="text-sm text-muted-foreground">Administrador de Riesgos</p>
              </div>
              <div>
                <label className="text-sm font-medium">Departamento</label>
                <p className="text-sm text-muted-foreground">Seguridad y Salud Ocupacional</p>
              </div>
              <div>
                <label className="text-sm font-medium">Último acceso</label>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleString("es-ES")}</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setProfileOpen(false)
                router.push("/settings")
              }}
            >
              Editar Perfil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
