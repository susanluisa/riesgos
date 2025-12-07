"use client"

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  isActive: boolean
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    criticalOnly: boolean
  }
  emergencyContact: boolean
  lastActive: Date
}

export interface Settings {
  general: {
    language: string
    autoSave: boolean
    theme: string
    companyName: string
    timezone: string
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    modelTrainingUpdates: boolean
    securityAlerts: boolean
    criticalOnly: boolean
    autoSendToResponsibles: boolean
    sendToAll: boolean
    soundEnabled: boolean
    desktopNotifications: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    dataEncryption: boolean
    passwordPolicy: string
    ipWhitelist: string[]
    auditLog: boolean
  }
  ai: {
    modelExplanations: boolean
    autoTuning: boolean
    featureImportance: boolean
    confidenceThreshold: number
    retrainingFrequency: string
  }
  team: TeamMember[]
}

export const defaultNotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  criticalOnly: false,
}

export const defaultSettings: Settings = {
  general: {
    language: "Espanol",
    autoSave: true,
    theme: "system",
    companyName: "Mi Empresa",
    timezone: "America/Santiago",
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    modelTrainingUpdates: true,
    securityAlerts: true,
    criticalOnly: false,
    autoSendToResponsibles: true,
    sendToAll: false,
    soundEnabled: true,
    desktopNotifications: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataEncryption: true,
    passwordPolicy: "medium",
    ipWhitelist: [],
    auditLog: true,
  },
  ai: {
    modelExplanations: true,
    autoTuning: false,
    featureImportance: true,
    confidenceThreshold: 0.8,
    retrainingFrequency: "weekly",
  },
  team: [
    {
      id: "user-001",
      name: "Cristian Omar",
      email: "cristianomar@gmail.com",
      phone: "+56912345678",
      role: "Jefe de Seguridad",
      department: "Seguridad Industrial",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: true,
      lastActive: new Date(),
    },
    {
      id: "user-002",
      name: "Maria Lopez",
      email: "mlopez@empresa.com",
      phone: "+56987654321",
      role: "Supervisor de Seguridad",
      department: "Seguridad Industrial",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: true,
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "user-003",
      name: "Carlos Rodriguez",
      email: "crodriguez@empresa.com",
      phone: "+56911223344",
      role: "Coordinador de Emergencias",
      department: "Emergencias",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        criticalOnly: true,
      },
      emergencyContact: true,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
}

export const buildEmptyMemberForm = (): Partial<TeamMember> => ({
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  isActive: true,
  notificationPreferences: { ...defaultNotificationPreferences },
  emergencyContact: false,
})

export const createMemberPayload = (form: Partial<TeamMember>, base?: TeamMember): TeamMember => ({
  id: base?.id ?? `member-${Date.now()}`,
  name: form.name?.trim() || base?.name || "",
  email: form.email?.trim() || base?.email || "",
  phone: form.phone?.trim() || base?.phone || "+56900000000",
  role: form.role?.trim() || base?.role || "Miembro del Equipo",
  department: form.department?.trim() || base?.department || "Seguridad",
  isActive: form.isActive ?? base?.isActive ?? true,
  notificationPreferences: form.notificationPreferences
    ? { ...form.notificationPreferences }
    : base?.notificationPreferences
      ? { ...base.notificationPreferences }
      : { ...defaultNotificationPreferences },
  emergencyContact: form.emergencyContact ?? base?.emergencyContact ?? false,
  lastActive: new Date(),
})
