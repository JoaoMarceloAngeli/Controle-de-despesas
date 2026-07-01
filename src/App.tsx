import { useState } from 'react'
import { GastosFixosConfig } from './components/GastosFixosConfig'
import { HistoricoLeiloes } from './components/HistoricoLeiloes'
import { LeilaoForm } from './components/LeilaoForm'
import { ParticipantesFixosConfig } from './components/ParticipantesFixosConfig'
import { Botao } from './components/ui/Botao'
import {
  IconeColapsar,
  IconeExpandir,
  IconeFechar,
  IconeGastosFixos,
  IconeHistorico,
  IconeLeilao,
  IconeMenu,
  IconeParticipantes,
} from './components/ui/Icones'
import { useGastosFixos } from './hooks/useGastosFixos'
import { useHistoricoLeiloes } from './hooks/useHistoricoLeiloes'
import { useLeilao } from './hooks/useLeilao'
import { useParticipantesFixos } from './hooks/useParticipantesFixos'
import type { Leilao } from './types'
import { gravarNoStorage, lerDoStorage } from './utils/storage'

type Tela = 'editar' | 'historico' | 'participantesFixos' | 'gastosFixos'

const ABAS_PRINCIPAIS: { id: Tela; label: string; Icone: typeof IconeLeilao }[] = [
  { id: 'editar', label: 'Leilão atual', Icone: IconeLeilao },
  { id: 'historico', label: 'Histórico', Icone: IconeHistorico },
  { id: 'participantesFixos', label: 'Participantes fixos', Icone: IconeParticipantes },
  { id: 'gastosFixos', label: 'Gastos fixos', Icone: IconeGastosFixos },
]

const CHAVE_SIDEBAR_COLAPSADA = 'leiloes:sidebarColapsada'

function App() {
  const [tela, setTela] = useState<Tela>('editar')
  const [mensagem, setMensagem] = useState('')
  const [colapsada, setColapsada] = useState(() => lerDoStorage<boolean>(CHAVE_SIDEBAR_COLAPSADA) ?? false)
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  function alternarColapso() {
    setColapsada((prev) => {
      const novo = !prev
      gravarNoStorage(CHAVE_SIDEBAR_COLAPSADA, novo)
      return novo
    })
  }

  function selecionarTela(novaTela: Tela) {
    setTela(novaTela)
    setMenuMobileAberto(false)
  }

  const gastosFixos = useGastosFixos()
  const participantesFixos = useParticipantesFixos()
  const estadoLeilao = useLeilao(undefined, participantesFixos.participantes, gastosFixos.gastosFixos)
  const historico = useHistoricoLeiloes()

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
    estadoLeilao.carregarLeilao(copia, { ativarSincronizacaoFixos: true })
    setTela('editar')
  }

  function novoLeilao() {
    estadoLeilao.novoLeilao()
    setTela('editar')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {menuMobileAberto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMenuMobileAberto(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-ink-800 transition-transform duration-200 md:static md:translate-x-0 md:transition-[width] ${
          menuMobileAberto ? 'translate-x-0' : '-translate-x-full'
        } ${colapsada ? 'md:w-16' : 'md:w-60'}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}logo-mark.png`}
              alt="Mara Rosa Leilões"
              className="size-8 shrink-0 rounded-md"
            />
            <h1
              className={`truncate text-sm font-semibold text-brand-500 ${colapsada ? 'md:hidden' : ''}`}
            >
              Mara Rosa Leilões
            </h1>
          </div>
          <button
            type="button"
            onClick={alternarColapso}
            className="hidden shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-brand-500 md:inline-flex"
            title={colapsada ? 'Expandir menu' : 'Colapsar menu'}
          >
            {colapsada ? <IconeExpandir className="size-5" /> : <IconeColapsar className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuMobileAberto(false)}
            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-brand-500 md:hidden"
            title="Fechar menu"
          >
            <IconeFechar className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {ABAS_PRINCIPAIS.map((aba) => (
            <button
              key={aba.id}
              type="button"
              onClick={() => selecionarTela(aba.id)}
              title={aba.label}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tela === aba.id
                  ? 'bg-brand-500 text-ink-900'
                  : 'text-slate-300 hover:bg-white/10 hover:text-brand-400'
              }`}
            >
              <aba.Icone className="size-5 shrink-0" />
              <span className={colapsada ? 'md:hidden' : ''}>{aba.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-2">
          <Botao variante="secundario" onClick={novoLeilao} className="w-full justify-center">
            <span className={colapsada ? 'md:hidden' : ''}>Novo leilão</span>
            <span className={`hidden ${colapsada ? 'md:inline' : ''}`}>+</span>
          </Botao>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuMobileAberto(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            title="Abrir menu"
          >
            <IconeMenu className="size-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {ABAS_PRINCIPAIS.find((aba) => aba.id === tela)?.label ?? 'Gestão Financeira de Leilão'}
          </h1>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
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

          {tela === 'participantesFixos' && (
            <ParticipantesFixosConfig
              participantes={participantesFixos.participantes}
              onAdicionar={participantesFixos.adicionar}
              onRenomear={participantesFixos.renomear}
              onRemover={participantesFixos.remover}
            />
          )}

          {tela === 'gastosFixos' && (
            <GastosFixosConfig
              gastosFixos={gastosFixos.gastosFixos}
              onAdicionar={gastosFixos.adicionar}
              onAtualizar={gastosFixos.atualizar}
              onRemover={gastosFixos.remover}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
