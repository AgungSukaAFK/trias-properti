"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  Lock,
  Eye,
  User,
  CreditCard,
  Home,
} from "lucide-react";
import { Material, MaterialCategory } from "@/types/database";
import { useRouter } from "next/navigation";

// --- TYPES ---
type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  total_price: number;
  payment_method: string;
  status: string;
  selected_specs: any;
  dp_amount: number;
  tenor_months: number;
  monthly_installment: number;
};

const ADMIN_PASS = "triaS@2025xyz";

export default function AdminPage() {
  const router = useRouter();

  // --- STATE AUTH ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // --- STATE DATA ---
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE FILTER & DETAIL ---
  const [searchOrder, setSearchOrder] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- STATE EDIT MATERIAL ---
  const [editingMaterials, setEditingMaterials] = useState<
    Record<number, { name: string; price: number }>
  >({});
  const [newMaterial, setNewMaterial] = useState<{
    catId: number;
    name: string;
    price: string;
  } | null>(null);

  const supabase = createClient();

  // Helper Currency
  const toIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  // --- HANDLER LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASS) {
      setIsAuthenticated(true);
      toast.success("Login Berhasil");
      fetchOrders();
      fetchMaterials();
    } else {
      toast.error("Password Salah!");
    }
  };

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Gagal ambil order: " + error.message);
    else setOrders(data || []);
    setLoading(false);
  };

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("material_categories")
      .select("*, materials(*)")
      .order("id");

    if (error) {
      toast.error("Gagal ambil material: " + error.message);
    } else {
      const sortedData = data?.map((cat) => ({
        ...cat,
        materials: cat.materials.sort(
          (a: { price: number }, b: { price: number }) => a.price - b.price
        ),
      }));
      setCategories(sortedData as any);
    }
  };

  // --- ACTIONS ---
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // --- CRUD MATERIAL ---
  const handleEditChange = (
    id: number,
    field: "name" | "price",
    value: string
  ) => {
    setEditingMaterials((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        name: prev[id]?.name ?? "",
        price: prev[id]?.price ?? 0,
        [field]: field === "price" ? Number(value) : value,
      },
    }));
  };

  const saveMaterial = async (original: Material) => {
    const changes = editingMaterials[original.id];
    if (!changes) return;

    const payload = {
      name: changes.name || original.name,
      price: changes.price !== undefined ? changes.price : original.price,
    };

    const { error } = await supabase
      .from("materials")
      .update(payload)
      .eq("id", original.id);

    if (error) toast.error("Gagal update: " + error.message);
    else {
      toast.success("Material berhasil diupdate");
      const newEditState = { ...editingMaterials };
      delete newEditState[original.id];
      setEditingMaterials(newEditState);
      fetchMaterials();
    }
  };

  const deleteMaterial = async (id: number) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) toast.error("Gagal hapus: " + error.message);
    else {
      toast.success("Item dihapus");
      fetchMaterials();
    }
  };

  const addMaterial = async () => {
    if (!newMaterial || !newMaterial.name) return;
    const { error } = await supabase.from("materials").insert({
      category_id: newMaterial.catId,
      name: newMaterial.name,
      price: Number(newMaterial.price) || 0,
    });
    if (error) toast.error("Gagal nambah: " + error.message);
    else {
      toast.success("Item baru ditambahkan");
      setNewMaterial(null);
      fetchMaterials();
    }
  };

  // --- RENDER LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Masukkan Password Admin"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Masuk Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  const filteredOrders = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.id.toString().includes(searchOrder)
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Kelola pesanan dan database material.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Keluar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Daftar Order</TabsTrigger>
            <TabsTrigger value="materials">Database Material</TabsTrigger>
          </TabsList>

          {/* === TAB ORDER === */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Pesanan Masuk</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchOrders}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama customer atau ID..."
                    className="pl-9 max-w-sm"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">ID</th>
                        <th className="p-4 font-medium">Tanggal</th>
                        <th className="p-4 font-medium">Customer</th>
                        <th className="p-4 font-medium">Metode</th>
                        <th className="p-4 font-medium">Total Harga</th>
                        <th className="p-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-muted-foreground"
                          >
                            Tidak ada data order.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-muted/10 transition-colors last:border-0"
                          >
                            <td className="p-4 font-mono">#{order.id}</td>
                            <td className="p-4">
                              {new Date(order.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-bold">
                                {order.customer_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {order.customer_contact}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  order.payment_method === "CASH"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {order.payment_method}
                              </Badge>
                            </td>
                            <td className="p-4 font-bold">
                              {toIDR(order.total_price)}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetail(order)}
                              >
                                <Eye className="w-4 h-4 mr-2" /> Detail
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB MATERIAL === */}
          <TabsContent value="materials" className="space-y-8">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="bg-muted/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {cat.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/10 border-b text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="p-4 w-[40%]">Nama Material</th>
                        <th className="p-4 w-[30%]">Harga Tambahan</th>
                        <th className="p-4 w-[30%] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cat.materials.map((mat) => {
                        const isEditing =
                          editingMaterials[mat.id] !== undefined;
                        const currentName = isEditing
                          ? editingMaterials[mat.id].name
                          : mat.name;
                        const currentPrice = isEditing
                          ? editingMaterials[mat.id].price
                          : mat.price;

                        return (
                          <tr key={mat.id} className="group hover:bg-muted/5">
                            <td className="p-3 pl-4">
                              <Input
                                value={currentName}
                                onChange={(e) =>
                                  handleEditChange(
                                    mat.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="h-8 w-full"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={currentPrice}
                                onChange={(e) =>
                                  handleEditChange(
                                    mat.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="h-8 w-full font-mono"
                              />
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {toIDR(Number(currentPrice))}
                              </div>
                            </td>
                            <td className="p-3 pr-4 text-right flex justify-end gap-2">
                              {isEditing && (
                                <Button
                                  size="icon"
                                  variant="default"
                                  className="h-8 w-8 bg-green-600 hover:bg-green-700"
                                  onClick={() => saveMaterial(mat)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteMaterial(mat.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-primary/5">
                        <td className="p-3 pl-4">
                          {newMaterial?.catId === cat.id ? (
                            <Input
                              placeholder="Nama item baru..."
                              className="h-8 bg-white"
                              value={newMaterial.name}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  name: e.target.value,
                                })
                              }
                              autoFocus
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary p-0 h-8 flex items-center gap-2"
                              onClick={() =>
                                setNewMaterial({
                                  catId: cat.id,
                                  name: "",
                                  price: "0",
                                })
                              }
                            >
                              <Plus className="w-4 h-4" /> Tambah Item
                            </Button>
                          )}
                        </td>
                        <td className="p-3">
                          {newMaterial?.catId === cat.id && (
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 bg-white"
                              value={newMaterial.price}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  price: e.target.value,
                                })
                              }
                            />
                          )}
                        </td>
                        <td className="p-3 pr-4 text-right">
                          {newMaterial?.catId === cat.id && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={addMaterial}>
                                Simpan
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setNewMaterial(null)}
                              >
                                Batal
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG DETAIL PESANAN */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Tanggal: {/* PERBAIKAN DI SINI: Menggunakan toLocaleString */}
              {selectedOrder &&
                new Date(selectedOrder.created_at).toLocaleString("id-ID", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-6 py-4">
              {/* Info Customer & Pembayaran */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" /> Data Pemesan
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground text-xs block">
                        Nama
                      </span>
                      {selectedOrder.customer_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground text-xs block">
                        Kontak
                      </span>
                      {selectedOrder.customer_contact}
                    </p>
                    <p>
                      <span className="text-muted-foreground text-xs block">
                        Alamat
                      </span>
                      {selectedOrder.customer_address}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4" /> Pembayaran
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground text-xs block">
                        Metode
                      </span>
                      <Badge variant="outline">
                        {selectedOrder.payment_method}
                      </Badge>
                    </p>
                    {selectedOrder.payment_method === "CREDIT" && (
                      <>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-muted-foreground text-xs block">
                              DP
                            </span>
                            {toIDR(selectedOrder.dp_amount)}
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block">
                              Tenor
                            </span>
                            {selectedOrder.tenor_months} Bln
                          </div>
                        </div>
                        <p className="mt-2 pt-2 border-t">
                          <span className="text-muted-foreground text-xs block">
                            Cicilan
                          </span>
                          <span className="font-bold text-primary">
                            {toIDR(selectedOrder.monthly_installment)}/bln
                          </span>
                        </p>
                      </>
                    )}
                    <p className="mt-2 pt-2 border-t flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>{toIDR(selectedOrder.total_price)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Spesifikasi */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4" /> Spesifikasi Bangunan
                </h3>
                <div className="border rounded-lg overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 font-medium">Kategori</th>
                        <th className="p-3 font-medium">Pilihan</th>
                        <th className="p-3 font-medium text-right">Harga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.values(selectedOrder.selected_specs || {}).map(
                        (spec: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 text-muted-foreground">
                              {
                                categories.find(
                                  (c) => c.id === spec.category_id
                                )?.name
                              }
                            </td>
                            <td className="p-3 font-medium">{spec.name}</td>
                            <td className="p-3 text-right font-mono text-xs">
                              {spec.price > 0 ? toIDR(spec.price) : "-"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
