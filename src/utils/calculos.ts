import { SOCIOS_FIXOS } from '../data/socios'
import type { Leilao, RateioSocio, ResumoFinanceiro } from '../types'
import { valorNumericoSeguro } from './formatters'

export function somarValores(itens: { valor: number }[]): number {
  return itens.reduce((total, item) => total + valorNumericoSeguro(item.valor), 0)
}

export function calcularComissao(totalVendas: number, percentualComissao: number): number {
  return (valorNumericoSeguro(totalVendas) * valorNumericoSeguro(percentualComissao)) / 100
}

export function calcularRateioSocios(totalComissao: number): RateioSocio[] {
  const parte = valorNumericoSeguro(totalComissao) / SOCIOS_FIXOS.length
  return SOCIOS_FIXOS.map((socio) => ({ socio, valor: parte }))
}

/**
 * Saldo final = comissão − descontos − (saídas do leilão + saídas operacionais)
 * − saldo anterior + valores a receber − saldo negativo acumulado.
 */
export function calcularResumoFinanceiro(leilao: Leilao): ResumoFinanceiro {
  const totalSaidasLeilao = somarValores(leilao.saidasLeilao)
  const totalSaidasOperacionais = somarValores(leilao.saidasOperacionais)
  const totalAReceber = somarValores(leilao.valoresAReceber)
  const totalComissao = calcularComissao(leilao.totalVendas, leilao.percentualComissao)
  const rateioSocios = calcularRateioSocios(totalComissao)

  const saldoFinalPlanilhado =
    totalComissao -
    valorNumericoSeguro(leilao.descontos) -
    (totalSaidasLeilao + totalSaidasOperacionais) -
    valorNumericoSeguro(leilao.saldoAnterior) +
    totalAReceber -
    valorNumericoSeguro(leilao.saldoNegativoAcumulado)

  return {
    totalSaidasLeilao,
    totalSaidasOperacionais,
    totalAReceber,
    totalComissao,
    rateioSocios,
    saldoFinalPlanilhado,
  }
}
