import * as XLSX from 'xlsx'
import type { Leilao, ResumoFinanceiro } from '../types'
import { formatarDataBR } from './formatters'

interface Celula {
  linha: number
  coluna: number
  valor: string | number
}

function construirMatriz(celulas: Celula[]): (string | number)[][] {
  const maxLinha = celulas.reduce((max, c) => Math.max(max, c.linha), 0)
  const maxColuna = celulas.reduce((max, c) => Math.max(max, c.coluna), 0)
  const matriz: (string | number)[][] = Array.from({ length: maxLinha + 1 }, () =>
    Array.from({ length: maxColuna + 1 }, () => ''),
  )
  for (const { linha, coluna, valor } of celulas) {
    matriz[linha][coluna] = valor
  }
  return matriz
}

/** Exporta o leilão para .xlsx replicando o layout em blocos lado a lado da planilha original. */
export function exportarLeilaoExcel(leilao: Leilao, resumo: ResumoFinanceiro) {
  const celulas: Celula[] = []
  const add = (linha: number, coluna: number, valor: string | number) =>
    celulas.push({ linha, coluna, valor })

  add(0, 0, `Leilão de ${formatarDataBR(leilao.data)}`)

  // Bloco 1: Saídas do leilão — colunas A-B
  add(2, 0, 'Saídas do leilão')
  add(3, 0, 'Nome')
  add(3, 1, 'Valor')
  leilao.saidasLeilao.forEach((item, i) => {
    add(4 + i, 0, item.nome)
    add(4 + i, 1, item.valor)
  })
  add(4 + leilao.saidasLeilao.length, 0, 'Total')
  add(4 + leilao.saidasLeilao.length, 1, resumo.totalSaidasLeilao)

  // Bloco 2: Saídas operacionais — colunas D-F
  add(2, 3, 'Saídas operacionais')
  add(3, 3, 'Descrição')
  add(3, 4, 'Valor')
  add(3, 5, 'Data')
  leilao.saidasOperacionais.forEach((item, i) => {
    add(4 + i, 3, item.descricao)
    add(4 + i, 4, item.valor)
    add(4 + i, 5, formatarDataBR(item.data))
  })
  add(4 + leilao.saidasOperacionais.length, 3, 'Total')
  add(4 + leilao.saidasOperacionais.length, 4, resumo.totalSaidasOperacionais)

  // Bloco 3: A receber — colunas H-I
  add(2, 7, 'A receber')
  add(3, 7, 'Descrição')
  add(3, 8, 'Valor')
  leilao.valoresAReceber.forEach((item, i) => {
    add(4 + i, 7, item.descricao)
    add(4 + i, 8, item.valor)
  })
  add(4 + leilao.valoresAReceber.length, 7, 'Total')
  add(4 + leilao.valoresAReceber.length, 8, resumo.totalAReceber)

  // Bloco 4: Resumo financeiro — colunas K-L
  add(2, 10, 'Resumo financeiro')
  const linhasResumo: [string, number][] = [
    ['Total de vendas', leilao.totalVendas],
    [`Comissão (${leilao.percentualComissao}%)`, resumo.totalComissao],
    ['Descontos', leilao.descontos],
    ['Total saídas do leilão', resumo.totalSaidasLeilao],
    ['Total saídas operacionais', resumo.totalSaidasOperacionais],
    ['Saldo anterior', leilao.saldoAnterior],
    ['Total a receber', resumo.totalAReceber],
    ['Saldo negativo acumulado', leilao.saldoNegativoAcumulado],
  ]
  linhasResumo.forEach(([rotulo, valor], i) => {
    add(3 + i, 10, rotulo)
    add(3 + i, 11, valor)
  })

  const linhaRateio = 3 + linhasResumo.length + 1
  add(linhaRateio, 10, 'Rateio entre sócios')
  resumo.rateioSocios.forEach((parte, i) => {
    add(linhaRateio + 1 + i, 10, parte.socio)
    add(linhaRateio + 1 + i, 11, parte.valor)
  })

  const linhaSaldoFinal = linhaRateio + 1 + resumo.rateioSocios.length + 1
  add(linhaSaldoFinal, 10, 'Saldo final planilhado')
  add(linhaSaldoFinal, 11, resumo.saldoFinalPlanilhado)

  const matriz = construirMatriz(celulas)
  const planilha = XLSX.utils.aoa_to_sheet(matriz)
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Leilão')

  XLSX.writeFile(livro, `leilao_${leilao.data}.xlsx`)
}
