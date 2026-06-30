interface CampoMoedaProps {
  id?: string
  label?: string
  valor: number
  onChange: (valor: number) => void
  min?: number
  step?: number
  placeholder?: string
}

/** Input numérico para valores em reais, com prefixo "R$" e fallback seguro para 0 em entradas inválidas. */
export function CampoMoeda({ id, label, valor, onChange, min, step = 0.01, placeholder }: CampoMoedaProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm text-slate-700">
      {label && <span className="font-medium">{label}</span>}
      <span className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <span className="text-slate-400">R$</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          placeholder={placeholder ?? '0,00'}
          value={valor === 0 ? '' : valor}
          onChange={(e) => {
            const novoValor = e.target.valueAsNumber
            onChange(Number.isFinite(novoValor) ? novoValor : 0)
          }}
          className="w-full border-none bg-transparent text-slate-900 outline-none"
        />
      </span>
    </label>
  )
}
