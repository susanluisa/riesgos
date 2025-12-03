
import { NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { trainRandomForest } from "@/lib/ml/trainRandomForest"
import { buildFeatureSpec, transformWithSpec, encodeTarget } from "@/lib/ml/spec"
import { z } from "zod"

const TrainPersistSchema = z.object({
  rows: z.array(z.record(z.any())),
  columns: z.array(z.string()).optional(),
  target: z.string().optional(),
  targetColumn: z.string().optional(),
  options: z.object({
    nEstimators: z.number().int().min(10).max(1000).optional(),
    maxFeatures: z.number().min(0.1).max(1).optional(),
    replacement: z.boolean().optional(),
    seed: z.number().int().optional(),
    useSmote: z.boolean().optional(),
    testSize: z.number().min(0.05).max(0.5).optional(),
    standardize: z.boolean().optional(),
  }).optional()
})

const MODELS_DIR = "./models"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = TrainPersistSchema.parse(body)
    const rows = parsed.rows
    const cols = parsed.columns ?? (rows.length ? Object.keys(rows[0]) : [])
    const targetName = parsed.target ?? parsed.targetColumn
    const options = (parsed as any).options
    if (!rows?.length) {
      return NextResponse.json({ success: false, error: "No hay filas para entrenar." }, { status: 400 })
    }
    if (!cols?.length) {
      return NextResponse.json({ success: false, error: "No hay columnas." }, { status: 400 })
    }

    if (!targetName) { return NextResponse.json({ success:false, error: 'Falta la columna objetivo (target/targetColumn).' }, { status: 400 }) }
    const spec = buildFeatureSpec(rows, cols, targetName, options?.standardize ?? false)
    const { X } = transformWithSpec(rows, spec)
    const { y } = encodeTarget(rows, spec)

    const result = trainRandomForest({ X, y }, {
      nEstimators: options?.nEstimators ?? 100,
      maxFeatures: options?.maxFeatures ?? 0.8,
      replacement: options?.replacement ?? true,
      seed: options?.seed ?? 42,
      useSmote: options?.useSmote ?? false,
      testSize: options?.testSize ?? 0.2,
    })

    // Persistir modelo y spec
    const anyModel: any = result.model as any
    const modelJSON = typeof anyModel.toJSON === "function" ? anyModel.toJSON()
                     : (anyModel.export ? anyModel.export() : anyModel)

    await mkdir(MODELS_DIR, { recursive: true })
    await writeFile(path.join(MODELS_DIR, "rf_latest.json"), JSON.stringify(modelJSON), "utf8")
    await writeFile(path.join(MODELS_DIR, "rf_feature_spec.json"), JSON.stringify(spec, null, 2), "utf8")

    return NextResponse.json({
      success: true,
      metrics: result.metrics,
      options: result.options,
      modelSaved: true,
      files: { model: "models/rf_latest.json", spec: "models/rf_feature_spec.json" },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? "Error desconocido" }, { status: 400 })
  }
}
