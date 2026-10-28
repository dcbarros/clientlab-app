import type { CepResult, Client } from '../types'
import { api, ApiError } from './api'
export async function listClients(): Promise<Client[]> { return api('/api/clients') }
export async function getClient(cpf: string): Promise<Client | undefined> {
  try { return await api(`/api/clients/${encodeURIComponent(cpf)}`) }
  catch (error) { if (error instanceof ApiError && error.status === 404) return undefined; throw error }
}
export async function saveClient(client: Client, originalCpf?: string): Promise<Client> {
  const saved = await api<Client>(originalCpf === undefined ? '/api/clients' : `/api/clients/${encodeURIComponent(originalCpf)}`, originalCpf === undefined ? 'POST' : 'PUT', client)
  window.dispatchEvent(new CustomEvent('clientlab:clients-changed'))
  return saved
}
export async function deleteClient(cpf: string): Promise<void> {
  await api(`/api/clients/${encodeURIComponent(cpf)}`, 'DELETE')
  window.dispatchEvent(new CustomEvent('clientlab:clients-changed'))
}
interface ViaCepResponse {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

/**
 * Consulta direta ao ViaCEP, preservada conforme o frontend original.
 */
export async function lookupCep(cep: string): Promise<CepResult | null> {
  // const normalized = cep.replace(/\D/g, '')
  const normalized = cep
  if (!/^\d{8}$/.test(normalized)) return null

  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`, {
    method: 'GET',
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Falha ao consultar o serviço de CEP.')
  }

  const data = await response.json() as ViaCepResponse
  if (data.erro) return null

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
    country: 'Brasil'
  }
}

