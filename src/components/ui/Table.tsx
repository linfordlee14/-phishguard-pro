import { useState, useMemo, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from './Skeleton'

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pageSize?: number
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  getId?: (item: T) => string
  emptyMessage?: string
  emptyIcon?: ReactNode
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  pageSize = 10,
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  getId = (item) => item.id as string,
  emptyMessage = 'No data found',
  emptyIcon,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const allSelected = paged.length > 0 && paged.every((item) => selectedIds.has(getId(item)))

  const toggleAll = () => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (allSelected) {
      paged.forEach((item) => next.delete(getId(item)))
    } else {
      paged.forEach((item) => next.add(getId(item)))
    }
    onSelectionChange(next)
  }

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  if (loading) {
    return <Skeleton variant="table" rows={5} />
  }

  if (data.length === 0) {
    return (
      <div className="card p-12 text-center">
        {emptyIcon && <div className="mb-4 text-text-2">{emptyIcon}</div>}
        <p className="text-text-2">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {selectable && (
                <th className="p-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-cyan" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-3 text-left text-text-2 font-medium ${col.sortable ? 'cursor-pointer select-none hover:text-text-1' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => (
              <tr key={getId(item)} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                {selectable && (
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.has(getId(item))} onChange={() => toggleOne(getId(item))} className="accent-cyan" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="p-3 text-text-1">
                    {col.render ? col.render(item) : (item[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-3 border-t border-border">
          <span className="text-sm text-text-2">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1 text-text-2 hover:text-text-1 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1 text-text-2 hover:text-text-1 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
