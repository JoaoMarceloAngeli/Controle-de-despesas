import { useState } from 'react'
import type { ValorAReceber } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { Botao } from './ui/Botao'
import { CampoMoeda } from './ui/CampoMoeda'

interface AReceberFormProps {
  itens: ValorAReceber[]
  onAdicionar: (item: Omit<ValorAReceber, 'id'>) => void
  onAtualizar: (id: string, dados: Partial<Omit<ValorAReceber, 'id'>>) => void
  onRemover: (id: string) => void
}

export function AReceberForm({ itens, onAdicionar, onAtualizar, onRemover }: AReceberFormProps) {
  const [descricaoNova, setDescricaoNova] = useState('')
  const [valorNovo, setValorNovo] = useState(0)

  function adicionar() {
    const descricao = descricaoNova.trim()
    if (!descricao) return
    onAdicionar({ descricao, valor: valorNovo })
    setDescricaoNova('')
    setValorNovo(0)
  }

  const total = itens.reduce((soma, item) => soma + item.valor, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[2fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Descrição</span>
          <input
            type="text"
            value={descricaoNova}
            onChange={(e) => setDescricaoNova(e.target.value)}
            placeholder="De quem / referente a quê"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>

        <CampoMoeda label="Valor" valor={valorNovo} onChange={setValorNovo} min={0} />

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
                value={item.descricao}
                onChange={(e) => onAtualizar(item.id, { descricao: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
              <div className="sm:w-48">
                <CampoMoeda
                  valor={item.valor}
                  onChange={(valor) => onAtualizar(item.id, { valor })}
                  min={0}
                />
              </div>
              <Botao variante="perigo" onClick={() => onRemover(item.id)}>
                Remover
              </Botao>
            </li>
          ))}
        </ul>
      )}

      <p className="text-right text-sm font-semibold text-slate-700">
        Total a receber: {formatarMoeda(total)}
      </p>
    </div>
  )
}
