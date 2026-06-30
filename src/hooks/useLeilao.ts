import { useMemo, useState } from 'react'
import type { Leilao, SaidaLeilao, SaidaOperacional, ValorAReceber } from '../types'
import { calcularResumoFinanceiro } from '../utils/calculos'
import { hojeISO } from '../utils/formatters'
import { gerarId } from '../utils/id'

export function criarLeilaoVazio(): Leilao {
  const agora = new Date().toISOString()
  return {
    id: gerarId(),
    data: hojeISO(),
    criadoEm: agora,
    atualizadoEm: agora,
    saidasLeilao: [],
    saidasOperacionais: [],
    valoresAReceber: [],
    totalVendas: 0,
    percentualComissao: 0,
    descontos: 0,
    saldoAnterior: 0,
    saldoNegativoAcumulado: 0,
    observacoes: '',
  }
}

/** Estado de um leilão em edição, com CRUD dos 3 blocos de itens e cálculo do resumo. */
export function useLeilao(leilaoInicial?: Leilao) {
  const [leilao, setLeilao] = useState<Leilao>(() => leilaoInicial ?? criarLeilaoVazio())

  function atualizarCampo<K extends keyof Leilao>(campo: K, valor: Leilao[K]) {
    setLeilao((prev) => ({ ...prev, [campo]: valor, atualizadoEm: new Date().toISOString() }))
  }

  function carregarLeilao(novoLeilao: Leilao) {
    setLeilao(novoLeilao)
  }

  function novoLeilao() {
    setLeilao(criarLeilaoVazio())
  }

  // Saídas do leilão
  function adicionarSaidaLeilao(item: Omit<SaidaLeilao, 'id'>) {
    setLeilao((prev) => ({ ...prev, saidasLeilao: [...prev.saidasLeilao, { ...item, id: gerarId() }] }))
  }
  function atualizarSaidaLeilao(id: string, dados: Partial<Omit<SaidaLeilao, 'id'>>) {
    setLeilao((prev) => ({
      ...prev,
      saidasLeilao: prev.saidasLeilao.map((item) => (item.id === id ? { ...item, ...dados } : item)),
    }))
  }
  function removerSaidaLeilao(id: string) {
    setLeilao((prev) => ({ ...prev, saidasLeilao: prev.saidasLeilao.filter((item) => item.id !== id) }))
  }

  // Saídas operacionais
  function adicionarSaidaOperacional(item: Omit<SaidaOperacional, 'id'>) {
    setLeilao((prev) => ({
      ...prev,
      saidasOperacionais: [...prev.saidasOperacionais, { ...item, id: gerarId() }],
    }))
  }
  function atualizarSaidaOperacional(id: string, dados: Partial<Omit<SaidaOperacional, 'id'>>) {
    setLeilao((prev) => ({
      ...prev,
      saidasOperacionais: prev.saidasOperacionais.map((item) =>
        item.id === id ? { ...item, ...dados } : item,
      ),
    }))
  }
  function removerSaidaOperacional(id: string) {
    setLeilao((prev) => ({
      ...prev,
      saidasOperacionais: prev.saidasOperacionais.filter((item) => item.id !== id),
    }))
  }

  // Valores a receber
  function adicionarValorAReceber(item: Omit<ValorAReceber, 'id'>) {
    setLeilao((prev) => ({
      ...prev,
      valoresAReceber: [...prev.valoresAReceber, { ...item, id: gerarId() }],
    }))
  }
  function atualizarValorAReceber(id: string, dados: Partial<Omit<ValorAReceber, 'id'>>) {
    setLeilao((prev) => ({
      ...prev,
      valoresAReceber: prev.valoresAReceber.map((item) => (item.id === id ? { ...item, ...dados } : item)),
    }))
  }
  function removerValorAReceber(id: string) {
    setLeilao((prev) => ({
      ...prev,
      valoresAReceber: prev.valoresAReceber.filter((item) => item.id !== id),
    }))
  }

  const resumo = useMemo(() => calcularResumoFinanceiro(leilao), [leilao])

  return {
    leilao,
    resumo,
    atualizarCampo,
    carregarLeilao,
    novoLeilao,
    adicionarSaidaLeilao,
    atualizarSaidaLeilao,
    removerSaidaLeilao,
    adicionarSaidaOperacional,
    atualizarSaidaOperacional,
    removerSaidaOperacional,
    adicionarValorAReceber,
    atualizarValorAReceber,
    removerValorAReceber,
  }
}
