import JSZip from 'jszip'

export type SpreadsheetCell = string | number

export type SpreadsheetSheet = {
  name: string
  rows: SpreadsheetCell[][]
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnName(index: number) {
  let current = index
  let result = ''

  while (current >= 0) {
    result = String.fromCharCode((current % 26) + 65) + result
    current = Math.floor(current / 26) - 1
  }

  return result
}

function worksheetName(name: string, index: number) {
  const cleaned = name.replace(/[\\/*?:[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  const fallback = cleaned || `Sheet ${index + 1}`
  return fallback.slice(0, 31)
}

function normalizeCell(cell: SpreadsheetCell) {
  if (typeof cell === 'number' && Number.isFinite(cell)) {
    return {
      type: 'number' as const,
      value: String(cell),
    }
  }

  const text = String(cell ?? '').trim()
  if (/^-?\d+(?:\.\d+)?$/u.test(text)) {
    return {
      type: 'number' as const,
      value: text,
    }
  }

  return {
    type: 'string' as const,
    value: text,
  }
}

function buildWorksheetXml(rows: SpreadsheetCell[][]) {
  const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const normalizedRows = rows.map(row => {
    const nextRow = [...row]
    while (nextRow.length < maxColumns) nextRow.push('')
    return nextRow
  })

  const xmlRows = normalizedRows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => {
          const normalized = normalizeCell(cell)
          const ref = `${columnName(columnIndex)}${rowIndex + 1}`

          if (normalized.type === 'number') {
            return `<c r="${ref}"><v>${normalized.value}</v></c>`
          }

          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(normalized.value)}</t></is></c>`
        })
        .join('')

      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${columnName(Math.max(0, maxColumns - 1))}${Math.max(1, normalizedRows.length)}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${xmlRows}</sheetData>
</worksheet>`
}

export async function buildXlsxWorkbook(sheets: SpreadsheetSheet[]) {
  const safeSheets = sheets.length > 0 ? sheets : [{ name: 'Sheet 1', rows: [['No data']] }]
  const zip = new JSZip()

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${safeSheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('')}
</Types>`
  )

  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  )

  zip.folder('xl')?.file(
    'workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${safeSheets
      .map(
        (sheet, index) =>
          `<sheet name="${xmlEscape(worksheetName(sheet.name, index))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
      )
      .join('')}
  </sheets>
</workbook>`
  )

  zip.folder('xl')?.folder('_rels')?.file(
    'workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${safeSheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join('')}
  <Relationship Id="rId${safeSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  )

  zip.folder('xl')?.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
  )

  const worksheets = zip.folder('xl')?.folder('worksheets')
  safeSheets.forEach((sheet, index) => {
    worksheets?.file(`sheet${index + 1}.xml`, buildWorksheetXml(sheet.rows))
  })

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

function splitByBestSeparator(line: string, mode: 'auto' | 'strict' | 'spreadsheet') {
  const trimmed = line.trim()
  if (!trimmed) return []

  const candidates = [
    trimmed.split('\t').map(part => part.trim()).filter(Boolean),
    trimmed.split(/\s{2,}/u).map(part => part.trim()).filter(Boolean),
    trimmed.split('|').map(part => part.trim()).filter(Boolean),
    trimmed.split(',').map(part => part.trim()).filter(Boolean),
    trimmed.split(';').map(part => part.trim()).filter(Boolean),
  ]

  const pool =
    mode === 'strict'
      ? candidates.slice(0, 2)
      : mode === 'spreadsheet'
        ? [candidates[0], candidates[3], candidates[4], candidates[2], candidates[1]]
        : candidates

  return pool.reduce((best, current) => (current.length > best.length ? current : best), [] as string[])
}

export function extractSpreadsheetSheetsFromText(
  text: string,
  options: {
    mode?: 'auto' | 'strict' | 'spreadsheet'
    headerRow?: boolean
  } = {}
) {
  const mode = options.mode || 'auto'
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const groups: string[][][] = []
  let current: string[][] = []

  for (const line of lines) {
    const columns = splitByBestSeparator(line, mode)

    if (columns.length >= 2) {
      current.push(columns)
      continue
    }

    if (current.length >= 2) {
      groups.push(current)
    }
    current = []
  }

  if (current.length >= 2) {
    groups.push(current)
  }

  if (groups.length === 0) {
    return [
      {
        name: 'Extracted Text',
        rows: [['Text'], ...lines.slice(0, 200).map(line => [line])],
      },
    ]
  }

  return groups.map((group, index) => {
    const width = group.reduce((max, row) => Math.max(max, row.length), 0)
    const rows = group.map(row => {
      const normalized = [...row]
      while (normalized.length < width) normalized.push('')
      return normalized
    })

    const name = options.headerRow && rows[0]?.[0]
      ? `Table ${index + 1} - ${String(rows[0][0]).slice(0, 18)}`
      : `Table ${index + 1}`

    return {
      name,
      rows,
    }
  })
}
