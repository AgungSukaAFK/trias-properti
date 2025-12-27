"use client";

import { useState } from "react";
import { useHouseCalculator } from "@/hooks/useHouseCalculator";
import { createClient } from "@/utils/supabase/client";
import { formatRupiah } from "@/utils/currency";
import { Loader2, Home, Calculator, CheckCircle } from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function HouseCustomizer() {
  const { categories, selectedSpecs, totalPrice, loading, handleSelect } =
    useHouseCalculator();
  const supabase = createClient();

  // State untuk Flow Aplikasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Confirm Spec, 2: Payment Method, 3: Lead Form

  // State Pembayaran & Form
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT">("CASH");
  const [dp, setDp] = useState<number>(0);
  const [tenor, setTenor] = useState<string>("12");
  const [customerData, setCustomerData] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Helper Format Rupiah (Bisa dipisah ke utils)
  const toIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  // Logika Kredit (Bunga Flat 12% per tahun)
  const calculateCredit = () => {
    const pokokHutang = totalPrice - dp;
    const bungaPerTahun = 0.12;
    const tenorTahun = parseInt(tenor) / 12;

    const totalBunga = pokokHutang * bungaPerTahun * tenorTahun;
    const totalKewajiban = pokokHutang + totalBunga;
    const angsuranPerBulan = totalKewajiban / parseInt(tenor);

    return { pokokHutang, angsuranPerBulan };
  };

  const { angsuranPerBulan } = calculateCredit();

  // Submit Order
  const handleSubmit = async () => {
    setSubmitting(true);

    const payload = {
      customer_name: customerData.name,
      customer_contact: customerData.contact,
      customer_address: customerData.address,
      selected_specs: selectedSpecs,
      total_price: totalPrice,
      payment_method: paymentMethod,
      dp_amount: paymentMethod === "CREDIT" ? dp : 0,
      tenor_months: paymentMethod === "CREDIT" ? parseInt(tenor) : 0,
      monthly_installment: paymentMethod === "CREDIT" ? angsuranPerBulan : 0,
    };

    const { error } = await supabase.from("orders").insert(payload);

    if (error) {
      alert("Gagal menyimpan pesanan: " + error.message);
    } else {
      alert("Pesanan berhasil dikirim! Sales kami akan menghubungi Anda.");
      setIsConfirmOpen(false);
      // Reset form logic here if needed
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="text-blue-600" />
            <h1 className="font-bold text-xl text-slate-800">
              Trias Properti Customizer
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Estimasi Harga</p>
            <p className="font-bold text-lg text-blue-600">
              {toIDR(totalPrice)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content: Form Customizer */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.id} className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(val) => handleSelect(category.id, val)}
                  defaultValue={selectedSpecs[category.id]?.id.toString()}
                  value={selectedSpecs[category.id]?.id.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Spesifikasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.materials.map((mat) => (
                      <SelectItem key={mat.id} value={mat.id.toString()}>
                        <div className="flex justify-between w-full gap-4">
                          <span>{mat.name}</span>
                          <span className="text-slate-500 text-xs font-mono">
                            {mat.price > 0 ? `+${toIDR(mat.price)}` : "Standar"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Action Button / Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center max-w-4xl">
            <div>
              <p className="text-sm text-slate-500">Total Akhir</p>
              <p className="text-2xl font-bold text-slate-900">
                {toIDR(totalPrice)}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                setStep(1);
                setIsConfirmOpen(true);
              }}
            >
              Lanjut ke Pembayaran
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Dialog Multi-Step */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
          {/* STEP 1: Konfirmasi Spesifikasi */}
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Konfirmasi Spesifikasi</DialogTitle>
                <DialogDescription>
                  Pastikan pilihan material Anda sudah sesuai.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {Object.values(selectedSpecs).map((spec: any, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm border-b pb-1 last:border-0"
                  >
                    <span>{spec.name}</span>
                    <span className="font-medium">
                      {spec.price > 0 ? toIDR(spec.price) : "-"}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{toIDR(totalPrice)}</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Kembali
                </Button>
                <Button onClick={() => setStep(2)}>
                  Saya Yakin, Lanjut Bayar
                </Button>
              </DialogFooter>
            </>
          )}

          {/* STEP 2: Metode Pembayaran & Simulasi */}
          {step === 2 && (
            <>
              <DialogHeader>
                <DialogTitle>Metode Pembayaran</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <RadioGroup
                  defaultValue="CASH"
                  onValueChange={(v: any) => setPaymentMethod(v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="cursor-pointer font-semibold"
                    >
                      Cash Keras
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="CREDIT" id="credit" />
                    <Label
                      htmlFor="credit"
                      className="cursor-pointer font-semibold"
                    >
                      Kredit (KPR)
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "CREDIT" && (
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4 border">
                    <div className="space-y-2">
                      <Label>Uang Muka (DP)</Label>
                      <Input
                        type="number"
                        placeholder="Minimal 0"
                        value={dp}
                        onChange={(e) => setDp(Number(e.target.value))}
                      />
                      <p className="text-xs text-slate-500">
                        Sisa Pokok: {toIDR(totalPrice - dp)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tenor (Bulan)</Label>
                      <Select value={tenor} onValueChange={setTenor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map(
                            (m) => (
                              <SelectItem key={m} value={m.toString()}>
                                {m} Bulan ({(m / 12).toFixed(0)} Tahun)
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />
                    <div className="bg-blue-50 p-3 rounded text-blue-900">
                      <p className="text-sm font-semibold">
                        Simulasi Angsuran (Flat 12%)
                      </p>
                      <p className="text-2xl font-bold">
                        {toIDR(angsuranPerBulan)}{" "}
                        <span className="text-sm font-normal">/bulan</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Kembali
                </Button>
                <Button onClick={() => setStep(3)}>Lanjut Isi Data Diri</Button>
              </DialogFooter>
            </>
          )}

          {/* STEP 3: Form Data Diri (Lead Gen) */}
          {step === 3 && (
            <>
              <DialogHeader>
                <DialogTitle>Data Pemesan</DialogTitle>
                <DialogDescription>
                  Lengkapi data diri untuk diproses oleh marketing kami.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    onChange={(e) =>
                      setCustomerData({ ...customerData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. WhatsApp / HP</Label>
                  <Input
                    placeholder="0812..."
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        contact: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alamat Domisili</Label>
                  <Input
                    placeholder="Alamat lengkap..."
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Kirim Pesanan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
