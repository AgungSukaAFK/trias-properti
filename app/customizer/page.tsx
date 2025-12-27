"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHouseCalculator } from "@/hooks/useHouseCalculator";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Info,
  CreditCard,
  User,
  FileCheck,
  Home,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- KONFIGURASI GAMBAR SESUAI DB REAL ---
// Key menggunakan huruf kecil (lowercase).
// Sistem mencocokkan jika nama item di DB mengandung kata kunci di bawah ini.
const MATERIAL_IMAGES: Record<string, string> = {
  // --- 1. UKURAN RUMAH (BASE) ---
  "tipe 30":
    "https://i.pinimg.com/1200x/4d/1c/6d/4d1c6decc834734e8ce2f290452cd5e8.jpg",
  "tipe 40":
    "https://i.pinimg.com/1200x/d7/cd/f0/d7cdf04540013235eacbbc9744502458.jpg",
  "tipe 45":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",

  // --- 2. PONDASI ---
  "batu kali":
    "https://i.pinimg.com/1200x/1f/3c/4f/1f3c4fcf80a4a174766f422e4cc76a15.jpg",
  rollag:
    "https://i.pinimg.com/736x/c9/2d/17/c92d17e36c6fd99f78f0471680ee010b.jpg",
  "plat jalur":
    "https://i.pinimg.com/736x/6f/a8/7b/6fa87b1dee1ca2a240a63442a6a07102.jpg",
  "cakar ayam":
    "https://i.pinimg.com/736x/2d/8b/f6/2d8bf648271d23d8e886bb0f6ad5d139.jpg",

  // --- 3. DINDING ---
  batako:
    "https://i.pinimg.com/1200x/7f/29/c7/7f29c7312576c8acc39f34ae30a77284.jpg",
  hebel:
    "https://i.pinimg.com/1200x/97/80/14/978014e1ba0297f7514b57b366a41455.jpg",
  "bata ringan":
    "https://i.pinimg.com/1200x/97/80/14/978014e1ba0297f7514b57b366a41455.jpg",
  "bata merah":
    "https://i.pinimg.com/1200x/15/d9/a0/15d9a0a273cb8b850e1978da6f8428ca.jpg",

  // --- 4. LANTAI ---
  keramik:
    "https://i.pinimg.com/1200x/06/68/ef/0668efeb92f43fac8a75150d3cfcb780.jpg",
  granit:
    "https://i.pinimg.com/736x/92/fe/68/92fe6802724cb5f7e785e733aa17830b.jpg",
  "batu alam":
    "https://i.pinimg.com/1200x/3e/72/ff/3e72ff36677c384c03ca234c736f0bca.jpg",
  marmer:
    "https://i.pinimg.com/736x/ae/8a/33/ae8a3379efb422e63b00291716128602.jpg",

  // --- 5. KASO & RENG (Rangka Atap) ---
  "kaso kayu":
    "https://i.pinimg.com/736x/8e/64/49/8e6449fafec587417f87dadced6bba6b.jpg", // Rangka Kayu
  "baja ringan":
    "https://i.pinimg.com/736x/04/4d/fe/044dfe5ad19f02790029fa059fa8ac67.jpg", // Kanal C

  // --- 6. GENTENG (Penutup Atap) ---
  "genteng tanah":
    "https://i.pinimg.com/736x/1b/36/a4/1b36a4be4a93e078a0d497d21ea0c1d7.jpg",
  spandek:
    "https://i.pinimg.com/1200x/72/02/e4/7202e46941b002bee24646d277285647.jpg",
  "metal roof":
    "https://i.pinimg.com/1200x/9d/f2/a9/9df2a948b79033cfd32a752ab4a1df68.jpg",
  onduvila:
    "https://i.pinimg.com/736x/0e/3b/9f/0e3b9f3d44e1e6c6419a7ab70312416f.jpg",
  "genteng keramik":
    "https://i.pinimg.com/1200x/ba/b9/48/bab94840dadadb256f5c0710b70a1d2e.jpg", // Glazed roof tile

  // --- 7. PLAFON ---
  triplek:
    "https://i.pinimg.com/736x/a1/e3/8d/a1e38d8ea40e41068a91a6ac20f228f6.jpg",
  grc: "https://i.pinimg.com/736x/e9/a8/6e/e9a86edf27552248d9ccc6472c2d2684.jpg",
  gipsum:
    "https://i.pinimg.com/1200x/4b/9a/44/4b9a44607f4515f51614fdaed826bf87.jpg",
  pvc: "https://i.pinimg.com/736x/92/96/c8/9296c86d377b10f250b8c5025b1d0ff9.jpg",

  // --- 8. PINTU & JENDELA ---
  meranti:
    "https://i.pinimg.com/1200x/d1/b6/ff/d1b6ff5d319a89a9cd92271ef3ecb8f2.jpg",
  aluminium:
    "https://i.pinimg.com/736x/63/43/6c/63436c49d74ef79c5424a234c1e197bb.jpg",
  jati: "https://i.pinimg.com/1200x/2e/9e/6c/2e9e6c466617329f6403f34cc923ca3c.jpg",

  // --- 9. DAYA LISTRIK ---
  watt: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400",

  // --- 10. PAGAR ---
  "tanpa pagar":
    "https://i.pinimg.com/736x/7b/ee/81/7bee81cd4df579dbd273203452f26915.jpg", // Open space
  "hollow hitam":
    "https://i.pinimg.com/1200x/14/8c/96/148c96a21a331944baee3af9642d8854.jpg",
  "hollow galvanis":
    "https://i.pinimg.com/1200x/db/a0/9a/dba09ad8fd4131b9d8352b97711da251.jpg", // Silverish
  stainless:
    "https://i.pinimg.com/736x/03/ed/c4/03edc4cb52e905548ed205b2a894ec4b.jpg", // Shiny

  // Default
  default:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
};

