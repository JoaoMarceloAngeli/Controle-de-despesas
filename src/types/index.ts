import { SOCIOS_FIXOS } from '../shared/data/socios'

/** Pessoa cadastrada para receber pagamentos nas saídas do leilão (fixa ou variável). */
export interface Participante {
  id: string
  nome: string
}

/** Pagamento a uma pessoa dentro do bloco "Saídas do leilão". */
export interface SaidaLeilao {
  id: string
  participanteId?: string
  /** Presente quando o item foi lançado automaticamente por ser um participante fixo — trava a remoção manual. */
  participanteFixoId?: string
  gastoFixoId?: string
  nome: string
  valor: number
}

/** Despesa avulsa do bloco "Saídas operacionais" (reparos, boletos, fornecedores). */
export interface SaidaOperacional {
  id: string
  gastoFixoId?: string
  descricao: string
  valor: number
  data: string
}

/** Bloco de saída em que um gasto fixo deve ser lançado automaticamente. */
export type DestinoGastoFixo = 'saidasLeilao' | 'saidasOperacionais'

/**
 * Despesa recorrente (aluguel, folha, assinatura...) que entra sozinha em todo
 * novo leilão, no bloco escolhido em `destino` — não é uma opção manual dentro
 * das saídas, ela já nasce lançada.
 */
export interface GastoFixo {
  id: string
  nome: string
  valor: number
  dataPagamento?: string
  destino: DestinoGastoFixo
}

/** Valor a receber de terceiros, listado no bloco "A receber". */
export interface ValorAReceber {
  id: string
  descricao: string
  valor: number
}

/** Nome dos 3 sócios fixos entre os quais a comissão é sempre rateada igualmente. */
export type NomeSocio = (typeof SOCIOS_FIXOS)[number]

/** Parte do rateio calculada para um sócio. */
export interface RateioSocio {
  socio: NomeSocio
  valor: number
}

/** Registro completo de um leilão, persistido no histórico. */
export interface Leilao {
  id: string
  data: string
  criadoEm: string
  atualizadoEm: string

  saidasLeilao: SaidaLeilao[]
  saidasOperacionais: SaidaOperacional[]
  valoresAReceber: ValorAReceber[]

  totalVendas: number
  percentualComissao: number
  descontos: number
  saldoAnterior: number
  saldoNegativoAcumulado: number

  observacoes?: string
}

/** Totais derivados de um leilão — sempre calculados, nunca editados diretamente. */
export interface ResumoFinanceiro {
  totalSaidasLeilao: number
  totalSaidasOperacionais: number
  totalAReceber: number
  totalComissao: number
  rateioSocios: RateioSocio[]
  saldoFinalPlanilhado: number
}
