// lib/ml/trainRandomForest.ts
import { RandomForestClassifier as RFClassifier } from "ml-random-forest"
import { mean } from "simple-statistics"
import { smoteBinary, smoteMulticlass } from "./smote"

export type Feature = number[]
export type Dataset = { X: Feature[]; y: number[] }

export type TrainOptions = {
  nEstimators?: number
  maxFeatures?: number // 0..1
  replacement?: boolean
  seed?: number
  useSmote?: boolean
  testSize?: number // 0..1
}

export type Metrics = {
  accuracy: number
  precision_macro: number
  recall_macro: number
  f1_macro: number
  byClass: Record<string, { precision: number; recall: number; f1: number; support: number }>
  aucROC?: number // si hay probas
}

function trainTestSplit(X: Feature[], y: number[], testSize = 0.2, seed = 42) {
  const n = X.length
  const idx = Array.from({length:n},(_,i)=>i)
  let r = seed
  idx.sort(() => {
    r = (r * 16807) % 2147483647
    return (r / 2147483647) - 0.5
  })
  const cut = Math.floor(n * (1 - testSize))
  const trainIdx = idx.slice(0, cut)
  const testIdx = idx.slice(cut)
  return {
    Xtrain: trainIdx.map(i=>X[i]),
    ytrain: trainIdx.map(i=>y[i]),
    Xtest: testIdx.map(i=>X[i]),
    ytest: testIdx.map(i=>y[i]),
  }
}

function unique<T>(arr: T[]) { return Array.from(new Set(arr)) }
function safeDiv(a: number, b: number) { return b === 0 ? 0 : a / b }

function confusionByClass(yTrue: number[], yPred: number[]) {
  const labels = unique(yTrue).sort((a:any,b:any)=>a-b)
  const byClass: Record<string, { tp: number; fp: number; fn: number; tn: number; support: number }> = {}
  for (const c of labels) {
    let tp=0, fp=0, fn=0, tn=0, sup=0
    for (let i=0;i<yTrue.length;i++){
      const t = yTrue[i], p = yPred[i]
      if (t === c) sup++
      if (t === c && p === c) tp++
      else if (t !== c && p === c) fp++
      else if (t === c && p !== c) fn++
      else if (t !== c && p !== c) tn++
    }
    byClass[c] = { tp, fp, fn, tn, support: sup }
  }
  return byClass
}

function metricsFromPred(yTrue: number[], yPred: number[], proba?: number[]): Metrics {
  const byCraw = confusionByClass(yTrue, yPred)
  const labels = Object.keys(byCraw)
  const byClass: Metrics["byClass"] = {}

  const precisions: number[] = [], recalls: number[] = [], f1s: number[] = []
  let correct = 0
  for (let i=0;i<yTrue.length;i++) if (yTrue[i] === yPred[i]) correct++

  for (const c of labels) {
    const { tp, fp, fn, support } = byCraw[c]
    const prec = safeDiv(tp, tp + fp)
    const rec = safeDiv(tp, tp + fn)
    const f1  = safeDiv(2*prec*rec, prec+rec)
    byClass[c] = { precision: prec, recall: rec, f1, support }
    precisions.push(prec); recalls.push(rec); f1s.push(f1)
  }

  const m: Metrics = {
    accuracy: correct / yTrue.length,
    precision_macro: mean(precisions),
    recall_macro: mean(recalls),
    f1_macro: mean(f1s),
    byClass
  }

  if (proba && unique(yTrue).length === 2) {
    m.aucROC = computeAUC(yTrue, proba)
  }
  return m
}

function computeAUC(yTrue: number[], scores: number[]) {
  const pairs = yTrue.map((y,i)=>({ y, s: scores[i] }))
  pairs.sort((a,b)=> b.s - a.s)
  let pos=0, neg=0
  for (const p of pairs) (p.y===1 ? pos++ : neg++)
  if (pos===0 || neg===0) return 0.5
  let rank=1, sumPosRanks=0
  for (const p of pairs){
    if (p.y===1) sumPosRanks += rank
    rank++
  }
  return (sumPosRanks - pos*(pos+1)/2) / (pos*neg)
}

export function applySMOTEIfNeeded(data: Dataset): Dataset {
  const classes = unique(data.y)
  if (classes.length === 2) return smoteBinary(data.X, data.y, 5)
  if (classes.length > 2) return smoteMulticlass(data.X, data.y, 5)
  return data
}

export function trainRandomForest(
  raw: Dataset,
  {
    nEstimators = 100,
    maxFeatures = 0.8,
    replacement = true,
    seed = 42,
    useSmote = false,
    testSize = 0.2,
  }: TrainOptions = {}
) {
  const { Xtrain, ytrain, Xtest, ytest } = trainTestSplit(raw.X, raw.y, testSize, seed)
  const trainData = useSmote ? applySMOTEIfNeeded({ X: Xtrain, y: ytrain }) : { X: Xtrain, y: ytrain }

  const rf = new RFClassifier({ nEstimators, maxFeatures, replacement, seed })
  rf.train(trainData.X, trainData.y)

  const yPred = rf.predict(Xtest) as number[]

  let proba: number[] | undefined
  const anyModel = rf as any
  if (typeof anyModel.predictProba === "function") {
    const probs = anyModel.predictProba(Xtest) as number[] | number[][]
    if (Array.isArray(probs) && probs.length && Array.isArray(probs[0])) {
      const labels = Array.from(new Set(raw.y)).sort((a:any,b:any)=>a-b)
      const idx1 = labels.indexOf(1)
      if (idx1 >= 0) proba = (probs as number[][]).map(p => p[idx1])
    } else if (Array.isArray(probs)) {
      proba = probs as number[]
    }
  }

  const metrics = metricsFromPred(ytest, yPred, proba)

  return {
    model: rf,
    metrics,
    test: { yTrue: ytest, yPred, proba },
    options: { nEstimators, maxFeatures, replacement, seed, useSmote, testSize }
  }
}
