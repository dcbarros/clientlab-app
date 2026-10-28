import { api, ApiError, getSession, SESSION_KEY, type LoginSession } from './api'
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const session = await api<LoginSession>('/api/auth/login', 'POST', { username, password })
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return false
    throw error
  }
}
export async function logout(): Promise<void> {
  try { await api('/api/auth/logout', 'POST') }
  finally { sessionStorage.removeItem(SESSION_KEY); window.dispatchEvent(new Event('clientlab:auth-changed')) }
}
export function isAuthenticated(): boolean { return getSession() !== null }
export function isAdmin(): boolean { return getSession()?.user.isAdmin ?? false }
