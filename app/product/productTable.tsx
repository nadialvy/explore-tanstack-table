import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import "~/app.css";
import { shareImageFile } from "~/components/ShareImage";
import useElectronicGoods, {
  type ElectronicGoods,
} from "~/mutations/useElectronicGoods";
import BasicTable from "~/table/BasicTable";

export default function ProductTable() {
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
    <div>
      {/* use share image here */}
      <button
        onClick={() =>
          shareImageFile(
            "https://assets.csm-staging.zero-one.cloud/brand-assets/1qxs8ce2j1rj40ct09mr7rp6bc_078d1e264a.mp4"
          )
        }
      >
        Share Image
      </button>

      <BasicTable data={data} columns={columns} />
    </div>
  );
}
