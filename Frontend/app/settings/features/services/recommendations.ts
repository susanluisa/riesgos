import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export type RecommendationStatus = "open" | "in_progress" | "closed" | string

export interface RecommendationType {
  id: number
  project_id?: number | null
  status?: RecommendationStatus
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/recommendations"

export const fetchRecommendations = async (options?: {
  auth?: boolean
  projectId?: number | null
  statusFilter?: RecommendationStatus | null
}): Promise<RecommendationType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<RecommendationType[]>(route, {
    ...config,
    params:
      options?.projectId !== undefined || options?.statusFilter !== undefined
        ? { project_id: options?.projectId, status_filter: options?.statusFilter }
        : undefined,
  })
  return response.data
}

export const fetchRecommendation = async (id: number, options?: { auth?: boolean }): Promise<RecommendationType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<RecommendationType>(`${route}/${id}`, config)
  return response.data
}

export const createRecommendation = async (data: Partial<RecommendationType>): Promise<RecommendationType> => {
  const response = await apiPrivateClient.post<RecommendationType>(route, data, withAuthHeaders())
  return response.data
}

export const updateRecommendation = async (id: number, data: Partial<RecommendationType>): Promise<RecommendationType> => {
  const response = await apiPrivateClient.patch<RecommendationType>(`${route}/${id}`, data, withAuthHeaders())
  return response.data
}

export const updateRecommendationStatus = async (id: number, data: { status: RecommendationStatus }): Promise<RecommendationType> => {
  const response = await apiPrivateClient.patch<RecommendationType>(`${route}/${id}/status`, data, withAuthHeaders())
  return response.data
}

export const recommendationKeys = {
  all: ["recommendations"] as const,
  detail: (id: number) => [...recommendationKeys.all, id] as const,
}

export const useRecommendationsQuery = (options?: {
  enabled?: boolean
  auth?: boolean
  projectId?: number | null
  statusFilter?: RecommendationStatus | null
}) =>
  useQuery({
    queryKey:
      options?.projectId !== undefined || options?.statusFilter !== undefined
        ? [...recommendationKeys.all, options?.projectId, options?.statusFilter]
        : recommendationKeys.all,
    queryFn: () => fetchRecommendations({ auth: options?.auth, projectId: options?.projectId, statusFilter: options?.statusFilter }),
    enabled: options?.enabled ?? true,
  })

export const useRecommendationQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: recommendationKeys.detail(id),
    queryFn: () => fetchRecommendation(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateRecommendationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all })
    },
  })
}

export const useUpdateRecommendationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RecommendationType> }) => updateRecommendation(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all })
      queryClient.invalidateQueries({ queryKey: recommendationKeys.detail(variables.id) })
    },
  })
}

export const useUpdateRecommendationStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RecommendationStatus }) => updateRecommendationStatus(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all })
      queryClient.invalidateQueries({ queryKey: recommendationKeys.detail(variables.id) })
    },
  })
}

