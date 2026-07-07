interface CardProps {
  titulo: string
  valor: string
  destaque?: 'neutro' | 'positivo' | 'negativo'
}

const CORES_DESTAQUE: Record<NonNullable<CardProps['destaque']>, string> = {
  neutro: 'text-slate-900',
  positivo: 'text-emerald-600',
  negativo: 'text-red-600',
}

export function Card({ titulo, valor, destaque = 'neutro' }: CardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`mt-1 text-xl font-semibold ${CORES_DESTAQUE[destaque]}`}>{valor}</p>
    </div>
  )
}