// --- LOGIKA PENCARIAN GAMBAR ---
const getMaterialImage = (name: string) => {
  if (!name) return MATERIAL_IMAGES["default"];

  const lowerName = name.toLowerCase();

  // Sort key berdasarkan panjang agar yang lebih spesifik dicek duluan
  // Contoh: "Genteng Keramik" (panjang 15) dicek sebelum "Genteng" (panjang 7)
  const keys = Object.keys(MATERIAL_IMAGES).sort((a, b) => b.length - a.length);

  const foundKey = keys.find((key) => lowerName.includes(key));

  return foundKey ? MATERIAL_IMAGES[foundKey] : MATERIAL_IMAGES["default"];
};

const CATEGORY_INFO: Record<string, string> = {
  "ukuran rumah":
    "Luas bangunan dasar. Tipe 30/60 = Bangunan 30m², Tanah 60m².",
  pondasi: "Struktur bawah penahan beban bangunan.",
  dinding: "Material utama penyekat ruangan.",
  lantai: "Penutup permukaan lantai ruangan.",
  "kaso & reng": "Konstruksi rangka atap.",
  genteng: "Penutup atap pelindung panas & hujan.",
  plafon: "Langit-langit interior.",
  "pintu & jendela": "Bahan kusen dan daun pintu/jendela.",
  "daya listrik": "Kapasitas daya PLN (Token/Pascabayar).",
  pagar: "Pengaman area depan rumah.",
};

// --- TYPES & STEPS ---
type Step = "SPECS" | "PAYMENT" | "DATA" | "CONFIRM" | "SUCCESS";
const STEPS_ORDER: Step[] = ["SPECS", "PAYMENT", "DATA", "CONFIRM", "SUCCESS"];

