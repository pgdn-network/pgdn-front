import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
          className
        )}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-surface-secondary border-b border-border sticky top-0 z-10',
        className
      )}
      {...props}
    />
  )
)
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
)
TableBody.displayName = 'TableBody'

const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-border bg-surface-secondary font-medium',
        className
      )}
      {...props}
    />
  )
)
TableFooter.displayName = 'TableFooter'

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-all duration-200 hover:bg-surface-hover',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-14 px-6 text-left align-middle font-semibold text-primary text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0 bg-surface-secondary',
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = 'TableHead'

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-6 py-4 align-middle text-primary [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
}
