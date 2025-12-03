// app/api/datasets/route.ts
import { NextResponse, type NextRequest } from "next/server"
import fs from "node:fs/promises"
import fssync from "node:fs"
import path from "node:path"
import { v4 as uuidv4 } from "uuid"
import { db, DATA_DIR } from "@/lib/sqlite"
import { sha256Buffer } from "@/lib/hash"

// FORZAR runtime Node (better-sqlite3 no funciona en Edge)
export const runtime = "nodejs"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const CSV_MIMES = /text\/csv|application\/vnd\.ms-excel|application\/csv/i

function parseCsvHeaderAndCount(buf: Buffer) {
  // Seguro para archivos pequeños/medianos (hasta 10MB): línea 1 = header
  const text = buf.toString("utf8")
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = (lines[0] ?? "").split(",").map((h) => h.trim()).filter(Boolean)
  const rowsCount = Math.max(lines.length - 1, 0)
  const colsCount = header.length
  return { header, rowsCount, colsCount }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    // Validación tipo/tamaño
    const type = (file as any).type || ""
    const size = (file as any).size || 0
    if (!CSV_MIMES.test(type)) {
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 415 })
    }
    if (size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 })
    }

    // Guardado versionado: <timestamp>_<slug>_<uuid>.csv
    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const sha = sha256Buffer(rawBuffer)
    const ts = new Date().toISOString().replace(/[:.]/g, "-")
    const baseName = (file.name || "dataset.csv").replace(/[^a-z0-9._-]+/gi, "_")
    const uid = uuidv4()
    const dataDir = path.join(DATA_DIR, "datasets")
    await fs.mkdir(dataDir, { recursive: true })
    const finalName = `${ts}_${uid}_${baseName}`
    const finalPath = path.join(dataDir, finalName)
    await fs.writeFile(finalPath, rawBuffer)

    // Contar filas/columnas (rápido)
    const { header, rowsCount, colsCount } = parseCsvHeaderAndCount(rawBuffer)
    const target = header.length ? header[header.length - 1] : null

    // Insert en BD (no sobreescribimos; cada POST crea 1 fila)
    const insert = db.prepare(`
      INSERT INTO datasets (name, path, sha256, rows_count, cols_count, target)
      VALUES (@name, @path, @sha256, @rows_count, @cols_count, @target)
    `)
    const info = insert.run({
      name: file.name,
      path: finalPath,
      sha256: sha,
      rows_count: rowsCount,
      cols_count: colsCount,
      target
    })

    return NextResponse.json({
      id: info.lastInsertRowid,
      name: file.name,
      savedAs: finalName,
      path: finalPath,
      sha256: sha,
      rowsCount,
      colsCount,
      target
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Upload error" }, { status: 400 })
  }
}

export async function GET() {
  try {
    // Leemos desde la BD
    const items = db.prepare("SELECT * FROM datasets ORDER BY id DESC").all()
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "List error" }, { status: 500 })
  }
}
