import type { AuthResponse, AuthSession, OtpChallenge } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5191/api'
const SESSION_KEY = 'folio:auth'

type LoginRequest = {
  email: string
  password: string
}

type RegisterRequest = LoginRequest & {
  name: string
}

type VerifyRegistrationRequest = {
  email: string
  otp: string
}

type ApiError = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

async function postJson<TResponse>(
  path: string,
  body: LoginRequest | RegisterRequest | VerifyRegistrationRequest,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<TResponse>
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    const validationMessages = data.errors ? Object.values(data.errors).flat() : []
    return data.message ?? validationMessages[0] ?? data.title ?? 'Authentication failed.'
  } catch {
    return 'Authentication failed.'
  }
}

function loadSession(): AuthSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return value ? (JSON.parse(value) as AuthSession) : null
  } catch {
    return null
  }
}

function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export const AuthService = {
  login: (request: LoginRequest) => postJson<AuthResponse>('/auth/login', request),
  requestRegistrationOtp: (request: RegisterRequest) => postJson<OtpChallenge>('/auth/register', request),
  verifyRegistration: (request: VerifyRegistrationRequest) =>
    postJson<AuthResponse>('/auth/verify-registration', request),
  loadSession,
  saveSession,
  clearSession,
}
