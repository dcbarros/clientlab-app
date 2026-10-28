import { useEffect, useState } from 'react'
import type { Client } from '../types'
import { listClients, resetWorkshopData } from '../services/clientService'

interface DashboardProps { navigate: (path: string) => void }

export function Dashboard({ navigate }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setError(''); setClients(await listClients()) } catch { setError('Não foi possível carregar os clientes. Tente novamente.') } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const withRelationships = clients.filter((client) => client.relationships.length > 0).length
  const pj = clients.filter((client) => client.clientTypes.includes('Pessoa jurídica')).length

  return (
    <div className="page">
      <header className="page-header">
        <div><span className="eyebrow">Visão geral</span><h1>Dashboard</h1><p>Acompanhe a base usada nos exercícios do workshop.</p></div>
        <button className="button button--primary" onClick={() => navigate('/clientes/novo')} data-cy="dashboard-new-client">+ Novo cliente</button>
      </header>
      {error && <div role="alert" className="alert alert--error">{error}</div>}
      <section className="stats-grid" aria-label="Indicadores">
        <article className="stat-card"><span>Clientes cadastrados</span><strong>{loading ? '—' : clients.length}</strong><small>Dados da sua conta no servidor</small></article>
        <article className="stat-card"><span>Com perfil PJ</span><strong>{loading ? '—' : pj}</strong><small>Cliente pode ter mais de um tipo</small></article>
        <article className="stat-card"><span>Com relacionamentos</span><strong>{loading ? '—' : withRelationships}</strong><small>Contatos associados ao cadastro</small></article>
      </section>
      <section className="panel-grid">
        <article className="panel">
          <div className="panel__header"><div><h2>Ações rápidas</h2><p>Fluxos mais usados durante o treinamento.</p></div></div>
          <div className="quick-actions">
            <button onClick={() => navigate('/clientes')}><span>01</span><strong>Consultar clientes</strong><small>Pesquisa, tabela e navegação.</small></button>
            <button onClick={() => navigate('/clientes/novo')}><span>02</span><strong>Cadastrar cliente</strong><small>Formulário, componentes e validações.</small></button>
            <button onClick={() => navigate('/atendimentos')} data-cy="dashboard-lab"><span>03</span><strong>Abrir atendimentos</strong><small>Área demonstrativa de componentes e tabela.</small></button>
            <button onClick={async () => { try { await resetWorkshopData(); await load() } catch { setError('Não foi possível restaurar os clientes.') } }} data-cy="reset-workshop"><span>04</span><strong>Restaurar clientes</strong><small>Volta a base de clientes ao estado inicial.</small></button>
          </div>
        </article>
        <article className="panel panel--accent"><span className="eyebrow">Workshop</span><h2>Ambiente preparado para repetição</h2><p>Cada conta possui sua própria base de treinamento. Restaure seus clientes quando precisar repetir os exercícios.</p><div className="status-row"><span className="status-dot" />Ambiente de treinamento</div></article>
      </section>
    </div>
  )
}
