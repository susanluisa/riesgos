import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface UserType {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_superuser: boolean
  is_staff: boolean
  is_active: boolean
  date_joined: string
}

const route = "/api/users"

export const fetchUsers = async (options?: { auth?: boolean }): Promise<UserType[]> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<UserType[]>(route, config)
  return response.data
}

export const createUser = async (data: Partial<UserType>): Promise<UserType> => {
  const response = await apiPrivateClient.post<UserType>(route, data, withAuthHeaders())
  return response.data
}

export const updateUser = async (id: number, data: Partial<UserType>): Promise<UserType> => {
  const response = await apiPrivateClient.put<UserType>(`${route}${id}/`, data, withAuthHeaders())
  return response.data
}

export const deleteUser = async (id: number): Promise<UserType> => {
  const response = await apiPrivateClient.delete<UserType>(`${route}${id}/`, withAuthHeaders())
  return response.data
}

// React Query keys
export const teamKeys = {
  all: ["team"] as const,
  detail: (id: number) => [...teamKeys.all, id] as const,
}

export const useTeamQuery = (options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: teamKeys.all,
    queryFn: () => fetchUsers({ auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserType> }) => updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) })
    },
  })
}

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) })
    },
  })
}

