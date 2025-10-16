import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type BasicTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export default function BasicTable<T>({ data, columns }: BasicTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* Render the table */}
      <table>
        <thead>
          {/* Render table headers */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th colSpan={header.colSpan} key={header.id}>
                  {/* Render header content or leave blank if it's a placeholder */}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header, // Header definition
                        header.getContext() // Context for the header
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {/* Render table rows */}
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {/* Render each cell's content */}
                  {flexRender(
                    cell.column.columnDef.cell, // Cell definition
                    cell.getContext() // Context for the cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
