export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5191/api'
export const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5191'

type ApiError = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

export async function getErrorMessage(response: Response, defaultMessage = 'Request failed.'): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    const validationMessages = data.errors ? Object.values(data.errors).flat() : []
    return data.message ?? validationMessages[0] ?? data.title ?? defaultMessage
  } catch {
    return defaultMessage
  }
}

export async function request<TResponse>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  baseUrl: string = API_BASE_URL,
): Promise<TResponse> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export function getAvatarUrl(avatar?: string): string {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/')) return `${BACKEND_BASE_URL}${avatar}`
  return ''
}
