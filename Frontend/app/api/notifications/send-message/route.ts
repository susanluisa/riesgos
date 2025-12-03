import { logger } from "@/lib/logger"
import { type NextRequest, NextResponse } from "next/server"
import { ok, fail } from "@/lib/api-response"
import { z } from "zod"

interface MessageRequest {
  memberName: string
  memberEmail: string
  memberPhone: string
  messageType: "sms" | "whatsapp"
  customMessage?: string
}

const BodySchema = z.object({
  memberName: z.string().min(1),
  memberEmail: z.string().email().optional().or(z.literal("")),
  memberPhone: z.string().min(6),
  messageType: z.enum(["sms", "whatsapp"]),
  customMessage: z.string().max(1600).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 })
    const { memberName, memberEmail, memberPhone, messageType, customMessage } = parsed.data

    if (process.env.NODE_ENV !== "production") logger.info("Solicitud recibida:", { memberName, memberEmail, memberPhone, messageType })

    // Validar datos requeridos
    if (!memberName || !memberEmail || !memberPhone || !messageType) {
      logger.error("Faltan datos requeridos:", { memberName, memberEmail, memberPhone, messageType })
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
        },
        { status: 400 },
      )
    }

    // Formatear número de teléfono
    let formattedPhone = memberPhone.trim()
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`
    }

    // Mensaje por defecto si no se proporciona uno personalizado
    const defaultMessage = `¡Hola ${memberName}! 👋

Has sido agregado al equipo de seguridad industrial.

📧 Email registrado: ${memberEmail}
📱 Teléfono: ${memberPhone}

Recibirás notificaciones importantes sobre seguridad y emergencias.

¡Bienvenido al equipo! 🛡️

---
Sistema de Gestión de Riesgos
${new Date().toLocaleString("es-CL")}`

    const messageToSend = customMessage || defaultMessage

    // SIMULACIÓN - En producción, descomenta el código de Twilio abajo
    if (process.env.NODE_ENV !== "production") logger.info("=== SIMULACIÓN DE ENVÍO DE MENSAJE ===")
    if (process.env.NODE_ENV !== "production") logger.info("Tipo:", messageType === "whatsapp" ? "WhatsApp" : "SMS")
    if (process.env.NODE_ENV !== "production") logger.info("Destinatario:", memberName)
    if (process.env.NODE_ENV !== "production") logger.info("Teléfono:", formattedPhone)
    if (process.env.NODE_ENV !== "production") logger.info("Mensaje:", messageToSend)
    if (process.env.NODE_ENV !== "production") logger.info("=====================================")

    // Simular delay de envío
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simular respuesta exitosa
    const simulatedResponse = {
      success: true,
      data: {
        sid: `SM${Date.now()}`,
        to: formattedPhone,
        from: messageType === "whatsapp" ? "whatsapp:+14155238886" : "+1234567890",
        body: messageToSend.substring(0, 50) + "...", // Truncar para el log
        status: "sent",
        dateCreated: new Date().toISOString(),
        messagingServiceSid: null,
        accountSid: "AC_simulated_account_sid",
      },
    }

    if (process.env.NODE_ENV !== "production") logger.info("Mensaje simulado enviado exitosamente:", simulatedResponse.data.sid)
    return NextResponse.json(simulatedResponse)

    /* 
    // CÓDIGO REAL DE TWILIO - Descomenta para usar Twilio real
    
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    let messageResponse

    try {
      if (messageType === "whatsapp") {
        // Enviar WhatsApp
        messageResponse = await client.messages.create({
          body: messageToSend,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${formattedPhone}`
        })
      } else {
        // Enviar SMS
        messageResponse = await client.messages.create({
          body: messageToSend,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        })
      }

      if (process.env.NODE_ENV !== "production") logger.info("Mensaje enviado exitosamente:", messageResponse.sid)

      return NextResponse.json({
        success: true,
        data: {
          sid: messageResponse.sid,
          to: messageResponse.to,
          from: messageResponse.from,
          body: messageResponse.body.substring(0, 50) + "...", // Truncar para el log
          status: messageResponse.status,
          dateCreated: messageResponse.dateCreated,
          messagingServiceSid: messageResponse.messagingServiceSid,
          accountSid: messageResponse.accountSid
        }
      })
    } catch (twilioError) {
      logger.error("Error de Twilio:", twilioError)
      return NextResponse.json({
        success: false,
        error: `Error de Twilio: ${twilioError.message || "Error desconocido"}`,
        code: twilioError.code
      }, { status: 500 })
    }
    */
  } catch (error) {
    logger.error("Error procesando solicitud:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al procesar la solicitud",
      },
      { status: 500 },
    )
  }
}
