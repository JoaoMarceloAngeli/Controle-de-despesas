export function formatarMoeda(valor: number): string {
  const seguro = Number.isFinite(valor) ? valor : 0
  return seguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function valorNumericoSeguro(valor: number): number {
  return Number.isFinite(valor) ? valor : 0
}
