import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface ProjectType {
  id: number
  name?: string
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/projects"

export const fetchProjects = async (options?: { auth?: boolean }): Promise<ProjectType[]> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<ProjectType[]>(route, config)
  return response.data
}

export const fetchProject = async (id: number, options?: { auth?: boolean }): Promise<ProjectType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<ProjectType>(`${route}/${id}`, config)
  return response.data
}

export const createProject = async (data: Partial<ProjectType>): Promise<ProjectType> => {
  const response = await apiPrivateClient.post<ProjectType>(route, data, withAuthHeaders())
  return response.data
}

export const updateProject = async (id: number, data: Partial<ProjectType>): Promise<ProjectType> => {
  const response = await apiPrivateClient.patch<ProjectType>(`${route}/${id}`, data, withAuthHeaders())
  return response.data
}

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number) => [...projectKeys.all, id] as const,
}

export const useProjectsQuery = (options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: projectKeys.all,
    queryFn: () => fetchProjects({ auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useProjectQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectType> }) => updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
    },
  })
}

