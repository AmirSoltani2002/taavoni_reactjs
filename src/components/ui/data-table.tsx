
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deleteTableRow, updateTableRow } from "@/general";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableName?: string;
  onRefresh?: () => void;
  editComponent?: React.ComponentType<{ initialValues: any; onSubmit: (values: any) => void; isEdit?: boolean }>;
  onClickRow?: (row: TData) => void;
  options?: {
    title: string | React.ReactNode;
    onClick: (row: TData) => void;
  }[]
  _showDeleteButton?: boolean;
}


export function DataTable<TData extends { id?: number }, TValue>({
  columns,
  data,
  tableName,
  onRefresh,
  editComponent: EditComponent,
  onClickRow,
  options,
  _showDeleteButton = true,
}: DataTableProps<TData, TValue>) {
  // Add actions column if tableName and id are present
  const hasId = data.length > 0 && data[0].id !== undefined;
  const [deleteRow, setDeleteRow] = useState<TData | null>(null);
  const [editRow, setEditRow] = useState<TData | null>(null);
  const EditElement = useMemo(() => {
    if(!EditComponent || !editRow){
      return undefined;
    } else {
      return <div className="fixed overflow-auto inset-0 z-50 flex items-center justify-center bg-black/40" 
        onClick={(e) => {
          if(e.target === e.currentTarget){
            setEditRow(null);
          }
        }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <Button className="absolute left-2 top-2" size="icon" variant="ghost" onClick={() => setEditRow(null)}>✕</Button>
            <EditComponent
              initialValues={editRow}
              isEdit
              onSubmit={async (values: any) => {
                if (tableName && editRow.id) {
                  await updateTableRow(tableName, editRow.id, values, () => {
                    if (onRefresh) onRefresh();
                    setEditRow(null);
                  });
                }
              }}
            />
          </div>
        </div>;
    }
  }, [EditComponent, editRow]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Enable sorting for all columns by default, except actions column
  const columnsWithSorting = useMemo(() => {
    return columns.map((col) => {
      // If column already has enableSorting set, respect it
      if (col.enableSorting === false) {
        return col;
      }
      // Enable sorting by default for all columns
      return {
        ...col,
        enableSorting: col.enableSorting !== undefined ? col.enableSorting : true,
      };
    });
  }, [columns]);

  const allColumns = hasId && tableName && (_showDeleteButton || options || EditComponent)
    ? [
        ...columnsWithSorting,
        {
          id: "actions",
          header: "عملیات",
          enableSorting: false, // Actions column should not be sortable
          cell: ({ row }: any) => (
            <div className="flex gap-2">
              {EditComponent && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditRow(row.original)}><Pencil /></Button>
                  {editRow && editRow.id === row.original.id && EditElement}
                </>
              )}
              {options && options.map((op, index) => (
                <Button 
                  key={index}
                  size="sm" 
                  variant="outline" 
                  onClick={() => op.onClick(row.original)}
                >
                  {op.title}
                </Button>
              ))}
              {_showDeleteButton && <Button size="sm" variant="destructive" onClick={() => setDeleteRow(row.original)}><Trash2 /></Button>}    
            </div>
          ),
        } as ColumnDef<TData, TValue>,
      ]
    : columnsWithSorting;

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  const HEADER_COLOR = 'slate';
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();
                return (
                  <TableHead 
                    key={header.id} 
                    className={cn(
                      "text-start",
                      canSort && "cursor-pointer select-none hover:bg-slate-100"
                    )}
                    onClick={() => {
                      if (canSort) {
                        const currentSort = header.column.getIsSorted();
                        if (currentSort === false) {
                          header.column.toggleSorting(false);
                        } else if (currentSort === 'asc') {
                          header.column.toggleSorting(true);
                        } else {
                          header.column.clearSorting();
                        }
                      }
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="text-slate-400">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <ContextMenu key={row.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      `bg-${HEADER_COLOR}-100 hover:bg-${HEADER_COLOR}-200`,
                      onClickRow ? 'cursor-pointer' : '',
                    )}
                    aria-label="مشاهده"
                    onClick={() => {
                      if(onClickRow){
                        onClickRow(row.original)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {EditComponent && (
                    <ContextMenuItem onClick={() => setEditRow(row.original)}>ویرایش</ContextMenuItem>
                  )}
                  {EditElement}
                  <ContextMenuItem style={{color: 'red'}} onClick={() => setDeleteRow(row.original)}>
                    حذف
                  </ContextMenuItem>
                  {options && options.map((op) => (
                    <ContextMenuItem onClick={() => op.onClick(row.original)}>
                      {op.title}
                    </ContextMenuItem>
                  ))}
                </ContextMenuContent>
              </ContextMenu>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={allColumns.length} className="h-24 text-center">
                نتیجه ای یافت نشد.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(tableName && deleteRow) && <Dialog open>
        <DialogContent showCloseButton>
          <DialogTitle>حذف رکورد</DialogTitle>
          <div>آیا مطمئن هستید؟</div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteRow(null)}>انصراف</Button>
            <Button variant="destructive" onClick={async () => {
              await deleteTableRow(tableName, deleteRow.id!);
              setDeleteRow(null);
              if (onRefresh) onRefresh();
            }}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  );
}