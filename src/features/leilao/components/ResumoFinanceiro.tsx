import { Card } from '../../../shared/ui/Card'
import { CampoMoeda } from '../../../shared/ui/CampoMoeda'
import { formatarMoeda } from '../../../shared/utils/formatters'
import type { Leilao, ResumoFinanceiro as ResumoFinanceiroType } from '../../../types'

interface ResumoFinanceiroProps {
  leilao: Leilao
  resumo: ResumoFinanceiroType
  onAtualizarCampo: <K extends keyof Leilao>(campo: K, valor: Leilao[K]) => void
}

export function ResumoFinanceiro({ leilao, resumo, onAtualizarCampo }: ResumoFinanceiroProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoMoeda
          label="Total de vendas"
          valor={leilao.totalVendas}
          onChange={(valor) => onAtualizarCampo('totalVendas', valor)}
          min={0}
        />
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Comissão (%)</span>
          <input
            type="number"
            inputMode="decimal"
            step={0.01}
            min={0}
            max={100}
            value={leilao.percentualComissao === 0 ? '' : leilao.percentualComissao}
            placeholder="0,00"
            onChange={(e) => {
              const valor = e.target.valueAsNumber
              onAtualizarCampo('percentualComissao', Number.isFinite(valor) ? valor : 0)
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>
        <CampoMoeda
          label="Descontos"
          valor={leilao.descontos}
          onChange={(valor) => onAtualizarCampo('descontos', valor)}
          min={0}
        />
        <CampoMoeda
          label="Saldo anterior"
          valor={leilao.saldoAnterior}
          onChange={(valor) => onAtualizarCampo('saldoAnterior', valor)}
        />
        <CampoMoeda
          label="Saldo negativo acumulado"
          valor={leilao.saldoNegativoAcumulado}
          onChange={(valor) => onAtualizarCampo('saldoNegativoAcumulado', valor)}
          min={0}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card titulo="Total comissão" valor={formatarMoeda(resumo.totalComissao)} />
        <Card titulo="Saídas do leilão" valor={formatarMoeda(resumo.totalSaidasLeilao)} />
        <Card titulo="Saídas operacionais" valor={formatarMoeda(resumo.totalSaidasOperacionais)} />
        <Card titulo="Total a receber" valor={formatarMoeda(resumo.totalAReceber)} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Rateio entre sócios</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resumo.rateioSocios.map((parte) => (
            <Card key={parte.socio} titulo={parte.socio} valor={formatarMoeda(parte.valor)} />
          ))}
        </div>
      </div>

      <Card
        titulo="Saldo final planilhado"
        valor={formatarMoeda(resumo.saldoFinalPlanilhado)}
        destaque={resumo.saldoFinalPlanilhado >= 0 ? 'positivo' : 'negativo'}
      />

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <span className="font-medium">Observações</span>
        <textarea
          value={leilao.observacoes ?? ''}
          onChange={(e) => onAtualizarCampo('observacoes', e.target.value)}
          rows={3}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </label>
    </div>
  )
}
