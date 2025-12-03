// lib/ml/spec.ts
import { median, mean, standardDeviation } from "simple-statistics"

export type ColumnType = "numeric" | "categorical" | "ignore"

export interface NumericSpec {
  kind: "numeric"
  key: string
  median: number
  mean: number
  std: number
  standardize: boolean
}
export interface CategoricalSpec {
  kind: "categorical"
  key: string
  categories: string[] // incluye "other" al final
}

export type FeatureDef = NumericSpec | CategoricalSpec

export interface FeatureSpec {
  targetKey: string
  targetClasses: string[]
  features: FeatureDef[]
  featureNames: string[] // nombres expandidos (para one-hot)
  columnsOriginal: string[]
}

function isNumericLike(v: any) {
  if (v === null || v === undefined || v === "") return false
  if (typeof v === "number") return Number.isFinite(v)
  const n = Number(v)
  return !Number.isNaN(n) && Number.isFinite(n)
}

function specialRiskOrder(values: string[]) {
  const order = ["bajo","medio","alto","crítico","critico"]
  const mapped = values.map(v => String(v))
  const lower = mapped.map(v => v.toLowerCase())
  const anyMatch = lower.some(v => order.includes(v))
  if (!anyMatch) return null
  const uniq = Array.from(new Set(mapped))
  uniq.sort((a,b)=> order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()))
  return uniq
}

export function buildFeatureSpec(rows: any[], columns: string[], targetKey: string, standardize = false): FeatureSpec {
  const feats: FeatureDef[] = []
  const featNames: string[] = []

  const colSet = new Set(columns)
  const featureCols = columns.filter(c => c !== targetKey)

  for (const col of featureCols) {
    // decide tipo por muestreo
    const sample: any[] = []
    for (let i = 0; i < rows.length && sample.length < 200; i++) {
      sample.push(rows[i]?.[col])
    }
    const numCount = sample.filter(isNumericLike).length
    const isNum = numCount >= Math.ceil(sample.length * 0.6)

    if (isNum) {
      const nums = rows.map(r => Number(r?.[col])).filter(v => Number.isFinite(v))
      const med = nums.length ? median(nums) : 0
      const m = nums.length ? mean(nums) : 0
      const sd = nums.length ? (standardDeviation(nums) || 0) : 0
      const def: NumericSpec = { kind: "numeric", key: col, median: med, mean: m, std: sd, standardize }
      feats.push(def)
      featNames.push(col)
    } else {
      const set = new Set<string>()
      for (const r of rows) {
        const v = r?.[col]
        if (v !== null && v !== undefined && v !== "") set.add(String(v))
      }
      const cats = Array.from(set)
      cats.sort((a,b)=> String(a).localeCompare(String(b)))
      cats.push("__other__")
      const def: CategoricalSpec = { kind: "categorical", key: col, categories: cats }
      feats.push(def)
      for (const c of cats) featNames.push(`${col}=${c}`)
    }
  }

  // target classes
  const targetValues = rows.map(r => r?.[targetKey]).filter(v => v !== undefined && v !== null)
  let classes: string[]
  const numericTargets = targetValues.every(isNumericLike)
  if (numericTargets) {
    classes = Array.from(new Set(targetValues.map((v:any)=>Number(v)))).sort((a:any,b:any)=>a-b).map(String)
  } else {
    const risk = specialRiskOrder(Array.from(new Set(targetValues.map(String))))
    classes = risk ?? Array.from(new Set(targetValues.map(String))).sort((a,b)=> a.localeCompare(b))
  }

  return {
    targetKey,
    targetClasses: classes,
    features: feats,
    featureNames: featNames,
    columnsOriginal: columns
  }
}

export function transformWithSpec(rows: any[], spec: FeatureSpec): { X: number[][] } {
  const X: number[][] = []
  for (const r of rows) {
    const fea: number[] = []
    for (const def of spec.features) {
      if (def.kind === "numeric") {
        let v = r?.[def.key]
        let num = isNumericLike(v) ? Number(v) : def.median
        if (def.standardize && def.std && def.std > 0) {
          num = (num - def.mean) / def.std
        }
        fea.push(num)
      } else {
        const val = r?.[def.key]
        const cats = def.categories
        const one = cats.map((c) => (String(val) === c ? 1 : 0))
        // si no coincide con ninguna categoría, marca "__other__"
        if (!isNumericLike(val) && (val === null || val === undefined || val === "" || !cats.includes(String(val)))) {
          const idx = cats.indexOf("__other__")
          if (idx >= 0) one[idx] = 1
        }
        fea.push(...one)
      }
    }
    X.push(fea)
  }
  return { X }
}

export function encodeTarget(rows: any[], spec: FeatureSpec): { y: number[] } {
  const map = new Map(spec.targetClasses.map((c,i)=>[c,i]))
  const y: number[] = rows.map(r => {
    const v = r?.[spec.targetKey]
    const key = isNumericLike(v) ? String(Number(v)) : String(v)
    const idx = map.get(key)
    return idx !== undefined ? idx : 0
  })
  return { y }
}
