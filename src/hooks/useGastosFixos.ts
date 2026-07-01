import { useEffect, useState } from 'react'
import { GASTOS_FIXOS } from '../data/gastosFixos'
import type { GastoFixo } from '../types'
import { gerarId } from '../utils/id'
import { gravarNoStorage, lerDoStorage } from '../utils/storage'

const CHAVE_STORAGE = 'leiloes:gastosFixos'

function semearGastosFixos(): GastoFixo[] {
  return GASTOS_FIXOS.map((gasto) => ({ ...gasto, id: gerarId() }))
}

/**
 * Lista de gastos fixos editável em tempo real pela interface. Cada gasto
 * fixo é lançado automaticamente no bloco de saída indicado em `destino`
 * sempre que um novo leilão é criado — não é uma opção manual dentro das
 * saídas (veja `criarLeilaoVazio` em `useLeilao`).
 */
export function useGastosFixos() {
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>(() => {
    return lerDoStorage<GastoFixo[]>(CHAVE_STORAGE) ?? semearGastosFixos()
  })

  useEffect(() => {
    gravarNoStorage(CHAVE_STORAGE, gastosFixos)
  }, [gastosFixos])

  function adicionar(dados: Omit<GastoFixo, 'id'>) {
    const nome = dados.nome.trim()
    if (!nome || !Number.isFinite(dados.valor) || dados.valor <= 0) return
    setGastosFixos((prev) => [
      ...prev,
      {
        id: gerarId(),
        nome,
        valor: dados.valor,
        dataPagamento: dados.dataPagamento || undefined,
        destino: dados.destino,
      },
    ])
  }

  function atualizar(id: string, dados: Partial<Omit<GastoFixo, 'id'>>) {
    setGastosFixos((prev) => prev.map((g) => (g.id === id ? { ...g, ...dados } : g)))
  }

  function remover(id: string) {
    setGastosFixos((prev) => prev.filter((g) => g.id !== id))
  }

  return { gastosFixos, adicionar, atualizar, remover }
}
