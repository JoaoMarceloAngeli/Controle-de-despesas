import type { Leilao, ResumoFinanceiro } from '../types'
import { exportarLeilaoExcel } from '../utils/exportExcel'
import { exportarLeilaoPdf } from '../utils/exportPdf'
import { Botao } from './ui/Botao'

interface ExportButtonsProps {
  leilao: Leilao
  resumo: ResumoFinanceiro
}

export function ExportButtons({ leilao, resumo }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Botao variante="secundario" onClick={() => exportarLeilaoExcel(leilao, resumo)}>
        Exportar Excel
      </Botao>
      <Botao variante="secundario" onClick={() => exportarLeilaoPdf(leilao, resumo)}>
        Exportar PDF
      </Botao>
    </div>
  )
}
