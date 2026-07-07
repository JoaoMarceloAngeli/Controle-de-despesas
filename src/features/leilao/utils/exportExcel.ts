import XLSX from 'xlsx-js-style'
import { formatarDataBR } from '../../../shared/utils/formatters'
import type { Leilao, ResumoFinanceiro } from '../../../types'

type Estilo = 'titulo' | 'blocoTitulo' | 'colunaTitulo' | 'total'

interface Celula {
  linha: number
  coluna: number
  valor: string | number
  estilo?: Estilo
}

const OURO = 'FFC200'
const TINTA = '201D1D'

const ESTILOS: Record<Estilo, object> = {
  titulo: { font: { bold: true, sz: 14, color: { rgb: TINTA } } },
  blocoTitulo: {
    fill: { fgColor: { rgb: TINTA } },
    font: { bold: true, color: { rgb: OURO } },
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  colunaTitulo: {
    fill: { fgColor: { rgb: OURO } },
    font: { bold: true, color: { rgb: TINTA } },
  },
  total: {
    font: { bold: true, color: { rgb: TINTA } },
    border: { top: { style: 'thin', color: { rgb: TINTA } } },
  },
}

function construirPlanilha(celulas: Celula[], merges: XLSX.Range[]) {
  const maxLinha = celulas.reduce((max, c) => Math.max(max, c.linha), 0)
  const maxColuna = celulas.reduce((max, c) => Math.max(max, c.coluna), 0)
  const matriz: (string | number)[][] = Array.from({ length: maxLinha + 1 }, () =>
    Array.from({ length: maxColuna + 1 }, () => ''),
  )
  for (const { linha, coluna, valor } of celulas) {
    matriz[linha][coluna] = valor
  }

  const planilha = XLSX.utils.aoa_to_sheet(matriz)
  planilha['!merges'] = merges

  for (const { linha, coluna, estilo } of celulas) {
    if (!estilo) continue
    const ref = XLSX.utils.encode_cell({ r: linha, c: coluna })
    if (planilha[ref]) planilha[ref].s = ESTILOS[estilo]
  }

  return planilha
}

/** Exporta o leilão para .xlsx replicando o layout em blocos lado a lado da planilha original. */
export function exportarLeilaoExcel(leilao: Leilao, resumo: ResumoFinanceiro) {
  const celulas: Celula[] = []
  const merges: XLSX.Range[] = []
  const add = (linha: number, coluna: number, valor: string | number, estilo?: Estilo) =>
    celulas.push({ linha, coluna, valor, estilo })
  const mesclarTitulo = (linha: number, colInicio: number, colFim: number) =>
    merges.push({ s: { r: linha, c: colInicio }, e: { r: linha, c: colFim } })

  add(0, 0, `Leilão de ${formatarDataBR(leilao.data)}`, 'titulo')

  // Bloco 1: Saídas do leilão — colunas A-B
  add(2, 0, 'Saídas do leilão', 'blocoTitulo')
  add(2, 1, '', 'blocoTitulo')
  mesclarTitulo(2, 0, 1)
  add(3, 0, 'Nome', 'colunaTitulo')
  add(3, 1, 'Valor', 'colunaTitulo')
  leilao.saidasLeilao.forEach((item, i) => {
    add(4 + i, 0, item.nome)
    add(4 + i, 1, item.valor)
  })
  add(4 + leilao.saidasLeilao.length, 0, 'Total', 'total')
  add(4 + leilao.saidasLeilao.length, 1, resumo.totalSaidasLeilao, 'total')

  // Bloco 2: Saídas operacionais — colunas D-F
  add(2, 3, 'Saídas operacionais', 'blocoTitulo')
  add(2, 4, '', 'blocoTitulo')
  add(2, 5, '', 'blocoTitulo')
  mesclarTitulo(2, 3, 5)
  add(3, 3, 'Descrição', 'colunaTitulo')
  add(3, 4, 'Valor', 'colunaTitulo')
  add(3, 5, 'Data', 'colunaTitulo')
  leilao.saidasOperacionais.forEach((item, i) => {
    add(4 + i, 3, item.descricao)
    add(4 + i, 4, item.valor)
    add(4 + i, 5, formatarDataBR(item.data))
  })
  add(4 + leilao.saidasOperacionais.length, 3, 'Total', 'total')
  add(4 + leilao.saidasOperacionais.length, 4, resumo.totalSaidasOperacionais, 'total')

  // Bloco 3: A receber — colunas H-I
  add(2, 7, 'A receber', 'blocoTitulo')
  add(2, 8, '', 'blocoTitulo')
  mesclarTitulo(2, 7, 8)
  add(3, 7, 'Descrição', 'colunaTitulo')
  add(3, 8, 'Valor', 'colunaTitulo')
  leilao.valoresAReceber.forEach((item, i) => {
    add(4 + i, 7, item.descricao)
    add(4 + i, 8, item.valor)
  })
  add(4 + leilao.valoresAReceber.length, 7, 'Total', 'total')
  add(4 + leilao.valoresAReceber.length, 8, resumo.totalAReceber, 'total')

  // Bloco 4: Resumo financeiro — colunas K-L
  add(2, 10, 'Resumo financeiro', 'blocoTitulo')
  add(2, 11, '', 'blocoTitulo')
  mesclarTitulo(2, 10, 11)
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
  add(linhaRateio, 10, 'Rateio entre sócios', 'colunaTitulo')
  add(linhaRateio, 11, '', 'colunaTitulo')
  resumo.rateioSocios.forEach((parte, i) => {
    add(linhaRateio + 1 + i, 10, parte.socio)
    add(linhaRateio + 1 + i, 11, parte.valor)
  })

  const linhaSaldoFinal = linhaRateio + 1 + resumo.rateioSocios.length + 1
  add(linhaSaldoFinal, 10, 'Saldo final planilhado', 'total')
  add(linhaSaldoFinal, 11, resumo.saldoFinalPlanilhado, 'total')

  const planilha = construirPlanilha(celulas, merges)
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Leilão')

  XLSX.writeFile(livro, `leilao_${leilao.data}.xlsx`)
}
