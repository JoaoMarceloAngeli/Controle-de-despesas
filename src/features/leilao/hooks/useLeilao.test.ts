import { describe, expect, it } from 'vitest'
import type { GastoFixo, Leilao, Participante } from '../../../types'
import { criarLeilaoVazio, sincronizarFixos } from './useLeilao'

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

const participante: Participante = { id: 'p1', nome: 'Fulano' }
const gastoLeilao: GastoFixo = { id: 'g1', nome: 'Comissão leiloeiro', valor: 100, destino: 'saidasLeilao' }
const gastoOperacional: GastoFixo = {
  id: 'g2',
  nome: 'Aluguel',
  valor: 200,
  dataPagamento: '2026-07-05',
  destino: 'saidasOperacionais',
}

describe('sincronizarFixos', () => {
  it('lança participantes fixos ausentes com valor zero em saídas do leilão', () => {
    const leilao = criarLeilao()
    const resultado = sincronizarFixos(leilao, [participante], [])

    expect(resultado.saidasLeilao).toHaveLength(1)
    expect(resultado.saidasLeilao[0]).toMatchObject({
      nome: 'Fulano',
      valor: 0,
      participanteFixoId: 'p1',
    })
  })

  it('lança gasto fixo no bloco correto conforme o destino', () => {
    const leilao = criarLeilao()
    const resultado = sincronizarFixos(leilao, [], [gastoLeilao, gastoOperacional])

    expect(resultado.saidasLeilao).toHaveLength(1)
    expect(resultado.saidasLeilao[0]).toMatchObject({ nome: 'Comissão leiloeiro', valor: 100, gastoFixoId: 'g1' })

    expect(resultado.saidasOperacionais).toHaveLength(1)
    expect(resultado.saidasOperacionais[0]).toMatchObject({
      descricao: 'Aluguel',
      valor: 200,
      data: '2026-07-05',
      gastoFixoId: 'g2',
    })
  })

  it('usa a data de hoje quando o gasto fixo operacional não tem dataPagamento', () => {
    const leilao = criarLeilao()
    const semData: GastoFixo = { ...gastoOperacional, dataPagamento: undefined }
    const resultado = sincronizarFixos(leilao, [], [semData])

    expect(resultado.saidasOperacionais[0]?.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('remove itens de fixos que foram excluídos do cadastro', () => {
    const leilao = criarLeilao({
      saidasLeilao: [{ id: 's1', nome: 'Fulano', valor: 50, participanteFixoId: 'p1' }],
    })
    const resultado = sincronizarFixos(leilao, [], [])

    expect(resultado.saidasLeilao).toHaveLength(0)
  })

  it('nunca remove itens lançados manualmente', () => {
    const leilao = criarLeilao({
      saidasLeilao: [{ id: 's1', nome: 'Item manual', valor: 999 }],
    })
    const resultado = sincronizarFixos(leilao, [], [])

    expect(resultado.saidasLeilao).toEqual(leilao.saidasLeilao)
  })

  it('retorna a mesma referência quando nada precisa mudar', () => {
    const leilao = criarLeilao({
      saidasLeilao: [{ id: 's1', nome: 'Fulano', valor: 0, participanteFixoId: 'p1' }],
    })
    const resultado = sincronizarFixos(leilao, [participante], [])

    expect(resultado).toBe(leilao)
  })
})

describe('criarLeilaoVazio', () => {
  it('já nasce sincronizado com os fixos vigentes', () => {
    const leilao = criarLeilaoVazio([participante], [gastoLeilao, gastoOperacional])

    expect(leilao.saidasLeilao).toHaveLength(2)
    expect(leilao.saidasOperacionais).toHaveLength(1)
  })
})
