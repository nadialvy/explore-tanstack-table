import type { CellContext, ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import "~/app.css";
import useElectronicGoods, {
  type ElectronicGoods,
} from "~/mutations/useElectronicGoods";
import BasicTable from "~/table/BasicTable";

export default function ProductTable() {
  const { data, error } = useElectronicGoods();

  // Define table columns to pass into table
  const columns = useMemo(
    () => [
      {
        accessorKey: "name", // Accessor key for the "name" field from data object
        header: "Name", // Column header
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info: CellContext<ElectronicGoods, number>) =>
          `$${info.getValue().toFixed(2)}`, // Format price as currency
      },
      {
        accessorKey: "inStock",
        header: "In Stock",
      },
    ],
    []
  );

  if (error) return <div>{String(error)}</div>;
  if (!data || data.length === 0) return <div>Loading...</div>;

  return (
    <BasicTable data={data} columns={columns as ColumnDef<ElectronicGoods>[]} />
  );
}
