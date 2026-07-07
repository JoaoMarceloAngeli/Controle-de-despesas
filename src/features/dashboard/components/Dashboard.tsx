import { useMemo, useState } from 'react'
import { calcularResumoFinanceiro } from '../../leilao/utils/calculos'
import { Botao } from '../../../shared/ui/Botao'
import { Card } from '../../../shared/ui/Card'
import { formatarDataBR, formatarMoeda } from '../../../shared/utils/formatters'
import type { Leilao } from '../../../types'
import { calcularResumoDashboard, filtrarLeiloesPorPeriodo } from '../utils/agregados'

interface DashboardProps {
  leiloes: Leilao[]
}

const CLASSE_INPUT_DATA =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600'

export function Dashboard({ leiloes }: DashboardProps) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const leiloesFiltrados = useMemo(
    () => filtrarLeiloesPorPeriodo(leiloes, dataInicio, dataFim),
    [leiloes, dataInicio, dataFim],
  )
  const resumo = useMemo(() => calcularResumoDashboard(leiloesFiltrados), [leiloesFiltrados])

  const leiloesOrdenados = useMemo(
    () => [...leiloesFiltrados].sort((a, b) => b.data.localeCompare(a.data)),
    [leiloesFiltrados],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">De</span>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className={CLASSE_INPUT_DATA}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className={CLASSE_INPUT_DATA}
          />
        </label>
        {(dataInicio || dataFim) && (
          <Botao
            variante="secundario"
            onClick={() => {
              setDataInicio('')
              setDataFim('')
            }}
          >
            Limpar filtro
          </Botao>
        )}
        <span className="text-sm text-slate-500">
          {resumo.quantidadeLeiloes} {resumo.quantidadeLeiloes === 1 ? 'leilão' : 'leilões'} no período
        </span>
      </div>

      {leiloesFiltrados.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum leilão salvo no período selecionado.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card titulo="Total de vendas" valor={formatarMoeda(resumo.totalVendas)} />
            <Card titulo="Total de saídas" valor={formatarMoeda(resumo.totalSaidas)} />
            <Card titulo="Total a receber" valor={formatarMoeda(resumo.totalAReceber)} />
            <Card
              titulo="Saldo final do período"
              valor={formatarMoeda(resumo.saldoFinalTotal)}
              destaque={resumo.saldoFinalTotal >= 0 ? 'positivo' : 'negativo'}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card titulo="Leilões no período" valor={String(resumo.quantidadeLeiloes)} />
            <Card titulo="Venda média por leilão" valor={formatarMoeda(resumo.mediaVendas)} />
            <Card titulo="Saída média por leilão" valor={formatarMoeda(resumo.mediaSaidas)} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Rateio de comissão no período</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Object.entries(resumo.rateioPorSocio).map(([socio, valor]) => (
                <Card key={socio} titulo={socio} valor={formatarMoeda(valor)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Leilões no período</h3>
            <ul className="flex flex-col gap-2">
              {leiloesOrdenados.map((leilao) => {
                const resumoLeilao = calcularResumoFinanceiro(leilao)
                const totalSaidas = resumoLeilao.totalSaidasLeilao + resumoLeilao.totalSaidasOperacionais
                return (
                  <li
                    key={leilao.id}
                    className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <span className="font-medium text-slate-900">{formatarDataBR(leilao.data)}</span>
                    <span className="text-slate-500">Vendas: {formatarMoeda(leilao.totalVendas)}</span>
                    <span className="text-slate-500">Saídas: {formatarMoeda(totalSaidas)}</span>
                    <span
                      className={`font-semibold ${resumoLeilao.saldoFinalPlanilhado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      Saldo: {formatarMoeda(resumoLeilao.saldoFinalPlanilhado)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
