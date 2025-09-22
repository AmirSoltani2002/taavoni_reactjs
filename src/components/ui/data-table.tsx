
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
}


export function DataTable<TData extends { id?: number }, TValue>({
  columns,
  data,
  tableName,
  onRefresh,
  editComponent: EditComponent,
  onClickRow,
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
  const allColumns = hasId && tableName
    ? [
        ...columns,
        {
          id: "actions",
          header: "عملیات",
          cell: ({ row }: any) => (
            <div className="flex gap-2">
              {EditComponent && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditRow(row.original)}><Pencil /></Button>
                  {editRow && editRow.id === row.original.id && EditElement}
                </>
              )}
              <Button size="sm" variant="destructive" onClick={() => setDeleteRow(row.original)}><Trash2 /></Button>    
            </div>
          ),
        } as ColumnDef<TData, TValue>,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const HEADER_COLOR = 'slate';
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-start">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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