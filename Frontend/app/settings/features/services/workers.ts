import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface WorkerType {
  id: number
  project_id?: number | null
  name?: string
  role?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/workers"

export const fetchWorkers = async (options?: {
  auth?: boolean
  projectId?: number | null
}): Promise<WorkerType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<WorkerType[]>(route, {
    ...config,
    params: options?.projectId !== undefined ? { project_id: options.projectId } : undefined,
  })
  return response.data
}

export const fetchWorker = async (id: number, options?: { auth?: boolean }): Promise<WorkerType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<WorkerType>(`${route}/${id}`, config)
  return response.data
}

export const createWorker = async (data: Partial<WorkerType>): Promise<WorkerType> => {
  const response = await apiPrivateClient.post<WorkerType>(route, data, withAuthHeaders())
  return response.data
}

export const updateWorker = async (id: number, data: Partial<WorkerType>): Promise<WorkerType> => {
  const response = await apiPrivateClient.patch<WorkerType>(`${route}/${id}`, data, withAuthHeaders())
  return response.data
}

export const workerKeys = {
  all: ["workers"] as const,
  detail: (id: number) => [...workerKeys.all, id] as const,
}

export const useWorkersQuery = (options?: { enabled?: boolean; auth?: boolean; projectId?: number | null }) =>
  useQuery({
    queryKey: options?.projectId !== undefined ? [...workerKeys.all, options.projectId] : workerKeys.all,
    queryFn: () => fetchWorkers({ auth: options?.auth, projectId: options?.projectId ?? undefined }),
    enabled: options?.enabled ?? true,
  })

export const useWorkerQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: workerKeys.detail(id),
    queryFn: () => fetchWorker(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateWorkerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all })
    },
  })
}

export const useUpdateWorkerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkerType> }) => updateWorker(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all })
      queryClient.invalidateQueries({ queryKey: workerKeys.detail(variables.id) })
    },
  })
}