export default function HouseCustomizer() {
  const { categories, selectedSpecs, totalPrice, loading, handleSelect } =
    useHouseCalculator();
  const supabase = createClient();

  // State Navigation & Form
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT">("CASH");
  const [dpRaw, setDpRaw] = useState<string>("");
  const [tenor, setTenor] = useState<string>("12");
  const [customerData, setCustomerData] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  const currentStep = STEPS_ORDER[currentStepIndex];

  // Logic Hitung Kredit
  const dpAmount = Number(dpRaw) || 0;
  const calculateCredit = useMemo(() => {
    const pokokHutang = Math.max(0, totalPrice - dpAmount);
    const bungaPerTahun = 0.12;
    const tenorTahun = parseInt(tenor) / 12;
    const totalBunga = pokokHutang * bungaPerTahun * tenorTahun;
    const totalKewajiban = pokokHutang + totalBunga;
    const angsuranPerBulan = totalKewajiban / parseInt(tenor);
    return { pokokHutang, angsuranPerBulan, totalBunga, totalKewajiban };
  }, [totalPrice, dpAmount, tenor]);

  const toIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  // Navigation Handlers
  const nextStep = () => {
    if (currentStepIndex < STEPS_ORDER.length - 1) {
      setDirection("next");
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setDirection("prev");
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canProceed = () => {
    if (currentStep === "PAYMENT") {
      if (paymentMethod === "CREDIT" && dpAmount >= totalPrice) return false;
    }
    if (currentStep === "DATA") {
      if (!customerData.name || !customerData.contact || !customerData.address)
        return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      customer_name: customerData.name,
      customer_contact: customerData.contact,
      customer_address: customerData.address,
      selected_specs: selectedSpecs,
      total_price: totalPrice,
      payment_method: paymentMethod,
      dp_amount: paymentMethod === "CREDIT" ? dpAmount : 0,
      tenor_months: paymentMethod === "CREDIT" ? parseInt(tenor) : 0,
      monthly_installment:
        paymentMethod === "CREDIT" ? calculateCredit.angsuranPerBulan : 0,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      toast.error(`Gagal: ${error.message}`);
      setSubmitting(false);
    } else {
      setOrderId(data.id);
      nextStep();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Sticky */}
      <header className="bg-background/80 backdrop-blur border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
            <div className="font-bold text-lg text-primary">
              Trias Customizer
            </div>
            <ModeToggle />
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10" />
            {["Spesifikasi", "Metode Bayar", "Data Diri", "Konfirmasi"].map(
              (label, idx) => {
                const isActive = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 bg-background px-2"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-muted",
                        isCurrent && "ring-4 ring-primary/20"
                      )}
                    >
                      {isActive ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-semibold tracking-wider hidden sm:block",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh] overflow-x-hidden relative">
        <div
          key={currentStep}
          className={cn(
            "animate-in duration-500 fill-mode-forwards",
            direction === "next"
              ? "slide-in-from-right-10 fade-in-0"
              : "slide-in-from-left-10 fade-in-0"
          )}
        >
          {/* STEP 1: SPESIFIKASI */}
          {currentStep === "SPECS" && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Pilih Spesifikasi Rumah</h2>
                <p className="text-muted-foreground">
                  Sesuaikan setiap bagian rumah dengan keinginan dan budget
                  Anda.
                </p>
              </div>

              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="border-muted/60 shadow-sm overflow-hidden"
                >
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {CATEGORY_INFO[category.name.toLowerCase()] ||
                                "Pilih opsi terbaik."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {category.materials.map((mat) => {
                      const isSelected =
                        selectedSpecs[category.id]?.id === mat.id;
                      return (
                        <div
                          key={mat.id}
                          onClick={() =>
                            handleSelect(category.id, mat.id.toString())
                          }
                          className={cn(
                            "group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden relative",
                            isSelected
                              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                              : "border-muted hover:border-primary/50"
                          )}
                        >
                          <div className="aspect-video relative bg-muted">
                            <Image
                              src={getMaterialImage(mat.name)}
                              alt={mat.name}
                              fill
                              className={cn(
                                "object-cover transition-transform duration-500",
                                isSelected
                                  ? "scale-105"
                                  : "group-hover:scale-110"
                              )}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-sm">
                            <p className="font-semibold leading-tight mb-1">
                              {mat.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {mat.price > 0
                                ? `+${(mat.price / 1000000).toFixed(1)}jt`
                                : "Standar"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 2: METODE PEMBAYARAN */}
          {currentStep === "PAYMENT" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Metode Pembayaran</h2>
                <p className="text-muted-foreground">
                  Pilih skema pembayaran yang paling nyaman.
                </p>
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(v: any) => setPaymentMethod(v)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Label
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-all gap-4",
                    paymentMethod === "CASH"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  )}
                >
                  <RadioGroupItem value="CASH" className="sr-only" />
                  <div className="p-3 bg-green-100 text-green-700 rounded-full">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">Cash Keras</span>
                    <span className="text-xs text-muted-foreground">
                      Lunas langsung, tanpa bunga.
                    </span>
                  </div>
                </Label>
                <Label
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-all gap-4",
                    paymentMethod === "CREDIT"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  )}
                >
                  <RadioGroupItem value="CREDIT" className="sr-only" />
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">
                      Kredit (KPR)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Cicilan ringan, Bunga Flat 12%.
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              {paymentMethod === "CREDIT" && (
                <Card className="animate-in fade-in zoom-in-95 border-primary/20 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4" /> Simulasi Kredit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Uang Muka (DP)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          value={dpRaw}
                          onChange={(e) =>
                            setDpRaw(e.target.value.replace(/\D/g, ""))
                          }
                          className="pl-8"
                          placeholder="Contoh: 50000000"
                        />
                      </div>
                      {dpAmount >= totalPrice && (
                        <p className="text-xs text-red-500">
                          DP tidak boleh melebihi harga rumah.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Tenor (Lama Angsuran)</Label>
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
                    <div className="bg-background/80 p-4 rounded-lg border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pokok Hutang</span>
                        <span>{toIDR(calculateCredit.pokokHutang)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Bunga (Flat 12%)</span>
                        <span className="text-red-500">
                          +{toIDR(calculateCredit.totalBunga)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Angsuran / Bulan</span>
                        <span className="text-primary">
                          {toIDR(calculateCredit.angsuranPerBulan)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* STEP 3: DATA DIRI */}
          {currentStep === "DATA" && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Data Pemesan</h2>
                <p className="text-muted-foreground">
                  Lengkapi data diri untuk validasi pesanan (SPK).
                </p>
              </div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Nama sesuai KTP"
                        value={customerData.name}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kontak (WhatsApp/HP)</Label>
                    <Input
                      type="tel"
                      placeholder="0812xxxx"
                      value={customerData.contact}
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
                      placeholder="Alamat lengkap saat ini"
                      value={customerData.address}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4: KONFIRMASI */}
          {currentStep === "CONFIRM" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Konfirmasi Akhir</h2>
                <p className="text-muted-foreground">
                  Pastikan semua data sudah benar sebelum mengirim pesanan.
                </p>
              </div>
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Ringkasan Spesifikasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {Object.values(selectedSpecs).map((s: any) => (
                      <div
                        key={s.id}
                        className="flex justify-between border-b border-dashed last:border-0 py-2"
                      >
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-mono">
                          {s.price > 0 ? toIDR(s.price) : "Termasuk"}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 text-base">
                      <span>Total Harga Bangunan</span>
                      <span>{toIDR(totalPrice)}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Rencana Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded text-primary">
                        {paymentMethod === "CASH" ? <CreditCard /> : <Home />}
                      </div>
                      <div>
                        <p className="font-bold">
                          {paymentMethod === "CASH"
                            ? "Cash Keras"
                            : `Kredit ${tenor} Bulan`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {paymentMethod === "CASH"
                            ? "Pembayaran lunas bertahap sesuai progres."
                            : `DP: ${toIDR(dpAmount)} | Cicilan: ${toIDR(
                                calculateCredit.angsuranPerBulan
                              )}/bln`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Penerima Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Nama
                      </span>
                      <span className="font-medium">{customerData.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Kontak
                      </span>
                      <span className="font-medium">
                        {customerData.contact}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground block">
                        Alamat
                      </span>
                      <span className="font-medium">
                        {customerData.address}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* STEP 5: SUKSES */}
          {currentStep === "SUCCESS" && (
            <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full" />
                <FileCheck className="w-24 h-24 text-green-600 relative z-10" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h2 className="text-4xl font-extrabold tracking-tight text-green-700">
                  Pesanan Berhasil!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Terima kasih <strong>{customerData.name}</strong>. Data
                  pesanan Anda telah tersimpan di sistem kami dengan aman.
                </p>
              </div>
              <Card className="w-full max-w-md border-dashed border-2 shadow-none bg-muted/30">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      ID Pesanan
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-base px-3 py-1 bg-background"
                    >
                      {orderId}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="text-left space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Langkah Selanjutnya:
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-3 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                          1
                        </div>
                        <span>
                          Admin Marketing kami akan menghubungi Anda via
                          WhatsApp dalam 1x24 jam.
                        </span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                          2
                        </div>
                        <span>
                          Jadwal survei lokasi fisik dan konsultasi detail
                          material.
                        </span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                          3
                        </div>
                        <span>
                          Penandatanganan SPK & Pembayaran Booking Fee.
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-4">
                <Link href="/">
                  <Button variant="outline">Kembali ke Beranda</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Nav */}
      {currentStep !== "SUCCESS" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t z-40">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">
                Estimasi Harga
              </p>
              <p className="text-xl font-bold text-primary">
                {toIDR(totalPrice)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className={cn(
                  currentStepIndex === 0 && "opacity-0 pointer-events-none"
                )}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Kembali
              </Button>
              {currentStep === "CONFIRM" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="min-w-35"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="mr-2 w-4 h-4" />
                  )}{" "}
                  Kirim Pesanan
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="min-w-35"
                >
                  Lanjut <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
