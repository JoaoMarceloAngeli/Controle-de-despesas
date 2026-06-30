import { useState } from 'react'
import { HistoricoLeiloes } from './components/HistoricoLeiloes'
import { LeilaoForm } from './components/LeilaoForm'
import { ParticipantesFixosConfig } from './components/ParticipantesFixosConfig'
import { Botao } from './components/ui/Botao'
import { useHistoricoLeiloes } from './hooks/useHistoricoLeiloes'
import { useLeilao } from './hooks/useLeilao'
import { useParticipantesFixos } from './hooks/useParticipantesFixos'
import type { Leilao } from './types'

type Tela = 'editar' | 'historico' | 'configuracoes'

const ABAS_PRINCIPAIS: { id: Tela; label: string }[] = [
  { id: 'editar', label: 'Leilão atual' },
  { id: 'historico', label: 'Histórico' },
  { id: 'configuracoes', label: 'Participantes fixos' },
]

function App() {
  const [tela, setTela] = useState<Tela>('editar')
  const [mensagem, setMensagem] = useState('')

  const estadoLeilao = useLeilao()
  const historico = useHistoricoLeiloes()
  const participantesFixos = useParticipantesFixos()

  function salvarLeilao(leilao: Leilao) {
    historico.salvar(leilao)
    setMensagem('Leilão salvo no histórico.')
    setTimeout(() => setMensagem(''), 3000)
  }

  function abrirLeilao(leilao: Leilao) {
    estadoLeilao.carregarLeilao(leilao)
    setTela('editar')
  }

  function duplicarLeilao(id: string) {
    const copia = historico.duplicar(id)
    if (!copia) return
    estadoLeilao.carregarLeilao(copia)
    setTela('editar')
  }

  function novoLeilao() {
    estadoLeilao.novoLeilao()
    setTela('editar')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Gestão Financeira de Leilão
          </h1>
          <Botao variante="secundario" onClick={novoLeilao}>
            Novo leilão
          </Botao>
        </div>
        <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-1">
          {ABAS_PRINCIPAIS.map((aba) => (
            <button
              key={aba.id}
              type="button"
              onClick={() => setTela(aba.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tela === aba.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {mensagem && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {mensagem}
          </div>
        )}

        {tela === 'editar' && (
          <LeilaoForm
            estado={estadoLeilao}
            participantesFixos={participantesFixos.participantes}
            onSalvar={salvarLeilao}
          />
        )}

        {tela === 'historico' && (
          <HistoricoLeiloes
            leiloes={historico.leiloes}
            onAbrir={abrirLeilao}
            onDuplicar={duplicarLeilao}
            onRemover={historico.remover}
          />
        )}

        {tela === 'configuracoes' && (
          <ParticipantesFixosConfig
            participantes={participantesFixos.participantes}
            onAdicionar={participantesFixos.adicionar}
            onRenomear={participantesFixos.renomear}
            onRemover={participantesFixos.remover}
          />
        )}
      </main>
    </div>
  )
}

export default App
