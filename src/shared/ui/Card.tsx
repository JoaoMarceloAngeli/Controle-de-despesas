interface CardProps {
  titulo: string
  valor: string
  destaque?: 'neutro' | 'positivo' | 'negativo'
  /** Acrescenta uma faixa dourada no topo, para destacar os números mais importantes de uma tela. */
  destacarMarca?: boolean
}

const CORES_DESTAQUE: Record<NonNullable<CardProps['destaque']>, string> = {
  neutro: 'text-slate-900',
  positivo: 'text-emerald-600',
  negativo: 'text-red-600',
}

export function Card({ titulo, valor, destaque = 'neutro', destacarMarca = false }: CardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {destacarMarca && <div className="h-1 bg-brand-500" />}
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
        <p className={`mt-1 text-xl font-semibold ${CORES_DESTAQUE[destaque]}`}>{valor}</p>
      </div>
    </div>
  )
}
