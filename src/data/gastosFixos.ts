import type { GastoFixo } from '../types'

/**
 * Despesas fixas que devem entrar automaticamente em todo novo leilão, no
 * bloco de saída escolhido para cada uma. Edite esta lista para refletir os
 * gastos fixos reais — depois da primeira execução, o localStorage passa a
 * ser a fonte da verdade (veja `useGastosFixos`).
 */
export const GASTOS_FIXOS: Omit<GastoFixo, 'id'>[] = [
  // { nome: 'Nome do gasto fixo', valor: 0, destino: 'saidasOperacionais' },
]
