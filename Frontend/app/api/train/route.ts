
import { NextResponse } from "next/server"
import { TrainSchema } from "@/schemas/train"
import { trainRandomForest } from "@/lib/ml/trainRandomForest"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { X, y, options } = TrainSchema.parse(body)

    if (X.length !== y.length) {
      return NextResponse.json({ success: false, error: "X y y deben tener el mismo número de filas." }, { status: 400 })
    }

    const result = trainRandomForest({ X, y }, options)
    logger.info("Entrenamiento RF completado", { metrics: result.metrics, opts: result.options })

    return NextResponse.json({
      success: true,
      metrics: result.metrics,
      options: result.options,
      testPreview: {
        n: result.test.yTrue.length,
        yTrue: result.test.yTrue.slice(0, 50),
        yPred: result.test.yPred.slice(0, 50),
        proba: result.test.proba?.slice(0, 50) ?? null,
      }
    })
  } catch (err: any) {
    logger.error("Error en /api/train", err)
    return NextResponse.json({ success: false, error: err?.message ?? "Error desconocido" }, { status: 400 })
  }
}
