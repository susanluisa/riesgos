
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { transformWithSpec } from "@/lib/ml/spec"
import { RandomForestClassifier as RFClassifier } from "ml-random-forest"

const MODELS_DIR = "./models"

export async function POST(req: Request) {
  try {
    const body = await req.json() // { rows: any[] }
    const rows = body?.rows ?? []
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Envía 'rows' con datos para predecir." }, { status: 400 })
    }

    const spec = JSON.parse(await readFile(path.join(MODELS_DIR, "rf_feature_spec.json"), "utf8"))
    const modelJSON = JSON.parse(await readFile(path.join(MODELS_DIR, "rf_latest.json"), "utf8"))

    // reconstruir modelo
    let rf: any
    if (typeof (RFClassifier as any).load === "function") {
      rf = (RFClassifier as any).load(modelJSON)
    } else {
      rf = new (RFClassifier as any)(modelJSON)
    }

    const { X } = transformWithSpec(rows, spec)
    const yIdx = rf.predict(X) as number[]

    // proba si disponible
    let proba: number[][] | null = null
    if (typeof rf.predictProba === "function") {
      const p = rf.predictProba(X)
      if (Array.isArray(p) && p.length && Array.isArray(p[0])) {
        proba = p as number[][]
      }
    }

    const classes: string[] = spec.targetClasses
    const yPred = yIdx.map((i: number) => classes[i] ?? String(i))

    return NextResponse.json({ success: true, yPred, proba, classes })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? "Error desconocido" }, { status: 400 })
  }
}
