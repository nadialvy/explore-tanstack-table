import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import "~/app.css";
import useElectronicGoods, {
  type ElectronicGoods,
} from "~/mutations/useElectronicGoods";
import BasicTable from "~/components/table/BasicTable";

export default function Products() {
  const { data, error } = useElectronicGoods();

  // Define table columns to pass into table
  const columns = useMemo<ColumnDef<ElectronicGoods>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        filterFn: "includesString",
        enableSorting: true,
      },
      {
        accessorKey: "category",
        header: "Category",
        filterFn: "includesString",
        enableSorting: true,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info) => `$${(info.getValue() as number).toFixed(2)}`,
        filterFn: "equals",
        enableSorting: true,
      },
      {
        accessorKey: "inStock",
        header: "In Stock",
        filterFn: "includesString",
        enableSorting: true,
      },
    ],
    []
  );

  if (error) return <div>{String(error)}</div>;
  if (!data || data.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen gap-y-3 flex flex-col justify-center items-center p-4">
      <BasicTable data={data} columns={columns} />
    </div>
  );
}
