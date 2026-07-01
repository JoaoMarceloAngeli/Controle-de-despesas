import type { ButtonHTMLAttributes } from 'react'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo'
}

const VARIANTES: Record<NonNullable<BotaoProps['variante']>, string> = {
  primario: 'bg-brand-500 text-ink-900 hover:bg-brand-600',
  secundario: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  perigo: 'bg-red-50 text-red-600 hover:bg-red-100',
}

export function Botao({ variante = 'primario', className = '', ...props }: BotaoProps) {
  return (
    <button
      type="button"
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  )
}
