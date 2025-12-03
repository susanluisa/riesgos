import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercentage(num: number, decimals = 1): string {
  return `${(num * 100).toFixed(decimals)}%`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-$$$$]{8,}$/
  return phoneRegex.test(phone)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getRiskColor(risk: number): string {
  if (risk >= 0.8) return "text-red-600"
  if (risk >= 0.6) return "text-orange-600"
  if (risk >= 0.4) return "text-yellow-600"
  return "text-green-600"
}

export function getRiskBadgeColor(risk: number): string {
  if (risk >= 0.8) return "bg-red-100 text-red-800 border-red-200"
  if (risk >= 0.6) return "bg-orange-100 text-orange-800 border-orange-200"
  if (risk >= 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-green-100 text-green-800 border-green-200"
}

export const STORAGE_KEYS = {
  SCENARIOS: "risk_scenarios",
  PREDICTIONS: "risk_predictions",
  DATASETS: "uploaded_datasets",
  SETTINGS: "app_settings",
  REAL_TIME_DATA: "real_time_data",
  RECOMMENDATIONS: "recommendations",
  INCIDENTS: "incidents",
  COMPLIANCE: "compliance_data",
  TRAINING_HISTORY: "training_history",
  USER_PREFERENCES: "user_preferences",
} as const

export class LocalStorage {
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") return false

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
      return false
    }
  }

  static remove(key: string): boolean {
    if (typeof window === "undefined") return false

    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      return false
    }
  }

  static clear(): boolean {
    if (typeof window === "undefined") return false

    try {
      window.localStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing localStorage:", error)
      return false
    }
  }

  static exists(key: string): boolean {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(key) !== null
  }

  static getSize(): number {
    if (typeof window === "undefined") return 0

    let total = 0
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length
      }
    }
    return total
  }
}

// === Helpers añadidos (seguros) ===
export const toLowerSafe = (v: unknown): string =>
  typeof v === "string" ? v.toLowerCase() : String(v ?? "").toLowerCase();

export const includesSafe = (source: unknown, q: unknown): boolean =>
  toLowerSafe(source).includes(toLowerSafe(q));

export function toArraySafe<T = any>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (!v) return [];
  const anyV: any = v as any;
  if (Array.isArray(anyV.items)) return anyV.items as T[];
  if (Array.isArray(anyV.data)) return anyV.data as T[];
  if (typeof anyV === "object") return Object.values(anyV) as T[];
  return [];
}

