"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHouseCalculator } from "@/hooks/useHouseCalculator";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
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
  Download,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

// --- KONFIGURASI GAMBAR & INFO (Sama seperti sebelumnya) ---
const MATERIAL_IMAGES: Record<string, string> = {
  // Struktur & Dasar
  ukuran:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400&h=300",
  pondasi:
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400&h=300",
  "batu kali":
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&q=80&w=400&h=300",
  "cakar ayam":
    "https://images.unsplash.com/photo-1628744876497-eb30460be9f6?auto=format&fit=crop&q=80&w=400&h=300",
  // Dinding
  "bata merah":
    "https://images.unsplash.com/photo-1599818826721-b01625902047?auto=format&fit=crop&q=80&w=400&h=300",
  hebel:
    "https://images.unsplash.com/photo-1590082725838-b715764cb237?auto=format&fit=crop&q=80&w=400&h=300",
  batako:
    "https://images.unsplash.com/photo-1518399778368-23b9d79905d8?auto=format&fit=crop&q=80&w=400&h=300",
  // Lantai
  granit:
    "https://images.unsplash.com/photo-1616423664033-68d716298642?auto=format&fit=crop&q=80&w=400&h=300",
  keramik:
    "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=400&h=300",
  marmer:
    "https://images.unsplash.com/photo-1618221639257-2e2d0943f760?auto=format&fit=crop&q=80&w=400&h=300",
  "batu alam":
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=400&h=300",
  // Atap & Plafon
  genteng:
    "https://images.unsplash.com/photo-1632759972844-4e924d557022?auto=format&fit=crop&q=80&w=400&h=300",
  spandek:
    "https://images.unsplash.com/photo-1629813200788-b220311029c9?auto=format&fit=crop&q=80&w=400&h=300",
  metal:
    "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400&h=300",
  plafon:
    "https://images.unsplash.com/photo-1594904297322-2621096c4d79?auto=format&fit=crop&q=80&w=400&h=300",
  gypsum:
    "https://images.unsplash.com/photo-1581093583449-ed2521361957?auto=format&fit=crop&q=80&w=400&h=300",
  pvc: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=400&h=300",
  // Lainnya
  pintu:
    "https://images.unsplash.com/photo-1617104424032-b9bd6972d0e4?auto=format&fit=crop&q=80&w=400&h=300",
  jendela:
    "https://images.unsplash.com/photo-1506300481232-a16df162947c?auto=format&fit=crop&q=80&w=400&h=300",
  listrik:
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400&h=300",
  watt: "https://images.unsplash.com/photo-1555662704-36a531e285d8?auto=format&fit=crop&q=80&w=400&h=300",
  pagar:
    "https://images.unsplash.com/photo-1623192067750-70f44e339189?auto=format&fit=crop&q=80&w=400&h=300",
  hollow:
    "https://images.unsplash.com/photo-1605117882932-f9e32b03ef3c?auto=format&fit=crop&q=80&w=400&h=300",
  default:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400&h=300",
};

const CATEGORY_INFO: Record<string, string> = {
  "ukuran rumah":
    "Luas bangunan dasar (Tipe). Tipe 30/60 berarti luas bangunan 30m² dan luas tanah 60m².",
  pondasi: "Struktur bagian bawah bangunan yang menahan beban.",
  dinding: "Material penyekat ruangan.",
  lantai: "Penutup permukaan bawah.",
  "kaso & reng": "Rangka atap baja ringan atau kayu.",
  genteng: "Penutup atap.",
  plafon: "Langit-langit ruangan.",
  "pintu & jendela": "Material kusen dan daun pintu.",
  "daya listrik": "Kapasitas daya PLN.",
  pagar: "Pengaman area depan rumah.",
};

const getMaterialImage = (name: string, categoryName: string) => {
  const searchTerms = `${categoryName} ${name}`.toLowerCase();
  const key = Object.keys(MATERIAL_IMAGES).find((k) => searchTerms.includes(k));
  return key ? MATERIAL_IMAGES[key] : MATERIAL_IMAGES["default"];
};

// --- TYPES & STEPS ---
type Step = "SPECS" | "PAYMENT" | "DATA" | "CONFIRM" | "SUCCESS";
const STEPS_ORDER: Step[] = ["SPECS", "PAYMENT", "DATA", "CONFIRM", "SUCCESS"];

export default function HouseCustomizer() {
  const { categories, selectedSpecs, totalPrice, loading, handleSelect } =
    useHouseCalculator();
  const supabase = createClient();

  // State Navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next"); // Untuk arah animasi

  // State Pembayaran
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT">("CASH");
  const [dpRaw, setDpRaw] = useState<string>("");
  const [tenor, setTenor] = useState<string>("12");

  // State Data Diri
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

  // Validasi Step
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
    // Submit ke database
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
      nextStep(); // Ke halaman SUCCESS
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

          {/* Progress Bar Steps */}
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

      {/* Main Content dengan Animasi Slide */}
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
                              src={getMaterialImage(mat.name, category.name)}
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
                {/* 1. Review Spesifikasi Singkat */}
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

                {/* 2. Review Pembayaran */}
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

                {/* 3. Data Diri */}
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

          {/* STEP 5: SUKSES (INFORMATIF) */}
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

      {/* Footer Navigation (Floating) */}
      {currentStep !== "SUCCESS" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t z-40">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Total Price Indicator */}
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">
                  Estimasi Harga
                </p>
                <p className="text-xl font-bold text-primary">
                  {toIDR(totalPrice)}
                </p>
              </div>
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
                  )}
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
