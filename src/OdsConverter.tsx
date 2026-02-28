import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './theme'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileCheck,
  BarChart3,
  Layers,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'

type Status = 'idle' | 'reading' | 'converting' | 'done' | 'error'

interface SheetData {
  name: string
  rows: (string | number | boolean | null)[][]
  rowCount: number
  colCount: number
}

interface ConvertResult {
  originalName: string
  convertedName: string
  originalSize: number
  convertedSize: number
  sheets: SheetData[]
  xlsxBuffer: ArrayBuffer
}

export default function OdsConverter() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)
    setResult(null)
    setProgress(0)

    const isOds = file.name.toLowerCase().endsWith('.ods')
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx')

    if (!isOds && !isXlsx) {
      setError(t('error.unsupportedFormat'))
      setStatus('error')
      return
    }

    try {
      setStatus('reading')
      setProgress(20)
      const buf = await file.arrayBuffer()

      setStatus('converting')
      setProgress(50)

      // SheetJS читает ODS нативно
      const workbook = XLSX.read(buf, {
        type: 'array',
        cellDates: true,
        cellNF: true,
      })

      setProgress(75)

      // Извлекаем данные всех листов
      const sheets: SheetData[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name]
        const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
          sheet,
          { header: 1, defval: null }
        )
        // Убираем trailing null в каждой строке
        const cleaned = rows.map((row) => {
          const arr = [...row]
          while (arr.length && arr[arr.length - 1] === null) arr.pop()
          return arr
        })
        // Убираем trailing пустые строки
        while (cleaned.length && cleaned[cleaned.length - 1].length === 0) cleaned.pop()

        const colCount = Math.max(0, ...cleaned.map((r) => r.length))
        return { name, rows: cleaned, rowCount: cleaned.length, colCount }
      })

      // Генерируем XLSX
      const xlsxArray = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
        compression: true,
      }) as ArrayBuffer

      setProgress(100)
      setStatus('done')
      setResult({
        originalName: file.name,
        convertedName: file.name.replace(/\.ods$/i, '.xlsx'),
        originalSize: file.size,
        convertedSize: xlsxArray.byteLength,
        sheets,
        xlsxBuffer: xlsxArray,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error.unknown'))
      setStatus('error')
    }
  }, [t])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = result.convertedName
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatCell = (val: string | number | boolean | null): string => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object' && val !== null) return String(val)
    return String(val)
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">{t('status.idle')}</Badge>
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            aria-label={t('aria.toggleLanguage')}
            className="flex items-center gap-1.5 px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs font-medium">{i18n.language.toUpperCase()}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={t('aria.toggleTheme')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {theme === 'light'
              ? <Moon className="h-5 w-5" />
              : <Sun className="h-5 w-5" />
            }
          </Button>
        </div>

        {/* Drop Zone */}
        <Card>
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                relative flex flex-col items-center justify-center gap-3
                rounded-xl border-2 border-dashed p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".ods,.xlsx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              />

              {status === 'idle' || status === 'done' || status === 'error' ? (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-full">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                      {t('dragAndDrop')}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      {t('supportedFormats')}: <span className="font-mono">.ods</span> и{' '}
                      <span className="font-mono">.xlsx</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {status === 'reading' ? t('reading') : t('converting')}
                  </p>
                  <Progress value={progress} className="w-48" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {status === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {status === 'done' && result && (
          <>
            {/* Meta cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" /> {t('result.originalFile')}
                  </CardDescription>
                  <CardTitle className="text-sm font-mono truncate">{result.originalName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{formatSize(result.originalSize)}</Badge>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> {t('result.convertedFile')}
                  </CardDescription>
                  <CardTitle className="text-sm font-mono truncate text-green-800 dark:text-green-300">{result.convertedName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-600 dark:bg-green-700">{formatSize(result.convertedSize)}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {t('result.sheets')}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{result.sheets.length}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> {t('result.totalRows')}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {result.sheets.reduce((s, sh) => s + sh.rowCount, 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Pipeline badge */}
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <Badge variant="outline" className="font-mono">.ods</Badge>
              <ArrowRight className="h-4 w-4 text-blue-400" />
              <Badge variant="outline" className="font-mono text-green-700 border-green-300">
                SheetJS
              </Badge>
              <ArrowRight className="h-4 w-4 text-blue-400" />
              <Badge variant="outline" className="font-mono">.xlsx</Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-xs text-slate-400 dark:text-slate-500">{t('result.conversionDone')}</span>
            </div>

            {/* Sheet preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('result.dataPreview')}</CardTitle>
                <CardDescription>
                  {t('result.dataPreviewDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={result.sheets[0]?.name}>
                  <TabsList>
                    {result.sheets.map((sheet) => (
                      <TabsTrigger key={sheet.name} value={sheet.name}>
                        {sheet.name}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {sheet.rowCount}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {result.sheets.map((sheet) => (
                    <TabsContent key={sheet.name} value={sheet.name}>
                      <ScrollArea className="h-[400px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/60">
                              {sheet.rows[0]?.map((cell, i) => (
                                <TableHead
                                  key={i}
                                  className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                                >
                                  {formatCell(cell) || <span className="text-slate-300">—</span>}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sheet.rows.slice(1, 101).map((row, rIdx) => (
                              <TableRow key={rIdx}>
                                {Array.from(
                                  { length: sheet.colCount },
                                  (_, cIdx) => (
                                    <TableCell key={cIdx} className="whitespace-nowrap text-sm">
                                      {formatCell(row[cIdx] ?? null)}
                                    </TableCell>
                                  )
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      {sheet.rowCount > 101 && (
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          {t('result.showingRows', { count: 100, total: sheet.rowCount - 1 })}
                        </p>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Download */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {t('result.downloadAnother')}
              </Button>
              <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                {t('result.download', { filename: result.convertedName })}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
