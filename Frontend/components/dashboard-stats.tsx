"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Clock, FileText, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"

interface DashboardData {
  riskLevel: string
  riskScore: number
  riskTrend: number
  incidentsCount: number
  incidentsTrend: number
  compliancePercentage: number
  complianceTrend: number
  pendingRecommendations: number
  highPriorityRecommendations: number
  hasHistoricalIncidents: boolean
  hasHistoricalCompliance: boolean
}

function toArraySafe<T = any>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (!v) return []
  const anyV: any = v as any
  if (Array.isArray(anyV.items)) return anyV.items as T[]
  if (Array.isArray(anyV.data)) return anyV.data as T[]
  if (typeof anyV === "object") return Object.values(anyV) as T[]
  return []
}
function num(v: any, def = 0): number { const n = Number(v); return Number.isFinite(n) ? n : def }
function tsFromAny(x: any): number { if (!x) return NaN; const t = new Date(x).getTime(); return Number.isFinite(t) ? t : NaN }

export function DashboardStats() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    riskLevel: "Sin Datos",
    riskScore: 0,
    riskTrend: 0,
    incidentsCount: 0,
    incidentsTrend: 0,
    compliancePercentage: 0,
    complianceTrend: 0,
    pendingRecommendations: 0,
    highPriorityRecommendations: 0,
    hasHistoricalIncidents: false,
    hasHistoricalCompliance: false,
  })

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const predictions = toArraySafe<any>(LocalStorage.get(STORAGE_KEYS.PREDICTIONS, []))
        const incidents = toArraySafe<any>(LocalStorage.get(STORAGE_KEYS.INCIDENTS, []))
        const recommendations = toArraySafe<any>(LocalStorage.get(STORAGE_KEYS.RECOMMENDATIONS, []))
        const compliance = toArraySafe<any>(LocalStorage.get(STORAGE_KEYS.COMPLIANCE, []))

        let riskLevel = "Sin Datos"
        let riskScore = 0
        if (predictions.length > 0) {
          const last = predictions[predictions.length - 1]
          riskLevel = String(last?.riskLevel ?? last?.label ?? "Bajo")
          riskScore = num(last?.riskScore ?? last?.score, 0)
        }

        const now = Date.now()
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
        const sixtyDaysAgo  = now - 60 * 24 * 60 * 60 * 1000
        const getTs = (i: any) => tsFromAny(i?.date ?? i?.createdAt ?? i?.timestamp)

        const recentIncidents = incidents.filter((i) => { const t = getTs(i); return Number.isFinite(t) && t >= thirtyDaysAgo })
        const previousPeriodIncidents = incidents.filter((i) => { const t = getTs(i); return Number.isFinite(t) && t >= sixtyDaysAgo && t < thirtyDaysAgo })

        const hasHistoricalIncidents = previousPeriodIncidents.length > 0
        let incidentsTrend = 0
        if (hasHistoricalIncidents) {
          const cur = recentIncidents.length, prev = previousPeriodIncidents.length
          if (prev > 0) incidentsTrend = ((cur - prev) / prev) * 100
        }

        const compVals = compliance.map((c) => num(c?.percentage ?? c?.value ?? c?.score ?? c, NaN)).filter(Number.isFinite)
        const compliancePercentage = compVals.length ? Math.round(compVals.reduce((a,b)=>a+b,0) / compVals.length) : 0
        const hasHistoricalCompliance = compVals.length >= 2
        let complianceTrend = 0
        if (hasHistoricalCompliance) {
          const cur = compVals[compVals.length - 1]
          const prev = compVals[compVals.length - 2]
          if (Number.isFinite(prev)) complianceTrend = cur - prev
        }

        const isCompleted = (rec: any) => String(rec?.status ?? "").toLowerCase() === "completed" || rec?.completed === true
        const isHigh = (rec: any) => String(rec?.priority ?? "").toLowerCase() == "high" || String(rec?.prioridad ?? "").toLowerCase() === "alta"
        const pendingRecommendations = recommendations.filter((r)=>!isCompleted(r)).length
        const highPriorityRecommendations = recommendations.filter((r)=>!isCompleted(r) && isHigh(r)).length

        const lastScore  = predictions.length >= 1 ? num(predictions[predictions.length - 1]?.riskScore ?? predictions[predictions.length - 1]?.score, 0) : 0
        const prevScore  = predictions.length >= 2 ? num(predictions[predictions.length - 2]?.riskScore ?? predictions[predictions.length - 2]?.score, 0) : 0
        const riskTrend  = predictions.length >= 2 ? lastScore - prevScore : 0

        setDashboardData({
          riskLevel, riskScore, riskTrend,
          incidentsCount: recentIncidents.length,
          incidentsTrend,
          compliancePercentage, complianceTrend,
          pendingRecommendations, highPriorityRecommendations,
          hasHistoricalIncidents, hasHistoricalCompliance
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }

    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRiskLevelColor = (level: string) => {
    const lvl = String(level ?? "").toLowerCase()
    switch (lvl) {
      case "mortal": return "text-black"
      case "alto": return "text-red-600"
      case "medio": return "text-amber-600"
      case "bajo": return "text-green-600"
      default: return "text-gray-500"
    }
  }

  const formatTrend = (trend: number, hasHistoricalData: boolean, isPercentage = false) => {
    if (!hasHistoricalData || !Number.isFinite(trend) || trend === 0) return null
    const isPositive = trend > 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? "text-red-600" : "text-green-600"
    const prefix = isPositive ? "+" : ""
    const suffix = isPercentage ? "%" : ""
    return (
      <div className={`flex items-center mt-3 ${colorClass} text-sm`}>
        <TrendIcon className="h-4 w-4 mr-1" />
        <span>{prefix}{Math.abs(trend).toFixed(1)}{suffix} {isPositive ? "más" : "menos"} que el período anterior</span>
      </div>
    )
  }

  const handleViewRecommendations = () => { router.push("/reports") }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Nivel de Riesgo</CardTitle>
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getRiskLevelColor(dashboardData.riskLevel)}`}>{dashboardData.riskLevel}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardData.riskScore > 0 ? `Puntuación: ${dashboardData.riskScore}/100` : "No hay datos de análisis"}
          </p>
          {formatTrend(dashboardData.riskTrend, dashboardData.riskScore > 0)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Incidentes Reportados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.incidentsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">En los últimos 30 días</p>
          {formatTrend(dashboardData.incidentsTrend, dashboardData.hasHistoricalIncidents, true)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cumplimiento Normativo</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.compliancePercentage > 0 ? `${dashboardData.compliancePercentage}%` : "0%"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardData.compliancePercentage > 0 ? "Ley 29783 y DS 024-2016-EM" : "Sin datos de cumplimiento"}
          </p>
          {formatTrend(dashboardData.complianceTrend, dashboardData.hasHistoricalCompliance, true)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recomendaciones Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.pendingRecommendations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardData.highPriorityRecommendations > 0 ? `${dashboardData.highPriorityRecommendations} de alta prioridad` : "Sin recomendaciones pendientes"}
          </p>
          <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto text-amber-600 hover:text-amber-700" onClick={handleViewRecommendations}>
            <FileText className="h-4 w-4 mr-1" />
            <span>Ver recomendaciones</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
