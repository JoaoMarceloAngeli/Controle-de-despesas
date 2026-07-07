import { useEffect, useMemo, useState } from 'react'
import type { GastoFixo, Leilao, Participante, SaidaLeilao, SaidaOperacional, ValorAReceber } from '../../../types'
import { calcularResumoFinanceiro } from '../utils/calculos'
import { hojeISO } from '../../../shared/utils/formatters'
import { gerarId } from '../../../shared/utils/id'

/**
 * Garante que todo participante/gasto fixo ainda cadastrado tenha um item
 * correspondente nas saídas, e remove os itens de fixos que já foram
 * excluídos do cadastro — nunca toca em itens lançados manualmente.
 * Retorna a mesma referência de `leilao` quando não há nada a ajustar.
 */
export function sincronizarFixos(
  leilao: Leilao,
  participantesFixos: Participante[],
  gastosFixos: GastoFixo[],
): Leilao {
  const idsParticipantesAtivos = new Set(participantesFixos.map((p) => p.id))
  const idsGastosAtivos = new Set(gastosFixos.map((g) => g.id))

  const saidasLeilaoSemExcluidos = leilao.saidasLeilao.filter((item) => {
    if (item.participanteFixoId) return idsParticipantesAtivos.has(item.participanteFixoId)
    if (item.gastoFixoId) return idsGastosAtivos.has(item.gastoFixoId)
    return true
  })
  const saidasOperacionaisSemExcluidos = leilao.saidasOperacionais.filter((item) =>
    item.gastoFixoId ? idsGastosAtivos.has(item.gastoFixoId) : true,
  )

  const idsParticipantesPresentes = new Set(
    saidasLeilaoSemExcluidos.map((item) => item.participanteFixoId).filter(Boolean),
  )
  const novosParticipantes: SaidaLeilao[] = participantesFixos
    .filter((p) => !idsParticipantesPresentes.has(p.id))
    .map((p) => ({ id: gerarId(), nome: p.nome, valor: 0, participanteFixoId: p.id }))

  const idsGastosLeilaoPresentes = new Set(
    saidasLeilaoSemExcluidos.map((item) => item.gastoFixoId).filter(Boolean),
  )
  const novosGastosLeilao: SaidaLeilao[] = gastosFixos
    .filter((g) => g.destino === 'saidasLeilao' && !idsGastosLeilaoPresentes.has(g.id))
    .map((g) => ({ id: gerarId(), nome: g.nome, valor: g.valor, gastoFixoId: g.id }))

  const idsGastosOperacionaisPresentes = new Set(
    saidasOperacionaisSemExcluidos.map((item) => item.gastoFixoId).filter(Boolean),
  )
  const novosGastosOperacionais: SaidaOperacional[] = gastosFixos
    .filter((g) => g.destino === 'saidasOperacionais' && !idsGastosOperacionaisPresentes.has(g.id))
    .map((g) => ({
      id: gerarId(),
      descricao: g.nome,
      valor: g.valor,
      data: g.dataPagamento ?? hojeISO(),
      gastoFixoId: g.id,
    }))

  const nadaMudou =
    saidasLeilaoSemExcluidos.length === leilao.saidasLeilao.length &&
    saidasOperacionaisSemExcluidos.length === leilao.saidasOperacionais.length &&
    novosParticipantes.length === 0 &&
    novosGastosLeilao.length === 0 &&
    novosGastosOperacionais.length === 0

  if (nadaMudou) return leilao

  return {
    ...leilao,
    saidasLeilao: [...saidasLeilaoSemExcluidos, ...novosParticipantes, ...novosGastosLeilao],
    saidasOperacionais: [...saidasOperacionaisSemExcluidos, ...novosGastosOperacionais],
  }
}

export function criarLeilaoVazio(participantesFixos: Participante[] = [], gastosFixos: GastoFixo[] = []): Leilao {
  const agora = new Date().toISOString()
  const base: Leilao = {
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
  return sincronizarFixos(base, participantesFixos, gastosFixos)
}

/**
 * Estado de um leilão em edição, com CRUD dos 3 blocos de itens e cálculo do resumo.
 * Enquanto o leilão não vier de um registro já salvo no histórico, ele acompanha ao
 * vivo qualquer alteração nos participantes/gastos fixos (veja `sincronizarFixos`).
 */
export function useLeilao(
  leilaoInicial?: Leilao,
  participantesFixos: Participante[] = [],
  gastosFixos: GastoFixo[] = [],
) {
  const [leilao, setLeilao] = useState<Leilao>(
    () => leilaoInicial ?? criarLeilaoVazio(participantesFixos, gastosFixos),
  )
  const [sincronizarComFixos, setSincronizarComFixos] = useState(!leilaoInicial)

  useEffect(() => {
    if (!sincronizarComFixos) return
    setLeilao((prev) => sincronizarFixos(prev, participantesFixos, gastosFixos))
  }, [sincronizarComFixos, participantesFixos, gastosFixos])

  function atualizarCampo<K extends keyof Leilao>(campo: K, valor: Leilao[K]) {
    setLeilao((prev) => ({ ...prev, [campo]: valor, atualizadoEm: new Date().toISOString() }))
  }

  /**
   * Carrega um leilão existente. Por padrão (ex.: abrir um item do histórico) a
   * sincronização automática de fixos fica desligada, para não reescrever um
   * registro já salvo; passe `ativarSincronizacaoFixos: true` para leilões que
   * ainda não têm identidade própria no histórico (ex.: duplicar um leilão).
   */
  function carregarLeilao(novoLeilao: Leilao, opcoes?: { ativarSincronizacaoFixos?: boolean }) {
    setSincronizarComFixos(opcoes?.ativarSincronizacaoFixos ?? false)
    setLeilao(novoLeilao)
  }

  function novoLeilao() {
    setSincronizarComFixos(true)
    setLeilao(criarLeilaoVazio(participantesFixos, gastosFixos))
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
