import { logger } from "./logger"

/**
 * Configuración de almacenamiento local
 */
interface StorageConfig {
  type: "localStorage" | "fileSystem" | "database"
  path?: string
  autoBackup?: boolean
  backupInterval?: number // minutos
}

/**
 * Configuración por defecto
 */
const defaultConfig: StorageConfig = {
  type: "localStorage",
  autoBackup: true,
  backupInterval: 30, // 30 minutos
}

/**
 * Clase para manejar el almacenamiento local con localStorage
 */
export class LocalStorage {
  private static config: StorageConfig = defaultConfig

  /**
   * Configura el tipo de almacenamiento
   */
  static configure(config: Partial<StorageConfig>): void {
    this.config = { ...defaultConfig, ...config }
    logger.info("Configuración de almacenamiento actualizada:", this.config)
  }

  /**
   * Obtiene la configuración actual
   */
  static getConfig(): StorageConfig {
    return { ...this.config }
  }

  /**
   * Guarda un valor en localStorage
   * @param key Clave para almacenar el valor
   * @param value Valor a almacenar
   */
  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)

      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, serializedValue)

        // Auto-backup si está habilitado
        if (this.config.autoBackup) {
          this.createBackup(key, value)
        }

        logger.debug(`Datos guardados en localStorage: ${key}`)
      } else {
        // Fallback para entorno servidor o cuando localStorage no está disponible
        this.saveToAlternativeStorage(key, value)
      }
    } catch (error) {
      logger.error(`Error al guardar en localStorage (${key}):`, error)
      // Intentar almacenamiento alternativo
      this.saveToAlternativeStorage(key, value)
    }
  }

  /**
   * Recupera un valor de localStorage
   * @param key Clave del valor a recuperar
   * @param defaultValue Valor por defecto si no existe la clave
   * @returns El valor almacenado o el valor por defecto
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const serializedValue = localStorage.getItem(key)
        if (serializedValue === null) {
          return defaultValue
        }
        return JSON.parse(serializedValue) as T
      } else {
        // Fallback para entorno servidor
        return this.getFromAlternativeStorage(key, defaultValue)
      }
    } catch (error) {
      logger.error(`Error al recuperar de localStorage (${key}):`, error)
      return defaultValue
    }
  }

  /**
   * Elimina un valor de localStorage
   * @param key Clave del valor a eliminar
   */
  static remove(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key)
      }
      // También eliminar de almacenamiento alternativo
      this.removeFromAlternativeStorage(key)
    } catch (error) {
      logger.error(`Error al eliminar de localStorage (${key}):`, error)
    }
  }

  /**
   * Verifica si existe una clave en localStorage
   * @param key Clave a verificar
   * @returns true si existe, false en caso contrario
   */
  static has(key: string): boolean {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key) !== null
      }
      return false
    } catch (error) {
      logger.error(`Error al verificar localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Limpia todo el localStorage
   */
  static clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.clear()
      }
      this.clearAlternativeStorage()
    } catch (error) {
      logger.error("Error al limpiar localStorage:", error)
    }
  }

  /**
   * Exporta todos los datos a un archivo JSON
   */
  static exportData(): string {
    try {
      const data: Record<string, any> = {}

      if (typeof window !== "undefined" && window.localStorage) {
        // Exportar datos de localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("ml_risk_") || key.startsWith("riskml_")) {
            try {
              data[key] = JSON.parse(localStorage.getItem(key) || "{}")
            } catch {
              data[key] = localStorage.getItem(key)
            }
          }
        })
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        config: this.config,
        data: data,
        version: "1.0.0",
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      logger.error("Error al exportar datos:", error)
      return "{}"
    }
  }

  /**
   * Importa datos desde un archivo JSON
   */
  static importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)

      if (importData.data && typeof importData.data === "object") {
        Object.entries(importData.data).forEach(([key, value]) => {
          this.set(key, value)
        })

        logger.info("Datos importados exitosamente")
        return true
      }

      return false
    } catch (error) {
      logger.error("Error al importar datos:", error)
      return false
    }
  }

  /**
   * Crea un backup automático de los datos
   */
  private static createBackup<T>(key: string, value: T): void {
    try {
      const backupKey = `backup_${key}_${Date.now()}`
      const backupData = {
        originalKey: key,
        value: value,
        timestamp: new Date().toISOString(),
        config: this.config,
      }

      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(backupKey, JSON.stringify(backupData))

        // Limpiar backups antiguos (mantener solo los últimos 5)
        this.cleanOldBackups(key)
      }
    } catch (error) {
      logger.error("Error al crear backup:", error)
    }
  }

  /**
   * Limpia backups antiguos
   */
  private static cleanOldBackups(originalKey: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const backupKeys = Object.keys(localStorage)
          .filter((key) => key.startsWith(`backup_${originalKey}_`))
          .sort()

        // Mantener solo los últimos 5 backups
        if (backupKeys.length > 5) {
          const keysToDelete = backupKeys.slice(0, backupKeys.length - 5)
          keysToDelete.forEach((key) => localStorage.removeItem(key))
        }
      }
    } catch (error) {
      logger.error("Error al limpiar backups:", error)
    }
  }

  /**
   * Almacenamiento alternativo para cuando localStorage no está disponible
   */
  private static saveToAlternativeStorage<T>(key: string, value: T): void {
    try {
      // En un entorno real, aquí podrías implementar:
      // - Guardado en archivos del sistema
      // - Guardado en base de datos SQLite
      // - Guardado en IndexedDB

      logger.warn(`Guardando ${key} en almacenamiento alternativo (memoria temporal)`)

      // Por ahora, usar memoria temporal como fallback
      if (typeof globalThis !== "undefined") {
        if (!globalThis._tempStorage) {
          globalThis._tempStorage = new Map()
        }
        globalThis._tempStorage.set(key, JSON.stringify(value))
      }
    } catch (error) {
      logger.error("Error en almacenamiento alternativo:", error)
    }
  }

  /**
   * Recupera datos del almacenamiento alternativo
   */
  private static getFromAlternativeStorage<T>(key: string, defaultValue: T): T {
    try {
      if (typeof globalThis !== "undefined" && globalThis._tempStorage) {
        const value = globalThis._tempStorage.get(key)
        if (value) {
          return JSON.parse(value) as T
        }
      }
      return defaultValue
    } catch (error) {
      logger.error("Error al recuperar de almacenamiento alternativo:", error)
      return defaultValue
    }
  }

  /**
   * Elimina datos del almacenamiento alternativo
   */
  private static removeFromAlternativeStorage(key: string): void {
    try {
      if (typeof globalThis !== "undefined" && globalThis._tempStorage) {
        globalThis._tempStorage.delete(key)
      }
    } catch (error) {
      logger.error("Error al eliminar de almacenamiento alternativo:", error)
    }
  }

  /**
   * Limpia el almacenamiento alternativo
   */
  private static clearAlternativeStorage(): void {
    try {
      if (typeof globalThis !== "undefined" && globalThis._tempStorage) {
        globalThis._tempStorage.clear()
      }
    } catch (error) {
      logger.error("Error al limpiar almacenamiento alternativo:", error)
    }
  }
}

/**
 * Claves para almacenamiento en localStorage
 */
export const STORAGE_KEYS = {
  SETTINGS: "ml_risk_settings",
  DOCUMENTS: "ml_risk_documents",
  RECOMMENDATIONS: "ml_risk_recommendations",
  SCENARIOS: "ml_risk_scenarios",
  CHAT_SESSIONS: "ml_risk_chat_sessions",
  THEME: "ml_risk_theme",
  DATASET: "ml_risk_dataset",
  TRAINING_HISTORY: "ml_risk_training_history",
  USER_PREFERENCES: "ml_risk_user_preferences",
  ENVIRONMENTAL_DATA: "ml_risk_environmental_data",
  PREDICTIONS: "ml_risk_predictions",
  TEAM_SETTINGS: "ml_risk_team_settings",
  DASHBOARD_STATS: "ml_risk_dashboard_stats",
}

// Additional storage utilities
interface StorageItem {
  value: any
  timestamp: number
  expiry?: number
}

class Storage {
  private prefix = "riskml_"

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  set(key: string, value: any, expiryMinutes?: number): void {
    try {
      const item: StorageItem = {
        value,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : undefined,
      }

      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(this.getKey(key), JSON.stringify(item))
        logger.debug(`Storage: Set item ${key}`, { expiryMinutes })
      }
    } catch (error) {
      logger.error(`Storage: Failed to set item ${key}`, error)
    }
  }

  get<T = any>(key: string): T | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const itemStr = localStorage.getItem(this.getKey(key))
        if (!itemStr) return null

        const item: StorageItem = JSON.parse(itemStr)

        // Check if item has expired
        if (item.expiry && Date.now() > item.expiry) {
          this.remove(key)
          logger.debug(`Storage: Item ${key} expired and removed`)
          return null
        }

        return item.value
      }
      return null
    } catch (error) {
      logger.error(`Storage: Failed to get item ${key}`, error)
      return null
    }
  }

  remove(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(this.getKey(key))
        logger.debug(`Storage: Removed item ${key}`)
      }
    } catch (error) {
      logger.error(`Storage: Failed to remove item ${key}`, error)
    }
  }

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))
        keys.forEach((key) => localStorage.removeItem(key))
        logger.debug(`Storage: Cleared ${keys.length} items`)
      }
    } catch (error) {
      logger.error("Storage: Failed to clear items", error)
    }
  }

  exists(key: string): boolean {
    return this.get(key) !== null
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {}

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))

        keys.forEach((fullKey) => {
          const key = fullKey.replace(this.prefix, "")
          const value = this.get(key)
          if (value !== null) {
            result[key] = value
          }
        })
      }
    } catch (error) {
      logger.error("Storage: Failed to get all items", error)
    }

    return result
  }

  /**
   * Exporta todos los datos del storage
   */
  exportAll(): string {
    try {
      const allData = this.getAll()
      const exportData = {
        timestamp: new Date().toISOString(),
        prefix: this.prefix,
        data: allData,
        version: "1.0.0",
      }
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      logger.error("Storage: Failed to export all data", error)
      return "{}"
    }
  }

  /**
   * Importa datos al storage
   */
  importAll(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)

      if (importData.data && typeof importData.data === "object") {
        Object.entries(importData.data).forEach(([key, value]) => {
          this.set(key, value)
        })

        logger.info("Todos los datos importados exitosamente")
        return true
      }

      return false
    } catch (error) {
      logger.error("Storage: Error al importar datos:", error)
      return false
    }
  }
}

export const storage = new Storage()

/**
 * Utilidades para configuración de almacenamiento local
 */
export const StorageUtils = {
  /**
   * Configura el almacenamiento para desarrollo local
   */
  configureForLocal(basePath = "./data"): void {
    LocalStorage.configure({
      type: "fileSystem",
      path: basePath,
      autoBackup: true,
      backupInterval: 15, // 15 minutos para desarrollo
    })

    logger.info(`Almacenamiento configurado para desarrollo local en: ${basePath}`)
  },

  /**
   * Configura el almacenamiento para producción
   */
  configureForProduction(): void {
    LocalStorage.configure({
      type: "localStorage",
      autoBackup: true,
      backupInterval: 60, // 1 hora para producción
    })

    logger.info("Almacenamiento configurado para producción")
  },

  /**
   * Exporta todos los datos del sistema
   */
  exportAllData(): string {
    const localStorageData = LocalStorage.exportData()
    const storageData = storage.exportAll()

    const combinedData = {
      timestamp: new Date().toISOString(),
      localStorage: JSON.parse(localStorageData),
      storage: JSON.parse(storageData),
      version: "1.0.0",
    }

    return JSON.stringify(combinedData, null, 2)
  },

  /**
   * Importa todos los datos del sistema
   */
  importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      let success = true

      if (data.localStorage) {
        success = LocalStorage.importData(JSON.stringify(data.localStorage)) && success
      }

      if (data.storage) {
        success = storage.importAll(JSON.stringify(data.storage)) && success
      }

      return success
    } catch (error) {
      logger.error("Error al importar todos los datos:", error)
      return false
    }
  },

  /**
   * Descarga los datos como archivo JSON
   */
  downloadDataAsFile(filename = "risk-management-data.json"): void {
    try {
      const data = this.exportAllData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()

      URL.revokeObjectURL(url)

      logger.info(`Datos descargados como: ${filename}`)
    } catch (error) {
      logger.error("Error al descargar datos:", error)
    }
  },
}

// Configuración automática basada en el entorno
if (typeof window !== "undefined") {
  // Navegador - usar localStorage
  StorageUtils.configureForProduction()
} else {
  // Servidor/Node.js - usar almacenamiento de archivos
  StorageUtils.configureForLocal()
}
