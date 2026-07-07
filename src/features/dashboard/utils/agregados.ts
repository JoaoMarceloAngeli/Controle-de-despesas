import { calcularResumoFinanceiro } from '../../leilao/utils/calculos'
import { SOCIOS_FIXOS } from '../../../shared/data/socios'
import type { Leilao, NomeSocio } from '../../../types'

export interface ResumoDashboard {
  quantidadeLeiloes: number
  totalVendas: number
  totalSaidas: number
  totalComissao: number
  totalAReceber: number
  saldoFinalTotal: number
  mediaVendas: number
  mediaSaidas: number
  rateioPorSocio: Record<NomeSocio, number>
}

/** Mantém um leilão se a data dele cai dentro do intervalo — limites vazios não filtram aquele lado. */
export function filtrarLeiloesPorPeriodo(leiloes: Leilao[], dataInicio: string, dataFim: string): Leilao[] {
  return leiloes.filter((leilao) => {
    if (dataInicio && leilao.data < dataInicio) return false
    if (dataFim && leilao.data > dataFim) return false
    return true
  })
}

/** Soma os resumos financeiros de uma lista de leilões (já filtrada) em totais e médias do período. */
export function calcularResumoDashboard(leiloes: Leilao[]): ResumoDashboard {
  const rateioPorSocio = Object.fromEntries(SOCIOS_FIXOS.map((socio) => [socio, 0])) as Record<NomeSocio, number>

  let totalVendas = 0
  let totalSaidas = 0
  let totalComissao = 0
  let totalAReceber = 0
  let saldoFinalTotal = 0

  for (const leilao of leiloes) {
    const resumo = calcularResumoFinanceiro(leilao)
    totalVendas += leilao.totalVendas
    totalSaidas += resumo.totalSaidasLeilao + resumo.totalSaidasOperacionais
    totalComissao += resumo.totalComissao
    totalAReceber += resumo.totalAReceber
    saldoFinalTotal += resumo.saldoFinalPlanilhado
    for (const parte of resumo.rateioSocios) {
      rateioPorSocio[parte.socio] += parte.valor
    }
  }

  const quantidadeLeiloes = leiloes.length

  return {
    quantidadeLeiloes,
    totalVendas,
    totalSaidas,
    totalComissao,
    totalAReceber,
    saldoFinalTotal,
    mediaVendas: quantidadeLeiloes ? totalVendas / quantidadeLeiloes : 0,
    mediaSaidas: quantidadeLeiloes ? totalSaidas / quantidadeLeiloes : 0,
    rateioPorSocio,
  }
}
