import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// API Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(HTTP_STATUS.BAD_REQUEST, message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(HTTP_STATUS.NOT_FOUND, `${resource} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

// Response helpers
export function handleApiError(error: unknown): ApiResponse {
  if (error instanceof ApiError) {
    return createErrorResponse(error.code || "API_ERROR", error.message)
  }

  if (error instanceof Error) {
    return createErrorResponse("INTERNAL_ERROR", error.message)
  }

  return createErrorResponse("UNKNOWN_ERROR", "An unknown error occurred")
}

export async function withErrorHandling<T>(operation: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const result = await operation()
    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(createSuccessResponse(data), { status })
}

export function fail(error: string | any, status = 500): NextResponse {
  const errorMessage = typeof error === "string" ? error : error?.message || "An error occurred"
  return NextResponse.json(createErrorResponse("API_ERROR", errorMessage), { status })
}
