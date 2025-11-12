// src/components/Table/Table.tsx
import { useState, useMemo } from 'react';

export interface TableColumn<T = any> {
  title: string;
  key: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right'; // NEW: Fixed column
  ellipsis?: boolean; // NEW: Truncate long text
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T, index: number) => void;

  // Pagination
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
  };

  // Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  customFilters?: React.ReactNode;

  // Styling
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;

  // NEW: Table behavior
  maxHeight?: string; // For vertical scroll
  stickyHeader?: boolean; // Sticky header on scroll
}

export default function Table<T = any>({
  data,
  columns,
  loading = false,
  emptyText = 'No data available',
  onRowClick,
  pagination = { enabled: true, pageSize: 10 },
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  customFilters,
  striped = false,
  hoverable = true,
  compact = false,
  bordered = false,
  maxHeight,
  stickyHeader = false,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Separate fixed and scrollable columns
  const leftFixedColumns = columns.filter((col) => col.fixed === 'left');
  const rightFixedColumns = columns.filter((col) => col.fixed === 'right');
  const scrollableColumns = columns.filter((col) => !col.fixed);
  const hasFixedColumns = leftFixedColumns.length > 0 || rightFixedColumns.length > 0;

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row: any) => {
      return columns.some((col) => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData?.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination.enabled]);

  const totalPages = Math.ceil(sortedData?.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch?.(query);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Render table cell
  const renderCell = (col: TableColumn<T>, row: any, rowIndex: number) => {
    const value = row[col.key];
    const content = col.render ? col.render(value, row, rowIndex) : value;

    if (col.ellipsis) {
      return (
        <div className="truncate max-w-xs" title={String(value)}>
          {content}
        </div>
      );
    }

    return content;
  };

  // Render table header
  const renderTableHeader = (cols: TableColumn<T>[], isFixed?: 'left' | 'right') => (
    <tr>
      {cols.map((col, index) => (
        <th
          key={index}
          className={`px-6 ${compact ? 'py-2' : 'py-4'} text-xs font-medium text-slate-600 uppercase tracking-wider ${
            col.align === 'center'
              ? 'text-center'
              : col.align === 'right'
                ? 'text-right'
                : 'text-left'
          } ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''} ${
            stickyHeader ? 'sticky top-0 z-10 bg-slate-50' : ''
          } ${
            isFixed === 'left'
              ? 'sticky left-0 z-20 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
              : ''
          } ${
            isFixed === 'right'
              ? 'sticky right-0 z-20 bg-slate-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]'
              : ''
          }`}
          style={{
            width: col.width,
            minWidth: col.minWidth || (col.fixed ? '150px' : undefined),
            maxWidth: col.maxWidth,
          }}
          onClick={() => col.sortable && handleSort(col.key)}
        >
          <div className="flex items-center gap-2">
            <span>{col.title}</span>
            {col.sortable && (
              <span className="text-slate-400">
                {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </span>
            )}
          </div>
        </th>
      ))}
    </tr>
  );

  // Render table body
  const renderTableBody = (cols: TableColumn<T>[], isFixed?: 'left' | 'right') => (
    <>
      {paginatedData?.map((row: any, rowIndex) => (
        <tr
          key={rowIndex}
          className={`${striped && rowIndex % 2 === 1 ? 'bg-slate-50' : ''} ${
            hoverable ? 'hover:bg-slate-100' : ''
          } ${onRowClick ? 'cursor-pointer' : ''} transition-colors`}
          onClick={() => onRowClick?.(row, rowIndex)}
        >
          {cols.map((col, colIndex) => (
            <td
              key={colIndex}
              className={`px-6 ${compact ? 'py-2' : 'py-4'} text-sm text-slate-900 ${
                bordered ? 'border-r border-slate-200 last:border-r-0' : ''
              } ${
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'right'
                    ? 'text-right'
                    : 'text-left'
              } ${
                isFixed === 'left'
                  ? 'sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                  : ''
              } ${
                isFixed === 'right'
                  ? 'sticky right-0 z-10 bg-white shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                  : ''
              } ${striped && rowIndex % 2 === 1 && isFixed ? 'bg-slate-50' : ''}`}
              style={{
                minWidth: col.minWidth || (col.fixed ? '150px' : undefined),
                maxWidth: col.maxWidth,
              }}
            >
              {renderCell(col, row, rowIndex)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(searchable || customFilters) && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
          {customFilters}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight }}>
          {hasFixedColumns ? (
            // Table with fixed columns
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                {renderTableHeader([
                  ...leftFixedColumns,
                  ...scrollableColumns,
                  ...rightFixedColumns,
                ])}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedData?.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          className="w-12 h-12 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-slate-500">{emptyText}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  renderTableBody([...leftFixedColumns, ...scrollableColumns, ...rightFixedColumns])
                )}
              </tbody>
            </table>
          ) : (
            // Regular table without fixed columns
            <table className="w-full">
              <thead
                className={`bg-slate-50 border-b border-slate-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
              >
                {renderTableHeader(columns)}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedData?.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          className="w-12 h-12 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-slate-500">{emptyText}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  renderTableBody(columns)
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.enabled && paginatedData?.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
              </span>

              {pagination.showSizeChanger && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
