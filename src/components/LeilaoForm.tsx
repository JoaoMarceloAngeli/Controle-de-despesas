import { useState } from 'react'
import type { useLeilao } from '../hooks/useLeilao'
import type { Participante } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { AReceberForm } from './AReceberForm'
import { ExportButtons } from './ExportButtons'
import { ResumoFinanceiro } from './ResumoFinanceiro'
import { SaidaLeilaoForm } from './SaidaLeilaoForm'
import { SaidaOperacionalForm } from './SaidaOperacionalForm'
import { Botao } from './ui/Botao'

type Aba = 'saidas' | 'operacionais' | 'areceber' | 'resumo'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'saidas', label: 'Saídas do leilão' },
  { id: 'operacionais', label: 'Saídas operacionais' },
  { id: 'areceber', label: 'A receber' },
  { id: 'resumo', label: 'Resumo' },
]

interface LeilaoFormProps {
  estado: ReturnType<typeof useLeilao>
  participantesFixos: Participante[]
  onSalvar: (leilao: ReturnType<typeof useLeilao>['leilao']) => void
}

export function LeilaoForm({ estado, participantesFixos, onSalvar }: LeilaoFormProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('saidas')
  const { leilao, resumo } = estado

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Data do leilão</span>
          <input
            type="date"
            value={leilao.data}
            onChange={(e) => estado.atualizarCampo('data', e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>
        <Botao onClick={() => onSalvar(leilao)}>Salvar leilão</Botao>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
              abaAtiva === aba.id
                ? 'border-b-2 border-brand-500 text-ink-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </nav>

      <div>
        {abaAtiva === 'saidas' && (
          <SaidaLeilaoForm
            itens={leilao.saidasLeilao}
            participantesFixos={participantesFixos}
            onAdicionar={estado.adicionarSaidaLeilao}
            onAtualizar={estado.atualizarSaidaLeilao}
            onRemover={estado.removerSaidaLeilao}
          />
        )}
        {abaAtiva === 'operacionais' && (
          <SaidaOperacionalForm
            itens={leilao.saidasOperacionais}
            onAdicionar={estado.adicionarSaidaOperacional}
            onAtualizar={estado.atualizarSaidaOperacional}
            onRemover={estado.removerSaidaOperacional}
          />
        )}
        {abaAtiva === 'areceber' && (
          <AReceberForm
            itens={leilao.valoresAReceber}
            onAdicionar={estado.adicionarValorAReceber}
            onAtualizar={estado.atualizarValorAReceber}
            onRemover={estado.removerValorAReceber}
          />
        )}
        {abaAtiva === 'resumo' && (
          <ResumoFinanceiro leilao={leilao} resumo={resumo} onAtualizarCampo={estado.atualizarCampo} />
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Saldo final planilhado: {formatarMoeda(resumo.saldoFinalPlanilhado)}
        </p>
        <ExportButtons leilao={leilao} resumo={resumo} />
      </div>
    </div>
  )
}
