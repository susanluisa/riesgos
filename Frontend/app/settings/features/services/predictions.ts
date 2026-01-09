import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface PredictionType {
  id: number
  project_id?: number | null
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/predictions"

export const fetchPredictions = async (options?: { auth?: boolean; projectId?: number | null }): Promise<PredictionType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<PredictionType[]>(route, {
    ...config,
    params: options?.projectId !== undefined ? { project_id: options.projectId } : undefined,
  })
  return response.data
}

export const createPrediction = async (data: Partial<PredictionType>): Promise<PredictionType> => {
  const response = await apiPrivateClient.post<PredictionType>(route, data, withAuthHeaders())
  return response.data
}

export const predictionKeys = {
  all: ["predictions"] as const,
}

export const usePredictionsQuery = (options?: { enabled?: boolean; auth?: boolean; projectId?: number | null }) =>
  useQuery({
    queryKey: options?.projectId !== undefined ? [...predictionKeys.all, options.projectId] : predictionKeys.all,
    queryFn: () => fetchPredictions({ auth: options?.auth, projectId: options?.projectId }),
    enabled: options?.enabled ?? true,
  })

export const useCreatePredictionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: predictionKeys.all })
    },
  })
}

