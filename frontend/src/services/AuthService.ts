import type { AuthResponse, AuthSession, OtpChallenge } from '../types';
import { request } from '../utils/api';

const SESSION_KEY = 'folio:auth';

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = LoginRequest & {
  name: string;
};

type VerifyRegistrationRequest = {
  email: string;
  otp: string;
};

type GoogleAuthRequest = {
  idToken: string;
};

async function postJson<TResponse>(
  path: string,
  body: LoginRequest | RegisterRequest | VerifyRegistrationRequest | GoogleAuthRequest
): Promise<TResponse> {
  return request<TResponse>(path, { method: 'POST', body: JSON.stringify(body) });
}

function loadSession(): AuthSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export const AuthService = {
  login: (request: LoginRequest) => postJson<AuthResponse>('/auth/login', request),
  requestRegistrationOtp: (request: RegisterRequest) =>
    postJson<OtpChallenge>('/auth/register', request),
  verifyRegistration: (request: VerifyRegistrationRequest) =>
    postJson<AuthResponse>('/auth/verify-registration', request),
  googleAuth: (request: GoogleAuthRequest) =>
    postJson<AuthResponse>('/auth/googleauth', request),
  loadSession,
  saveSession,
  clearSession,
};
