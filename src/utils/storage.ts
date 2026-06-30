export function lerDoStorage<T>(chave: string): T | null {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : null
  } catch {
    return null
  }
}

export function gravarNoStorage<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // localStorage indisponível (ex: modo privado/cota excedida) — falha silenciosa
  }
}
