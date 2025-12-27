"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MaterialCategory } from "@/types/database";

export function useHouseCalculator() {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan pilihan user: { category_id: material_price }
  // Kita simpan harga langsung biar gampang hitung, tapi idealnya simpan object material full
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, any>>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Ambil kategori beserta material di dalamnya
      const { data, error } = await supabase
        .from("material_categories")
        .select("*, materials(*)")
        .order("id");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setCategories(data as any);

        // Set default value (pilih opsi pertama/termurah secara otomatis saat load)
        const defaults: Record<string, any> = {};
        data?.forEach((cat: any) => {
          if (cat.materials && cat.materials.length > 0) {
            // Sort material by price asc (default termurah)
            const sorted = cat.materials.sort(
              (a: any, b: any) => a.price - b.price
            );
            defaults[cat.id] = sorted[0];
          }
        });
        setSelectedSpecs(defaults);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSelect = (categoryId: number, materialId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const material = category?.materials.find(
      (m) => m.id.toString() === materialId
    );

    if (material) {
      setSelectedSpecs((prev) => ({
        ...prev,
        [categoryId]: material,
      }));
    }
  };

  // Hitung Total Harga
  const totalPrice = Object.values(selectedSpecs).reduce((acc, curr) => {
    return acc + (Number(curr.price) || 0);
  }, 0);

  return {
    categories,
    selectedSpecs,
    totalPrice,
    loading,
    handleSelect,
  };
}
