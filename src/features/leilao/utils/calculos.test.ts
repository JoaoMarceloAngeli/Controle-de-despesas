import { describe, expect, it } from 'vitest'
import type { Leilao } from '../../../types'
import { calcularComissao, calcularRateioSocios, calcularResumoFinanceiro, somarValores } from './calculos'

function criarLeilao(sobrescritas: Partial<Leilao> = {}): Leilao {
  return {
    id: 'leilao-1',
    data: '2026-07-07',
    criadoEm: '2026-07-07T00:00:00.000Z',
    atualizadoEm: '2026-07-07T00:00:00.000Z',
    saidasLeilao: [],
    saidasOperacionais: [],
    valoresAReceber: [],
    totalVendas: 0,
    percentualComissao: 0,
    descontos: 0,
    saldoAnterior: 0,
    saldoNegativoAcumulado: 0,
    ...sobrescritas,
  }
}

describe('somarValores', () => {
  it('soma o valor dos itens', () => {
    expect(somarValores([{ valor: 10 }, { valor: 5.5 }])).toBe(15.5)
  })

  it('trata valores não finitos como zero', () => {
    expect(somarValores([{ valor: 10 }, { valor: Number.NaN }])).toBe(10)
  })

  it('retorna zero para lista vazia', () => {
    expect(somarValores([])).toBe(0)
  })
})

describe('calcularComissao', () => {
  it('aplica o percentual sobre o total de vendas', () => {
    expect(calcularComissao(10000, 5)).toBe(500)
  })

  it('trata entradas não finitas como zero', () => {
    expect(calcularComissao(Number.NaN, 5)).toBe(0)
    expect(calcularComissao(10000, Number.NaN)).toBe(0)
  })
})

describe('calcularRateioSocios', () => {
  it('divide a comissão igualmente entre os sócios fixos', () => {
    const rateio = calcularRateioSocios(300)
    expect(rateio).toHaveLength(3)
    expect(rateio.every((parte) => parte.valor === 100)).toBe(true)
  })
})

describe('calcularResumoFinanceiro', () => {
  it('soma os três blocos de saída/recebimento separadamente', () => {
    const leilao = criarLeilao({
      saidasLeilao: [{ id: '1', nome: 'A', valor: 100 }],
      saidasOperacionais: [{ id: '2', descricao: 'B', valor: 50, data: '2026-07-01' }],
      valoresAReceber: [{ id: '3', descricao: 'C', valor: 30 }],
    })

    const resumo = calcularResumoFinanceiro(leilao)

    expect(resumo.totalSaidasLeilao).toBe(100)
    expect(resumo.totalSaidasOperacionais).toBe(50)
    expect(resumo.totalAReceber).toBe(30)
  })

  it('calcula o saldo final combinando comissão, descontos, saídas, saldo anterior, a receber e saldo negativo acumulado', () => {
    const leilao = criarLeilao({
      totalVendas: 10000,
      percentualComissao: 10, // comissão = 1000
      descontos: 50,
      saidasLeilao: [{ id: '1', nome: 'A', valor: 200 }],
      saidasOperacionais: [{ id: '2', descricao: 'B', valor: 100, data: '2026-07-01' }],
      valoresAReceber: [{ id: '3', descricao: 'C', valor: 80 }],
      saldoAnterior: 40,
      saldoNegativoAcumulado: 20,
    })

    const resumo = calcularResumoFinanceiro(leilao)

    // 1000 - 50 - (200 + 100) - 40 + 80 - 20 = 670
    expect(resumo.saldoFinalPlanilhado).toBe(670)
  })

  it('não deixa campos numéricos inválidos quebrarem o cálculo', () => {
    const leilao = criarLeilao({
      totalVendas: Number.NaN,
      descontos: Number.NaN,
      saldoAnterior: Number.NaN,
      saldoNegativoAcumulado: Number.NaN,
    })

    const resumo = calcularResumoFinanceiro(leilao)

    expect(resumo.saldoFinalPlanilhado).toBe(0)
  })
})
