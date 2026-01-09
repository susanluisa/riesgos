import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export type UserRole = "admin" | "supervisor" | "seguridad"

export interface UserType {
  id: number
  username: string
  full_name: string
  email: string
  is_active: boolean
  phone?: string | null
  role?: UserRole | null
  department?: string | null
  is_emergency_contact?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserCreateInput {
  username: string
  full_name: string
  email: string
  password: string
  phone?: string | null
  role?: UserRole | null
  department?: string | null
  is_emergency_contact?: boolean
  is_active?: boolean
}

export interface UserUpdateInput {
  full_name?: string | null
  phone?: string | null
  department?: string | null
  role?: UserRole | null
  is_emergency_contact?: boolean | null
  is_active?: boolean | null
}

const route = "/users"

export const fetchUsers = async (options?: { auth?: boolean }): Promise<UserType[]> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<UserType[]>(route, config)
  return response.data
}

export const fetchUser = async (id: number, options?: { auth?: boolean }): Promise<UserType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<UserType>(`${route}/${id}`, config)
  return response.data
}

export const createUser = async (data: UserCreateInput): Promise<UserType> => {
  const response = await apiPrivateClient.post<UserType>(`${route}/`, data, withAuthHeaders())
  return response.data
}

export const updateUser = async (id: number, data: UserUpdateInput): Promise<UserType> => {
  const response = await apiPrivateClient.patch<UserType>(`${route}/${id}`, data, withAuthHeaders())
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

export const useUserQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => fetchUser(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateInput }) => updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) })
    },
  })
}
