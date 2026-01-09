import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface AppSettingType {
  id: number
  key?: string
  value?: unknown
  created_at?: string
  updated_at?: string
  [field: string]: unknown
}

const route = "/settings"

export const fetchSettings = async (options?: { auth?: boolean }): Promise<AppSettingType[]> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<AppSettingType[]>(route, config)
  return response.data
}

export const fetchSetting = async (id: number, options?: { auth?: boolean }): Promise<AppSettingType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<AppSettingType>(`${route}/${id}`, config)
  return response.data
}

export const createSetting = async (data: Partial<AppSettingType>): Promise<AppSettingType> => {
  const response = await apiPrivateClient.post<AppSettingType>(route, data, withAuthHeaders())
  return response.data
}

export const updateSetting = async (id: number, data: Partial<AppSettingType>): Promise<AppSettingType> => {
  const response = await apiPrivateClient.patch<AppSettingType>(`${route}/${id}`, data, withAuthHeaders())
  return response.data
}

export const settingKeys = {
  all: ["settings"] as const,
  detail: (id: number) => [...settingKeys.all, id] as const,
}

export const useSettingsQuery = (options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: settingKeys.all,
    queryFn: () => fetchSettings({ auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useSettingQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: settingKeys.detail(id),
    queryFn: () => fetchSetting(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateSettingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.all })
    },
  })
}

export const useUpdateSettingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppSettingType> }) => updateSetting(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: settingKeys.all })
      queryClient.invalidateQueries({ queryKey: settingKeys.detail(variables.id) })
    },
  })
}

