import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiPrivateClient, withAuthHeaders } from "@/lib/http_commons/httpCommon"

export interface DocumentType {
  id: number
  project_id?: number | null
  category_id?: number | null
  title?: string
  url?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const route = "/documents"

export const fetchDocuments = async (options?: {
  auth?: boolean
  projectId?: number | null
  categoryId?: number | null
}): Promise<DocumentType[]> => {
  const config = options?.auth ? withAuthHeaders() : {}
  const response = await apiPrivateClient.get<DocumentType[]>(route, {
    ...config,
    params:
      options?.projectId !== undefined || options?.categoryId !== undefined
        ? { project_id: options?.projectId, category_id: options?.categoryId }
        : undefined,
  })
  return response.data
}

export const fetchDocument = async (id: number, options?: { auth?: boolean }): Promise<DocumentType> => {
  const config = options?.auth ? withAuthHeaders() : undefined
  const response = await apiPrivateClient.get<DocumentType>(`${route}/${id}`, config)
  return response.data
}

export const createDocument = async (data: Partial<DocumentType>): Promise<DocumentType> => {
  const response = await apiPrivateClient.post<DocumentType>(route, data, withAuthHeaders())
  return response.data
}

export const documentKeys = {
  all: ["documents"] as const,
  detail: (id: number) => [...documentKeys.all, id] as const,
}

export const useDocumentsQuery = (options?: { enabled?: boolean; auth?: boolean; projectId?: number | null; categoryId?: number | null }) =>
  useQuery({
    queryKey:
      options?.projectId !== undefined || options?.categoryId !== undefined
        ? [...documentKeys.all, options?.projectId, options?.categoryId]
        : documentKeys.all,
    queryFn: () => fetchDocuments({ auth: options?.auth, projectId: options?.projectId, categoryId: options?.categoryId }),
    enabled: options?.enabled ?? true,
  })

export const useDocumentQuery = (id: number, options?: { enabled?: boolean; auth?: boolean }) =>
  useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => fetchDocument(id, { auth: options?.auth }),
    enabled: options?.enabled ?? true,
  })

export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

