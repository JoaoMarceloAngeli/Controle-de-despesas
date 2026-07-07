import { describe, expect, it } from 'vitest'
import type { Leilao } from '../../../types'
import { calcularResumoDashboard, filtrarLeiloesPorPeriodo } from './agregados'

function criarLeilao(sobrescritas: Partial<Leilao> = {}): Leilao {
  return {
    id: sobrescritas.id ?? 'leilao-1',
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

describe('filtrarLeiloesPorPeriodo', () => {
  const leiloes = [
    criarLeilao({ id: 'a', data: '2026-01-10' }),
    criarLeilao({ id: 'b', data: '2026-03-15' }),
    criarLeilao({ id: 'c', data: '2026-06-01' }),
  ]

  it('mantém todos quando não há filtro', () => {
    expect(filtrarLeiloesPorPeriodo(leiloes, '', '')).toHaveLength(3)
  })

  it('filtra apenas por data inicial', () => {
    const resultado = filtrarLeiloesPorPeriodo(leiloes, '2026-03-01', '')
    expect(resultado.map((l) => l.id)).toEqual(['b', 'c'])
  })

  it('filtra apenas por data final', () => {
    const resultado = filtrarLeiloesPorPeriodo(leiloes, '', '2026-03-15')
    expect(resultado.map((l) => l.id)).toEqual(['a', 'b'])
  })

  it('filtra por intervalo fechado dos dois lados', () => {
    const resultado = filtrarLeiloesPorPeriodo(leiloes, '2026-02-01', '2026-05-01')
    expect(resultado.map((l) => l.id)).toEqual(['b'])
  })
})

describe('calcularResumoDashboard', () => {
  it('retorna zeros quando não há leilões', () => {
    const resumo = calcularResumoDashboard([])
    expect(resumo.quantidadeLeiloes).toBe(0)
    expect(resumo.totalVendas).toBe(0)
    expect(resumo.mediaVendas).toBe(0)
    expect(Object.values(resumo.rateioPorSocio).every((v) => v === 0)).toBe(true)
  })

  it('soma vendas, saídas e a receber de todos os leilões', () => {
    const leiloes = [
      criarLeilao({
        id: 'a',
        totalVendas: 1000,
        saidasLeilao: [{ id: 's1', nome: 'X', valor: 100 }],
        saidasOperacionais: [{ id: 's2', descricao: 'Y', valor: 50, data: '2026-01-01' }],
        valoresAReceber: [{ id: 's3', descricao: 'Z', valor: 20 }],
      }),
      criarLeilao({
        id: 'b',
        totalVendas: 2000,
        saidasLeilao: [{ id: 's4', nome: 'X', valor: 200 }],
      }),
    ]

    const resumo = calcularResumoDashboard(leiloes)

    expect(resumo.quantidadeLeiloes).toBe(2)
    expect(resumo.totalVendas).toBe(3000)
    expect(resumo.totalSaidas).toBe(350) // 100+50+200
    expect(resumo.totalAReceber).toBe(20)
    expect(resumo.mediaVendas).toBe(1500)
    expect(resumo.mediaSaidas).toBe(175)
  })

  it('soma o rateio de comissão de todos os leilões por sócio', () => {
    const leiloes = [
      criarLeilao({ id: 'a', totalVendas: 10000, percentualComissao: 10 }), // comissão 1000, 333.33 cada
      criarLeilao({ id: 'b', totalVendas: 10000, percentualComissao: 10 }),
    ]

    const resumo = calcularResumoDashboard(leiloes)
    const valores = Object.values(resumo.rateioPorSocio)

    expect(valores).toHaveLength(3)
    for (const valor of valores) {
      expect(valor).toBeCloseTo(666.67, 1)
    }
  })
})
