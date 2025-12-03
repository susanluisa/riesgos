export interface Job {
  status: "training" | "completed" | "error"
  progress: number
  results?: TrainingResult
}

export interface TrainingResult {
  accuracy: number
  loss: number
  valAccuracy: number
  valLoss: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  confusionMatrix: {
    truePositive: number
    falsePositive: number
    trueNegative: number
    falseNegative: number
  }
  featureImportance: Record<string, number>
  trainingTime: number
  createdAt: Date
  modelVersion: string
}

const jobs: Record<string, Job> = {}

export function createJob(id: string) {
  jobs[id] = { status: "training", progress: 0 }
}

export function getJob(id: string): Job | undefined {
  return jobs[id]
}

export function updateJob(id: string, update: Partial<Job>) {
  if (jobs[id]) {
    jobs[id] = { ...jobs[id], ...update }
  }
}
