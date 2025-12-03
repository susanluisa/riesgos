type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: Date
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
    }

    this.logs.push(entry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output
    const timestamp = entry.timestamp.toISOString()
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`

    switch (level) {
      case "debug":
        console.debug(logMessage, data || "")
        break
      case "info":
        console.info(logMessage, data || "")
        break
      case "warn":
        console.warn(logMessage, data || "")
        break
      case "error":
        console.error(logMessage, data || "")
        break
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data)
  }

  info(message: string, data?: any) {
    this.log("info", message, data)
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  error(message: string, data?: any) {
    this.log("error", message, data)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
