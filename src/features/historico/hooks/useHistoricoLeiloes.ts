import { useEffect, useState } from 'react'
import type { Leilao } from '../../../types'
import { hojeISO } from '../../../shared/utils/formatters'
import { gerarId } from '../../../shared/utils/id'
import { gravarNoStorage, lerDoStorage } from '../../../shared/utils/storage'

const CHAVE_STORAGE = 'leiloes:historico'

export function useHistoricoLeiloes() {
  const [leiloes, setLeiloes] = useState<Leilao[]>(() => lerDoStorage<Leilao[]>(CHAVE_STORAGE) ?? [])

  useEffect(() => {
    gravarNoStorage(CHAVE_STORAGE, leiloes)
  }, [leiloes])

  function salvar(leilao: Leilao) {
    setLeiloes((prev) => {
      const existe = prev.some((l) => l.id === leilao.id)
      const atualizado = { ...leilao, atualizadoEm: new Date().toISOString() }
      return existe
        ? prev.map((l) => (l.id === leilao.id ? atualizado : l))
        : [...prev, atualizado]
    })
  }

  function remover(id: string) {
    setLeiloes((prev) => prev.filter((l) => l.id !== id))
  }

  function duplicar(id: string): Leilao | null {
    const original = leiloes.find((l) => l.id === id)
    if (!original) return null

    const agora = new Date().toISOString()
    const copia: Leilao = {
      ...original,
      id: gerarId(),
      data: hojeISO(),
      criadoEm: agora,
      atualizadoEm: agora,
      saidasLeilao: original.saidasLeilao.map((item) => ({ ...item, id: gerarId() })),
      saidasOperacionais: original.saidasOperacionais.map((item) => ({ ...item, id: gerarId() })),
      valoresAReceber: original.valoresAReceber.map((item) => ({ ...item, id: gerarId() })),
    }
    return copia
  }

  const leiloesOrdenados = [...leiloes].sort((a, b) => b.data.localeCompare(a.data))

  return { leiloes: leiloesOrdenados, salvar, remover, duplicar }
}
