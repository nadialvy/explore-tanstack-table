import { useEffect, useState } from "react";

export type ElectronicGoods = {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: string;
  rating: number;
}

export default function useElectronicGoods() {
  const [data, setData] = useState<ElectronicGoods[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/mock-data/electronicGoods.json");
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Failed to fetch data"));
        }

      }
    };

    fetchData();
  }, []);

  return { data, error };
}
