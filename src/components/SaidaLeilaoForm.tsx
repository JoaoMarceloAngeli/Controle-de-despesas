import { useState } from 'react'
import type { Participante, SaidaLeilao } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { Botao } from './ui/Botao'
import { CampoMoeda } from './ui/CampoMoeda'

const OPCAO_OUTRO = '__outro__'

interface SaidaLeilaoFormProps {
  itens: SaidaLeilao[]
  participantesFixos: Participante[]
  onAdicionar: (item: Omit<SaidaLeilao, 'id'>) => void
  onAtualizar: (id: string, dados: Partial<Omit<SaidaLeilao, 'id'>>) => void
  onRemover: (id: string) => void
}

export function SaidaLeilaoForm({
  itens,
  participantesFixos,
  onAdicionar,
  onAtualizar,
  onRemover,
}: SaidaLeilaoFormProps) {
  const [participanteSelecionado, setParticipanteSelecionado] = useState('')
  const [nomeLivre, setNomeLivre] = useState('')
  const [valorNovo, setValorNovo] = useState(0)

  const usandoNomeLivre = participanteSelecionado === OPCAO_OUTRO

  function adicionar() {
    const participante = participantesFixos.find((p) => p.id === participanteSelecionado)
    const nome = usandoNomeLivre ? nomeLivre.trim() : participante?.nome ?? ''
    if (!nome) return

    onAdicionar({
      nome,
      valor: valorNovo,
      participanteId: usandoNomeLivre ? undefined : participante?.id,
    })

    setParticipanteSelecionado('')
    setNomeLivre('')
    setValorNovo(0)
  }

  const total = itens.reduce((soma, item) => soma + item.valor, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Participante</span>
          <select
            value={participanteSelecionado}
            onChange={(e) => setParticipanteSelecionado(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Selecione...</option>
            {participantesFixos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
            <option value={OPCAO_OUTRO}>Outro (digitar nome)</option>
          </select>
        </label>

        {usandoNomeLivre ? (
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-medium">Nome</span>
            <input
              type="text"
              value={nomeLivre}
              onChange={(e) => setNomeLivre(e.target.value)}
              placeholder="Nome do participante"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </label>
        ) : (
          <CampoMoeda label="Valor" valor={valorNovo} onChange={setValorNovo} min={0} />
        )}

        {usandoNomeLivre && (
          <div className="sm:col-span-2">
            <CampoMoeda label="Valor" valor={valorNovo} onChange={setValorNovo} min={0} />
          </div>
        )}

        <div className="flex items-end">
          <Botao onClick={adicionar} className="w-full">
            Adicionar
          </Botao>
        </div>
      </div>

      {itens.length > 0 && (
        <ul className="flex flex-col gap-2">
          {itens.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <input
                type="text"
                value={item.nome}
                onChange={(e) => onAtualizar(item.id, { nome: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
              {(item.gastoFixoId || item.participanteFixoId) && (
                <span className="w-fit rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                  Fixo
                </span>
              )}
              <div className="sm:w-48">
                <CampoMoeda
                  valor={item.valor}
                  onChange={(valor) => onAtualizar(item.id, { valor })}
                  min={0}
                />
              </div>
              {item.gastoFixoId || item.participanteFixoId ? (
                <span
                  className="text-center text-xs text-slate-400 sm:w-32"
                  title="Para remover, exclua o participante fixo em Configurações"
                >
                  Remova em Configurações
                </span>
              ) : (
                <Botao variante="perigo" onClick={() => onRemover(item.id)}>
                  Remover
                </Botao>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-right text-sm font-semibold text-slate-700">
        Total de saídas do leilão: {formatarMoeda(total)}
      </p>
    </div>
  )
}
