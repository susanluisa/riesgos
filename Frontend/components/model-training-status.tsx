"use client"

import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface ModelTrainingStatusProps {
  progress: number
}

export function ModelTrainingStatus({ progress }: ModelTrainingStatusProps) {
  // Format progress to 1 decimal place
  const formattedProgress = progress.toFixed(1)

  // Determine the current training phase based on progress
  const getTrainingPhase = () => {
    if (progress < 20) return "Initializing training environment..."
    if (progress < 40) return "Preprocessing data..."
    if (progress < 60) return "Training model..."
    if (progress < 80) return "Evaluating model performance..."
    if (progress < 95) return "Finalizing model..."
    return "Completing training..."
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <AlertDescription>Model training in progress. Please do not close this page.</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{getTrainingPhase()}</span>
          <span className="text-sm font-medium">{formattedProgress}%</span>
        </div>
        <Progress value={Number.parseFloat(formattedProgress)} className="h-2" />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Estimated time remaining: {Math.ceil((100 - progress) / 10)} minutes</p>
      </div>
    </div>
  )
}
