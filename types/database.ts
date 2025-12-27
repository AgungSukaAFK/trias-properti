export type Material = {
  id: number;
  category_id: number;
  name: string;
  price: number;
};

export type MaterialCategory = {
  id: number;
  name: string;
  slug: string;
  materials: Material[];
};
