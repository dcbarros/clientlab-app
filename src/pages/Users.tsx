import { useEffect, useState, type FormEvent } from 'react'
import { api, type User } from '../services/api'
export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  async function load() { try { setUsers(await api<User[]>('/api/admin/users')) } finally { setLoading(false) } }
  useEffect(() => { void load().catch(e => setNotice(e.message)) }, [])
  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice('')
    try {
      await api('/api/admin/users', 'POST', { username, password })
      setPassword(''); setUsername(''); setNotice('Usuário criado com base inicial própria.'); await load()
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Falha ao criar usuário.') }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!pending) return
    setBusy(true)
    try { await api(`/api/admin/users/${pending.id}`, 'DELETE'); setPending(null); setNotice('Usuário, sessões e dados excluídos.'); await load() }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Falha ao excluir.') }
    finally { setBusy(false) }
  }
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Instrutor</span><h1>Usuários</h1><p>Crie uma conta por aluno. A exclusão revoga o acesso e apaga os dados dessa conta.</p></div></header>
    {notice && <div className="alert" role="status">{notice}</div>}
    <section className="panel admin-panel"><h2>Criar acesso</h2><form onSubmit={create} className="admin-user-form">
      <label className="field"><span className="field__label">Usuário</span><input className="field__control" value={username} onChange={e => setUsername(e.target.value)} required pattern="[a-zA-Z0-9_.\-]{3,80}" maxLength={80} autoComplete="off" placeholder="aluno.01" /></label>
      <label className="field"><span className="field__label">Senha (12 a 128 caracteres)</span><input className="field__control" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" /></label>
      <button className="button button--primary" disabled={busy}>Criar usuário</button>
    </form></section>
    <section className="panel admin-panel"><h2>Contas cadastradas</h2>{loading ? <p>Carregando…</p> : <div className="admin-user-list">{users.map(user => <div className="admin-user-row" key={user.id}><span><strong>{user.username}</strong> · {user.isAdmin ? 'Instrutor' : 'Aluno'}</span>{!user.isAdmin && <button className="button" disabled={busy} onClick={() => setPending(user)}>Excluir</button>}</div>)}</div>}</section>
    {pending && <div className="admin-confirm-backdrop"><section className="panel admin-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-user-title"><h2 id="delete-user-title">Excluir {pending.username}?</h2><p>Isso apaga todos os clientes e atendimentos dessa conta e encerra seu acesso.</p><button className="button button--primary" disabled={busy} onClick={() => void remove()}>Confirmar exclusão</button> <button className="button" disabled={busy} onClick={() => setPending(null)}>Cancelar</button></section></div>}
  </div>
}
