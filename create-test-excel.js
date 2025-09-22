// Script para crear un archivo Excel de prueba
import * as XLSX from 'xlsx'

const data = [
  ['cuantía', 'fecha_inicio', 'fecha_fin', 'modalidad', 'tae_contrato', 'fecha_sentencia'],
  [10000.00, '2023-01-01', '2024-01-01', 'legal', '', ''],
  [15000.50, '2023-06-15', '2024-06-15', 'judicial', '', '2024-03-15'],
  [20000.00, '2023-03-01', '2024-03-01', 'tae', 5.25, ''],
  [25000.75, '2023-09-01', '2024-09-01', 'tae_plus5', 4.50, '']
]

const worksheet = XLSX.utils.aoa_to_sheet(data)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')

XLSX.writeFile(workbook, 'prueba_intereses.xlsx')