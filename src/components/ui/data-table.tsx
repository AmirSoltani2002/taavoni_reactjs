
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deleteTableRow, updateTableRow } from "@/general";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableName?: string;
  onRefresh?: () => void;
  editComponent?: React.ComponentType<{ initialValues: any; onSubmit: (values: any) => void; isEdit?: boolean }>;
}


export function DataTable<TData extends { id?: number }, TValue>({
  columns,
  data,
  tableName,
  onRefresh,
  editComponent: EditComponent,
}: DataTableProps<TData, TValue>) {
  // Add actions column if tableName and id are present
  const hasId = data.length > 0 && data[0].id !== undefined;
  const [deleteRow, setDeleteRow] = useState<TData | null>(null);
  const [editRow, setEditRow] = useState<TData | null>(null);

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
                  {editRow && editRow.id === row.original.id && (
                    <div className="fixed overflow-auto inset-0 z-50 flex items-center justify-center bg-black/40" 
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
                            // updateTableRow must be imported in the parent or here
                            if (tableName && editRow.id) {
                              await updateTableRow(tableName, editRow.id, values, () => {
                                if (onRefresh) onRefresh();
                                setEditRow(null);
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteRow(row.original)}><Trash2 /></Button>
                </DialogTrigger>
                {deleteRow && deleteRow.id === row.original.id && <DialogContent>
                  <DialogTitle>حذف رکورد</DialogTitle>
                  <div>آیا مطمئن هستید؟</div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDeleteRow(null)}>انصراف</Button>
                    <Button variant="destructive" onClick={async () => {
                      await deleteTableRow(tableName, row.original.id!);
                      setDeleteRow(null);
                      if (onRefresh) onRefresh();
                    }}>حذف</Button>
                  </DialogFooter>
                </DialogContent>}
              </Dialog>
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
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
    </div>
  );
}