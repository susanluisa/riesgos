"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Loader2, AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  riskLevel?: "low" | "medium" | "high" | "critical"
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "¡Hola! Soy tu asistente de IA especializado en análisis de riesgos ocupacionales. Puedo ayudarte a:\n\n• Evaluar escenarios de riesgo\n• Sugerir medidas preventivas\n• Analizar datos de seguridad\n• Interpretar métricas de riesgo\n\n¿En qué puedo asistirte hoy?",
    timestamp: new Date(),
    suggestions: [
      "Evaluar riesgo de trabajo en alturas",
      "Medidas para exposición química",
      "Análisis de accidentes recientes",
      "Recomendaciones de EPP",
    ],
  },
]

export function AIRiskAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simular respuesta del asistente
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAssistantResponse(inputValue),
        timestamp: new Date(),
        riskLevel: determineRiskLevel(inputValue),
        suggestions: generateSuggestions(inputValue),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAssistantResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("altura") || lowerInput.includes("caída")) {
      return "**Análisis de Riesgo: Trabajo en Alturas**\n\nHe identificado que tu consulta se relaciona con trabajo en alturas. Este es un riesgo **CRÍTICO** que requiere atención inmediata.\n\n**Factores de Riesgo Identificados:**\n• Altura superior a 1.5 metros\n• Posible ausencia de sistemas de protección\n• Condiciones climáticas adversas\n\n**Recomendaciones Inmediatas:**\n1. **Sistemas de Protección:** Implementar arnés de seguridad con línea de vida\n2. **Capacitación:** Certificación obligatoria para trabajo en alturas\n3. **Inspección:** Verificación diaria de equipos de protección\n4. **Procedimientos:** Establecer protocolos de rescate\n\n**Normativa Aplicable:** Resolución 1409 de 2012 (Colombia) - Reglamento de Seguridad para protección contra caídas en trabajo en alturas."
    }

    if (lowerInput.includes("químico") || lowerInput.includes("sustancia")) {
      return "**Análisis de Riesgo: Exposición a Sustancias Químicas**\n\nTu consulta involucra riesgos químicos. He clasificado esto como riesgo **ALTO** basado en los patrones identificados.\n\n**Evaluación de Riesgo:**\n• Tipo de exposición: Inhalatoria/Dérmica\n• Duración de exposición: Variable\n• Concentración: Por determinar\n\n**Medidas de Control Recomendadas:**\n1. **Controles de Ingeniería:** Sistemas de ventilación localizada\n2. **EPP Específico:** Respiradores con filtros apropiados\n3. **Monitoreo:** Medición periódica de concentraciones\n4. **Capacitación:** Manejo seguro de sustancias químicas\n\n**Documentación Requerida:**\n• Fichas de Datos de Seguridad (FDS)\n• Matriz de compatibilidad química\n• Procedimientos de emergencia"
    }

    if (lowerInput.includes("accidente") || lowerInput.includes("incidente")) {
      return "**Análisis de Incidentes y Accidentes**\n\nPara un análisis efectivo de incidentes, necesito más información específica. Sin embargo, puedo guiarte en el proceso:\n\n**Metodología de Análisis:**\n1. **Recopilación de Datos:**\n   • Descripción detallada del evento\n   • Condiciones ambientales\n   • Factores humanos involucrados\n\n2. **Análisis de Causas Raíz:**\n   • Causas inmediatas\n   • Causas básicas\n   • Factores contribuyentes\n\n3. **Clasificación del Evento:**\n   • Severidad del daño\n   • Probabilidad de recurrencia\n   • Impacto operacional\n\n**Herramientas Recomendadas:**\n• Diagrama de Ishikawa (Espina de Pescado)\n• Análisis de Árbol de Fallas\n• Método de los 5 Porqués\n\n¿Podrías proporcionar más detalles sobre el incidente específico?"
    }

    return "He analizado tu consulta y puedo ayudarte con el análisis de riesgos ocupacionales. Para brindarte una respuesta más específica y útil, me gustaría conocer más detalles sobre:\n\n• El tipo específico de riesgo que te preocupa\n• El contexto laboral (industria, actividad, etc.)\n• Los factores de riesgo presentes\n• Las medidas de control actuales\n\nCon esta información, podré proporcionarte un análisis más detallado y recomendaciones específicas para tu situación."
  }

  const determineRiskLevel = (input: string): "low" | "medium" | "high" | "critical" => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("altura") || lowerInput.includes("caída") || lowerInput.includes("explosión")) {
      return "critical"
    }
    if (lowerInput.includes("químico") || lowerInput.includes("maquinaria") || lowerInput.includes("eléctrico")) {
      return "high"
    }
    if (lowerInput.includes("ruido") || lowerInput.includes("ergonómico") || lowerInput.includes("fatiga")) {
      return "medium"
    }
    return "low"
  }

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("altura")) {
      return [
        "¿Qué EPP necesito para trabajo en alturas?",
        "Procedimientos de rescate en alturas",
        "Inspección de equipos de protección",
        "Normativa vigente para alturas",
      ]
    }

    if (lowerInput.includes("químico")) {
      return [
        "Cómo leer una Ficha de Datos de Seguridad",
        "Sistemas de ventilación recomendados",
        "Incompatibilidades químicas comunes",
        "Procedimientos de derrame químico",
      ]
    }

    return [
      "Evaluar otro tipo de riesgo",
      "Crear matriz de riesgos",
      "Análisis de tendencias de seguridad",
      "Recomendaciones de capacitación",
    ]
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const getRiskLevelColor = (level?: string) => {
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

  const getRiskLevelText = (level?: string) => {
    switch (level) {
      case "critical":
        return "Riesgo Crítico"
      case "high":
        return "Riesgo Alto"
      case "medium":
        return "Riesgo Medio"
      case "low":
        return "Riesgo Bajo"
      default:
        return ""
    }
  }

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Info className="h-4 w-4" />
      case "low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Asistente IA de Riesgos</h2>
        <p className="text-muted-foreground">
          Consulte con nuestro asistente especializado en análisis de riesgos ocupacionales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Chat con Asistente IA
              </CardTitle>
              <CardDescription>
                Especializado en análisis de riesgos ocupacionales y medidas preventivas
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <Avatar className="h-8 w-8">
                            {message.type === "user" ? (
                              <>
                                <AvatarImage src="/avatars/user.png" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarImage src="/avatars/bot.png" />
                                <AvatarFallback className="bg-blue-100">
                                  <Bot className="h-4 w-4 text-blue-600" />
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>

                          <div className={`space-y-2 ${message.type === "user" ? "text-right" : "text-left"}`}>
                            <div
                              className={`rounded-lg p-3 ${
                                message.type === "user" ? "bg-blue-600 text-white" : "bg-muted"
                              }`}
                            >
                              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            </div>

                            {message.riskLevel && (
                              <div className="flex justify-start">
                                <Badge className={getRiskLevelColor(message.riskLevel)}>
                                  {getRiskIcon(message.riskLevel)}
                                  <span className="ml-1">{getRiskLevelText(message.riskLevel)}</span>
                                </Badge>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="ml-11 space-y-2">
                          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Lightbulb className="h-4 w-4" />
                            Sugerencias:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analizando tu consulta...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu consulta sobre riesgos ocupacionales..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consultas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Evaluación de riesgos en alturas",
                "Medidas para exposición química",
                "Análisis de ergonomía laboral",
                "Procedimientos de emergencia",
                "Capacitación en seguridad",
                "Inspección de EPP",
              ].map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(query)}
                  className="w-full justify-start text-left h-auto p-2"
                >
                  <div className="text-sm">{query}</div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capacidades del Asistente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Análisis de Riesgos</div>
                  <div className="text-muted-foreground">Evaluación automática de escenarios</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Recomendaciones</div>
                  <div className="text-muted-foreground">Medidas preventivas específicas</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Normativa</div>
                  <div className="text-muted-foreground">Referencias legales actualizadas</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Interpretación</div>
                  <div className="text-muted-foreground">Análisis de datos y métricas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
