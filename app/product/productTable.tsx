import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import "~/app.css";
import { shareMediaFile } from "~/components/shareMediaFile";
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
    <div className="w-full h-screen flex justify-center items-center ">
      {/* use share media here */}
      <button
        className=" bg-blue-400 px-4 py-2 rounded text-white mr-2"
        onClick={() => shareMediaFile({ url: "/cat.png" })}
      >
        Share Image
      </button>

      <button
        className=" bg-green-400 px-4 py-2 rounded text-white"
        onClick={() => shareMediaFile({ url: "/cat.mp4", type: "video" })}
      >
        Share Video
      </button>

      {/* <BasicTable data={data} columns={columns} /> */}
    </div>
  );
}
