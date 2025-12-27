"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Search,
  User,
  FileText,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function CekPesananPage() {
  const supabase = createClient();

  // --- STATE ---
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Helper IDR
  const toIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  // --- HANDLER SEARCH ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchId || !searchName) {
      toast.error("Mohon isi ID Pesanan dan Nama Pemesan");
      return;
    }

    setLoading(true);
    setOrder(null);
    setHasSearched(true);

    try {
      // Query ke Supabase
      // Kita gunakan .eq() untuk ID dan .ilike() untuk nama (case-insensitive) agar lebih UX friendly
      // Namun, kombinasi keduanya harus benar agar data kembali.
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", searchId)
        .ilike("customer_name", searchName)
        .single(); // .single() akan error jika tidak ada hasil atau hasil > 1

      if (error || !data) {
        // Jika error biasanya karena data tidak ditemukan (PGRST116)
        toast.error("Pesanan tidak ditemukan. Pastikan ID dan Nama sesuai.");
      } else {
        setOrder(data);
        toast.success("Data pesanan ditemukan!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Sederhana */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Cek Pesanan</h1>
          <p className="text-muted-foreground">
            Masukkan ID Pesanan dan Nama yang Anda gunakan saat mendaftar untuk
            melihat detail.
          </p>
        </div>

        {/* FORM PENCARIAN */}
        <Card className="mb-10 shadow-md">
          <CardHeader>
            <CardTitle>Cari Data</CardTitle>
            <CardDescription>
              Data bersifat rahasia, mohon isi kredensial dengan tepat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="oid">ID Pesanan</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="oid"
                    placeholder="Contoh: 15"
                    className="pl-9"
                    value={searchId}
                    onChange={(e) =>
                      setSearchId(e.target.value.replace(/\D/g, ""))
                    } // Hanya angka
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-2">
                <Label htmlFor="name">Nama Pemesan</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nama Lengkap Sesuai Input Awal"
                    className="pl-9"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-30"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Cek
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* HASIL PENCARIAN */}
        {order && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Detail Pesanan #{order.id}</h2>
              <span className="text-xs text-muted-foreground">
                Dibuat pada:{" "}
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  dateStyle: "full",
                })}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 1. Detail Customer */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" /> Data Pemesan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Nama
                    </span>
                    <span className="font-medium">{order.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Kontak
                    </span>
                    <span className="font-medium">
                      {order.customer_contact}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Alamat
                    </span>
                    <span className="font-medium">
                      {order.customer_address}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Detail Pembayaran */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Metode
                    </span>
                    <span className="font-bold text-primary">
                      {order.payment_method === "CASH"
                        ? "Cash Keras"
                        : "Kredit (KPR)"}
                    </span>
                  </div>

                  {order.payment_method === "CREDIT" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground text-xs block">
                            Uang Muka (DP)
                          </span>
                          <span>{toIDR(order.dp_amount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">
                            Tenor
                          </span>
                          <span>{order.tenor_months} Bulan</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-muted-foreground text-xs block">
                          Cicilan per Bulan
                        </span>
                        <span className="font-medium text-lg text-primary">
                          {toIDR(order.monthly_installment)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="pt-2">
                      <p className="text-muted-foreground italic">
                        Pembayaran dilakukan secara bertahap sesuai progres
                        pembangunan.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t mt-2 flex justify-between items-center">
                    <span className="font-bold">Total Harga Bangunan</span>
                    <span className="font-bold text-lg">
                      {toIDR(order.total_price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. Detail Spesifikasi */}
            <Card>
              <CardHeader className="pb-2 bg-muted/20">
                <CardTitle className="text-base">
                  Rincian Spesifikasi Bangunan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {order.selected_specs &&
                    Object.values(order.selected_specs).map(
                      (spec: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center border-b border-dashed pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-muted-foreground">
                            {spec.name}
                          </span>
                          <span className="font-mono text-xs">
                            {spec.price > 0
                              ? `+${toIDR(spec.price)}`
                              : "Standar"}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground pt-10">
              <p>
                Butuh bantuan? Hubungi admin dengan menyebutkan ID Pesanan Anda.
              </p>
            </div>
          </div>
        )}

        {/* State Kosong (Belum ketemu) */}
        {!order && hasSearched && !loading && (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed mt-8">
            <p>Data tidak ditemukan. Silakan periksa kembali input Anda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
