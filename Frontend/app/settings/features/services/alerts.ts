import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export type AlertStatus = "open" | "acknowledged" | "closed" | string

export interface AlertType {
  id: number
  status?: AlertStatus
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/alerts"

export const fetchAlerts = async (options?: { auth?: boolean; statusFilter?: AlertStatus | null }): Promise<AlertType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<AlertType[]>(route, {
    ...config,
    params: options?.statusFilter !== undefined ? { status_filter: options.statusFilter } : undefined,
  })
  return response.data
}

export const updateAlertStatus = async (id: number, data: { status: AlertStatus }): Promise<AlertType> => {
  const response = await apiPrivateClient.patch<AlertType>(`${route}/${id}/status`, data, withAuthHeaders())
  return response.data
}

export const alertKeys = {
  all: ["alerts"] as const,
  detail: (id: number) => [...alertKeys.all, id] as const,
}

export const useAlertsQuery = (options?: { enabled?: boolean; auth?: boolean; statusFilter?: AlertStatus | null }) =>
  useQuery({
    queryKey: options?.statusFilter !== undefined ? [...alertKeys.all, options.statusFilter] : alertKeys.all,
    queryFn: () => fetchAlerts({ auth: options?.auth, statusFilter: options?.statusFilter }),
    enabled: options?.enabled ?? true,
  })

export const useUpdateAlertStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AlertStatus }) => updateAlertStatus(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(variables.id) })
    },
  })
}

