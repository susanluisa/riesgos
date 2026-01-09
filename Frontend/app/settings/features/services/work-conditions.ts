import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface WorkConditionType {
  id: number
  project_id?: number | null
  worker_id?: number | null
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/work-conditions"

export const fetchWorkConditions = async (options?: {
  auth?: boolean
  projectId?: number | null
  workerId?: number | null
}): Promise<WorkConditionType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<WorkConditionType[]>(route, {
    ...config,
    params:
      options?.projectId !== undefined || options?.workerId !== undefined
        ? { project_id: options?.projectId, worker_id: options?.workerId }
        : undefined,
  })
  return response.data
}

export const createWorkCondition = async (data: Partial<WorkConditionType>): Promise<WorkConditionType> => {
  const response = await apiPrivateClient.post<WorkConditionType>(route, data, withAuthHeaders())
  return response.data
}

export const workConditionKeys = {
  all: ["work-conditions"] as const,
}

export const useWorkConditionsQuery = (options?: { enabled?: boolean; auth?: boolean; projectId?: number | null; workerId?: number | null }) =>
  useQuery({
    queryKey:
      options?.projectId !== undefined || options?.workerId !== undefined
        ? [...workConditionKeys.all, options?.projectId, options?.workerId]
        : workConditionKeys.all,
    queryFn: () => fetchWorkConditions({ auth: options?.auth, projectId: options?.projectId, workerId: options?.workerId }),
    enabled: options?.enabled ?? true,
  })

export const useCreateWorkConditionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workConditionKeys.all })
    },
  })
}

