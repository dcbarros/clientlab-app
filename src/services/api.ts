export const SESSION_KEY = 'clientlab.session.v2'
export interface User { id: string; username: string; isAdmin: boolean }
export interface LoginSession { accessToken: string; expiresAt: number; user: User }
export function getSession(): LoginSession | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as LoginSession | null
    if (session && session.expiresAt * 1000 > Date.now()) return session
  } catch { /* Discard corrupt local session. */ }
  sessionStorage.removeItem(SESSION_KEY)
  return null
}
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!base) throw new Error('Configure VITE_API_URL e gere o build novamente.')
  const token = getSession()?.accessToken
  const controller = new AbortController()
  // Free hosting may take about a minute to wake up.
  const timer = window.setTimeout(() => controller.abort(), 90000)
  try {
    const response = await fetch(`${base}${path}`, {
      method, signal: controller.signal,
      headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      if (response.status === 401 && path !== '/api/auth/login') {
        sessionStorage.removeItem(SESSION_KEY)
        window.location.hash = '#/login'
        window.dispatchEvent(new Event('clientlab:auth-changed'))
      }
      throw new ApiError(typeof data?.detail === 'string' ? data.detail : 'Não foi possível concluir a operação.', response.status)
    }
    return response.status === 204 ? undefined as T : await response.json() as T
  } finally { window.clearTimeout(timer) }
}
