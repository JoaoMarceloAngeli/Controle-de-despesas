import type { Leilao } from '../types'
import { calcularResumoFinanceiro } from '../utils/calculos'
import { exportarLeilaoExcel } from '../utils/exportExcel'
import { exportarLeilaoPdf } from '../utils/exportPdf'
import { formatarDataBR, formatarMoeda } from '../utils/formatters'
import { Botao } from './ui/Botao'
import { Card } from './ui/Card'

interface HistoricoLeiloesProps {
  leiloes: Leilao[]
  onAbrir: (leilao: Leilao) => void
  onDuplicar: (id: string) => void
  onRemover: (id: string) => void
}

export function HistoricoLeiloes({ leiloes, onAbrir, onDuplicar, onRemover }: HistoricoLeiloesProps) {
  if (leiloes.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum leilão salvo ainda.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {leiloes.map((leilao) => {
        const resumo = calcularResumoFinanceiro(leilao)
        return (
          <li key={leilao.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">
                Leilão de {formatarDataBR(leilao.data)}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Botao variante="secundario" onClick={() => onAbrir(leilao)}>
                  Abrir / Editar
                </Botao>
                <Botao variante="secundario" onClick={() => onDuplicar(leilao.id)}>
                  Duplicar
                </Botao>
                <Botao variante="secundario" onClick={() => exportarLeilaoExcel(leilao, resumo)}>
                  Excel
                </Botao>
                <Botao variante="secundario" onClick={() => exportarLeilaoPdf(leilao, resumo)}>
                  PDF
                </Botao>
                <Botao variante="perigo" onClick={() => onRemover(leilao.id)}>
                  Excluir
                </Botao>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Card titulo="Total de vendas" valor={formatarMoeda(leilao.totalVendas)} />
              <Card titulo="Total de saídas" valor={formatarMoeda(resumo.totalSaidasLeilao + resumo.totalSaidasOperacionais)} />
              <Card
                titulo="Saldo final planilhado"
                valor={formatarMoeda(resumo.saldoFinalPlanilhado)}
                destaque={resumo.saldoFinalPlanilhado >= 0 ? 'positivo' : 'negativo'}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
