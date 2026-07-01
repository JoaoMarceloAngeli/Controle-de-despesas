import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Leilao, ResumoFinanceiro } from '../types'
import { formatarDataBR, formatarMoeda } from './formatters'

// jspdf-autotable anexa `lastAutoTable` ao doc em runtime, mas não declara isso nos tipos públicos.
interface DocComTabela extends jsPDF {
  lastAutoTable?: { finalY: number }
}

/** Exporta o leilão para PDF com um bloco de tabela por seção, pronto para impressão/arquivo. */
export function exportarLeilaoPdf(leilao: Leilao, resumo: ResumoFinanceiro) {
  const doc = new jsPDF() as DocComTabela
  const estiloCabecalho = {
    fillColor: [32, 29, 29] as [number, number, number],
    textColor: [255, 194, 0] as [number, number, number],
  }

  doc.setFontSize(16)
  doc.text(`Leilão de ${formatarDataBR(leilao.data)}`, 14, 16)

  let cursorY = 24

  autoTable(doc, {
    startY: cursorY,
    head: [['Saídas do leilão', 'Valor']],
    body: [
      ...leilao.saidasLeilao.map((item) => [item.nome, formatarMoeda(item.valor)]),
      ['Total', formatarMoeda(resumo.totalSaidasLeilao)],
    ],
    theme: 'grid',
    headStyles: estiloCabecalho,
  })
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 8

  autoTable(doc, {
    startY: cursorY,
    head: [['Saídas operacionais', 'Valor', 'Data']],
    body: [
      ...leilao.saidasOperacionais.map((item) => [
        item.descricao,
        formatarMoeda(item.valor),
        formatarDataBR(item.data),
      ]),
      ['Total', formatarMoeda(resumo.totalSaidasOperacionais), ''],
    ],
    theme: 'grid',
    headStyles: estiloCabecalho,
  })
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 8

  autoTable(doc, {
    startY: cursorY,
    head: [['A receber', 'Valor']],
    body: [
      ...leilao.valoresAReceber.map((item) => [item.descricao, formatarMoeda(item.valor)]),
      ['Total', formatarMoeda(resumo.totalAReceber)],
    ],
    theme: 'grid',
    headStyles: estiloCabecalho,
  })
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 8

  const linhasResumo = [
    ['Total de vendas', formatarMoeda(leilao.totalVendas)],
    [`Comissão (${leilao.percentualComissao}%)`, formatarMoeda(resumo.totalComissao)],
    ['Descontos', formatarMoeda(leilao.descontos)],
    ['Total saídas do leilão', formatarMoeda(resumo.totalSaidasLeilao)],
    ['Total saídas operacionais', formatarMoeda(resumo.totalSaidasOperacionais)],
    ['Saldo anterior', formatarMoeda(leilao.saldoAnterior)],
    ['Total a receber', formatarMoeda(resumo.totalAReceber)],
    ['Saldo negativo acumulado', formatarMoeda(leilao.saldoNegativoAcumulado)],
    ...resumo.rateioSocios.map((p) => [`Rateio - ${p.socio}`, formatarMoeda(p.valor)]),
    ['Saldo final planilhado', formatarMoeda(resumo.saldoFinalPlanilhado)],
  ]

  autoTable(doc, {
    startY: cursorY,
    head: [['Resumo financeiro', 'Valor']],
    body: linhasResumo,
    theme: 'grid',
    headStyles: estiloCabecalho,
    didParseCell: (data) => {
      if (data.row.index === linhasResumo.length - 1) {
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 8

  if (leilao.observacoes) {
    doc.setFontSize(11)
    doc.text('Observações:', 14, cursorY)
    doc.setFontSize(10)
    doc.text(doc.splitTextToSize(leilao.observacoes, 180), 14, cursorY + 6)
  }

  doc.save(`leilao_${leilao.data}.pdf`)
}
