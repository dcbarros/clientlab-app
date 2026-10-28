import type { Interaction, InteractionStatus } from '../types'
import { api } from './api'
export async function listInteractions(): Promise<Interaction[]> { return api('/api/interactions') }
export async function createInteraction(input: Omit<Interaction, 'id' | 'protocol' | 'createdAt'>): Promise<Interaction> {
  return api('/api/interactions', 'POST', input)
}
export async function updateInteractionStatus(id: string, status: InteractionStatus): Promise<void> {
  await api(`/api/interactions/${encodeURIComponent(id)}`, 'PATCH', { status })
}
export async function deleteInteraction(id: string): Promise<void> { await api(`/api/interactions/${encodeURIComponent(id)}`, 'DELETE') }
export async function resetInteractions(): Promise<void> { await api('/api/workshop/reset/interactions', 'POST') }
