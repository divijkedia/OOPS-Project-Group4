import React from 'react';
import { cn } from '../../lib/utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({ children, className, containerClassName, ...props }) => (
  <div className={cn('w-full overflow-x-auto rounded-xl border border-surface-border bg-white shadow-sm', containerClassName)}>
    <table className={cn('w-full text-left text-sm text-content-dark border-collapse', className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={cn('bg-slate-50/80 border-b border-surface-border text-xs uppercase font-semibold text-content-muted tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={cn('divide-y divide-surface-border/70', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={cn('transition-colors hover:bg-slate-50/60', className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={cn('px-4 py-3.5', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className={cn('px-4 py-3.5 align-middle', className)} {...props}>
    {children}
  </td>
);
