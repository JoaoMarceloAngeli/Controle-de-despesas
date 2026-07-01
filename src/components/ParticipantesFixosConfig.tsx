import { useState } from 'react'
import type { Participante } from '../types'
import { Botao } from './ui/Botao'

interface ParticipantesFixosConfigProps {
  participantes: Participante[]
  onAdicionar: (nome: string) => void
  onRenomear: (id: string, nome: string) => void
  onRemover: (id: string) => void
}

export function ParticipantesFixosConfig({
  participantes,
  onAdicionar,
  onRenomear,
  onRemover,
}: ParticipantesFixosConfigProps) {
  const [nomeNovo, setNomeNovo] = useState('')

  function adicionar() {
    if (!nomeNovo.trim()) return
    onAdicionar(nomeNovo)
    setNomeNovo('')
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Esses participantes entram automaticamente como um item já lançado (valor R$ 0,00, para você
        preencher) no bloco "Saídas do leilão" do leilão atual e de todo novo leilão — eles permanecem
        fixos em todos os relatórios até serem excluídos aqui. Leilões já salvos no histórico não são
        alterados.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={nomeNovo}
          onChange={(e) => setNomeNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
          placeholder="Nome do participante fixo"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
        <Botao onClick={adicionar}>Adicionar</Botao>
      </div>

      {participantes.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum participante fixo cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {participantes.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 p-3"
            >
              <input
                type="text"
                value={p.nome}
                onChange={(e) => onRenomear(p.id, e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
              <Botao variante="perigo" onClick={() => onRemover(p.id)}>
                Remover
              </Botao>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
