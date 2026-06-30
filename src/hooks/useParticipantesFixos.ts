import { useEffect, useState } from 'react'
import { PARTICIPANTES_FIXOS } from '../data/participantesFixos'
import type { Participante } from '../types'
import { gerarId } from '../utils/id'
import { gravarNoStorage, lerDoStorage } from '../utils/storage'

const CHAVE_STORAGE = 'leiloes:participantesFixos'

function semearParticipantesFixos(): Participante[] {
  return PARTICIPANTES_FIXOS.map((nome) => ({ id: gerarId(), nome }))
}

/**
 * Lista de participantes fixos editável em tempo real pela interface.
 * `src/data/participantesFixos.ts` só serve como ponto de partida na
 * primeira execução — depois disso, o localStorage é a fonte da verdade.
 */
export function useParticipantesFixos() {
  const [participantes, setParticipantes] = useState<Participante[]>(() => {
    return lerDoStorage<Participante[]>(CHAVE_STORAGE) ?? semearParticipantesFixos()
  })

  useEffect(() => {
    gravarNoStorage(CHAVE_STORAGE, participantes)
  }, [participantes])

  function adicionar(nome: string) {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return
    setParticipantes((prev) => [...prev, { id: gerarId(), nome: nomeLimpo }])
  }

  function renomear(id: string, nome: string) {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return
    setParticipantes((prev) => prev.map((p) => (p.id === id ? { ...p, nome: nomeLimpo } : p)))
  }

  function remover(id: string) {
    setParticipantes((prev) => prev.filter((p) => p.id !== id))
  }

  return { participantes, adicionar, renomear, remover }
}
