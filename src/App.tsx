import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import { isAuthenticated, isAdmin } from './services/authService'
import { api, getSession, SESSION_KEY, type User } from './services/api'
import { Users } from './pages/Users'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { ClientForm } from './pages/ClientForm'
import { Interactions } from './pages/Interactions'

function normalizeHash(): string {
  return window.location.hash.replace(/^#/, '') || '/login'
}

export default function App() {
  const [route, setRoute] = useState(normalizeHash())

  useEffect(() => {
    const refresh = () => setRoute(normalizeHash())
    window.addEventListener('clientlab:auth-changed', refresh)
    if (isAuthenticated()) void api<User>('/api/auth/me').then(user => {
      const session = getSession(); if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, user }))
    }).catch(() => { /* API handles expired or revoked sessions. */ })
    return () => window.removeEventListener('clientlab:auth-changed', refresh)
  }, [])

  useEffect(() => {
    const listener = () => setRoute(normalizeHash())
    window.addEventListener('hashchange', listener)
    if (!window.location.hash) window.location.hash = '#/login'
    return () => window.removeEventListener('hashchange', listener)
  }, [])

  function navigate(path: string) {
    window.location.hash = `#${path}`
  }

  const authenticated = isAuthenticated()
  if (!authenticated && route !== '/login') {
    if (window.location.hash !== '#/login') window.location.hash = '#/login'
    return <Login navigate={navigate} />
  }

  if (route === '/login') {
    if (authenticated) {
      if (window.location.hash !== '#/dashboard') window.location.hash = '#/dashboard'
      return null
    }
    return <Login navigate={navigate} />
  }

  let page = <Dashboard navigate={navigate} />
  if (route === '/usuarios') page = isAdmin() ? <Users /> : <div className="page">Acesso restrito ao instrutor.</div>
  else if (route === '/clientes') page = <Clients navigate={navigate} />
  else if (route === '/atendimentos') page = <Interactions />
  else if (route === '/clientes/novo') page = <ClientForm navigate={navigate} />
  else {
    const match = route.match(/^\/clientes\/(\d+)\/editar$/)
    if (match) page = <ClientForm cpf={match[1]} navigate={navigate} />
  }

  return <Layout route={route} navigate={navigate}>{page}</Layout>
}
