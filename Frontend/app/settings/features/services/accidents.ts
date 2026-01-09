import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface AccidentType {
  id: number
  project_id?: number | null
  worker_id?: number | null
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/accidents"

export const fetchAccidents = async (options?: {
  auth?: boolean
  projectId?: number | null
  workerId?: number | null
}): Promise<AccidentType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<AccidentType[]>(route, {
    ...config,
    params:
      options?.projectId !== undefined || options?.workerId !== undefined
        ? { project_id: options?.projectId, worker_id: options?.workerId }
        : undefined,
  })
  return response.data
}

export const fetchAccident = async (id: number, options?: { auth?: boolean }): Promise<AccidentType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<AccidentType>(`${route}/${id}`, config)
  return response.data
}

export const createAccident = async (data: Partial<AccidentType>): Promise<AccidentType> => {
  const response = await apiPrivateClient.post<AccidentType>(route, data, withAuthHeaders())
  return response.data
}

export const accidentKeys = {
  all: ["accidents"] as const,
  detail: (id: number) => [...accidentKeys.all, id] as const,
}

export const useAccidentsQuery = (options?: { enabled?: boolean; auth?: boolean; projectId?: number | null; workerId?: number | null }) =>
  useQuery({
    queryKey:
      options?.projectId !== undefined || options?.workerId !== undefined
        ? [...accidentKeys.all, options?.projectId, options?.workerId]
        : accidentKeys.all,
    queryFn: () => fetchAccidents({ auth: options?.auth, projectId: options?.projectId, workerId: options?.workerId }),
    enabled: options?.enabled ?? true,
  })

export const useAccidentQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: accidentKeys.detail(id),
    queryFn: () => fetchAccident(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateAccidentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAccident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accidentKeys.all })
    },
  })
}

