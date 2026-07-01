import { useState } from 'react'
import type { DestinoGastoFixo, GastoFixo } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { Botao } from './ui/Botao'
import { CampoMoeda } from './ui/CampoMoeda'

interface GastosFixosConfigProps {
  gastosFixos: GastoFixo[]
  onAdicionar: (dados: Omit<GastoFixo, 'id'>) => void
  onAtualizar: (id: string, dados: Partial<Omit<GastoFixo, 'id'>>) => void
  onRemover: (id: string) => void
}

const LABEL_DESTINO: Record<DestinoGastoFixo, string> = {
  saidasLeilao: 'Saídas do leilão',
  saidasOperacionais: 'Saídas operacionais',
}

export function GastosFixosConfig({
  gastosFixos,
  onAdicionar,
  onAtualizar,
  onRemover,
}: GastosFixosConfigProps) {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState(0)
  const [dataPagamento, setDataPagamento] = useState('')
  const [destino, setDestino] = useState<DestinoGastoFixo>('saidasOperacionais')

  const podeAdicionar = nome.trim().length > 0 && valor > 0

  function adicionar() {
    if (!podeAdicionar) return
    onAdicionar({ nome: nome.trim(), valor, dataPagamento: dataPagamento || undefined, destino })
    setNome('')
    setValor(0)
    setDataPagamento('')
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Gastos fixos são lançados automaticamente no bloco de saída escolhido em todo novo leilão —
        eles não aparecem como opção para adicionar manualmente lá. Alterar essa lista não afeta
        leilões já salvos.
      </p>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Nome *</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Aluguel, folha, assinatura..."
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>

        <CampoMoeda label="Gasto *" valor={valor} onChange={setValor} min={0} />

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Data de pagamento</span>
          <input
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Entra em *</span>
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value as DestinoGastoFixo)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="saidasLeilao">{LABEL_DESTINO.saidasLeilao}</option>
            <option value="saidasOperacionais">{LABEL_DESTINO.saidasOperacionais}</option>
          </select>
        </label>

        <div className="flex items-end">
          <Botao onClick={adicionar} disabled={!podeAdicionar} className="w-full">
            Adicionar
          </Botao>
        </div>
      </div>

      {gastosFixos.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum gasto fixo cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {gastosFixos.map((g) => (
            <li
              key={g.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <input
                type="text"
                value={g.nome}
                onChange={(e) => onAtualizar(g.id, { nome: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
              <div className="sm:w-40">
                <CampoMoeda
                  valor={g.valor}
                  onChange={(novoValor) => onAtualizar(g.id, { valor: novoValor })}
                  min={0}
                />
              </div>
              <input
                type="date"
                value={g.dataPagamento ?? ''}
                onChange={(e) => onAtualizar(g.id, { dataPagamento: e.target.value || undefined })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
              <select
                value={g.destino}
                onChange={(e) => onAtualizar(g.id, { destino: e.target.value as DestinoGastoFixo })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              >
                <option value="saidasLeilao">{LABEL_DESTINO.saidasLeilao}</option>
                <option value="saidasOperacionais">{LABEL_DESTINO.saidasOperacionais}</option>
              </select>
              <span className="text-right text-sm text-slate-500 sm:w-28">{formatarMoeda(g.valor)}</span>
              <Botao variante="perigo" onClick={() => onRemover(g.id)}>
                Remover
              </Botao>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
