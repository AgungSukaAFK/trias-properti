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
  Info,
  HelpCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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

// --- KONFIGURASI GAMBAR & INFO ---
// 1. Gambar Material (Fallback cerdas berdasarkan kata kunci)
const MATERIAL_IMAGES: Record<string, string> = {
  // Struktur & Dasar
  ukuran:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400&h=300", // House Plan
  pondasi:
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400&h=300", // Foundation
  "batu kali":
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&q=80&w=400&h=300",
  "cakar ayam":
    "https://images.unsplash.com/photo-1628744876497-eb30460be9f6?auto=format&fit=crop&q=80&w=400&h=300", // Reinforced concrete

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
    "https://images.unsplash.com/photo-1594904297322-2621096c4d79?auto=format&fit=crop&q=80&w=400&h=300", // Ceiling
  gypsum:
    "https://images.unsplash.com/photo-1581093583449-ed2521361957?auto=format&fit=crop&q=80&w=400&h=300",
  pvc: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=400&h=300",

  // Lainnya
  pintu:
    "https://images.unsplash.com/photo-1617104424032-b9bd6972d0e4?auto=format&fit=crop&q=80&w=400&h=300",
  jendela:
    "https://images.unsplash.com/photo-1506300481232-a16df162947c?auto=format&fit=crop&q=80&w=400&h=300",
  listrik:
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400&h=300", // Electrical
  watt: "https://images.unsplash.com/photo-1555662704-36a531e285d8?auto=format&fit=crop&q=80&w=400&h=300",
  pagar:
    "https://images.unsplash.com/photo-1623192067750-70f44e339189?auto=format&fit=crop&q=80&w=400&h=300", // Fence
  hollow:
    "https://images.unsplash.com/photo-1605117882932-f9e32b03ef3c?auto=format&fit=crop&q=80&w=400&h=300",

  // Default Fallback
  default:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400&h=300", // Construction
};

// 2. Tooltip Info (Penjelasan Teknis)
const CATEGORY_INFO: Record<string, string> = {
  "ukuran rumah":
    "Luas bangunan dasar (Tipe). Tipe 30/60 berarti luas bangunan 30m² dan luas tanah 60m².",
  pondasi:
    "Struktur bagian bawah bangunan yang menahan beban. Cakar ayam disarankan untuk rencana 2 lantai.",
  dinding:
    "Material penyekat ruangan. Bata merah paling kokoh & sejuk, Hebel paling cepat pengerjaannya.",
  lantai:
    "Penutup permukaan bawah. Granit lebih tahan gores & mewah dibanding keramik biasa.",
  "kaso & reng":
    "Rangka atap. Baja ringan lebih awet dan anti rayap dibanding kayu.",
  genteng:
    "Penutup atap. Metal roof lebih ringan, Genteng keramik lebih meredam panas.",
  plafon:
    "Langit-langit ruangan. PVC tahan air & rayap, Gypsum memberikan finish yang rapi.",
  "pintu & jendela":
    "Material kusen dan daun pintu. Aluminium awet & modern, Jati memberikan kesan klasik mewah.",
  "daya listrik":
    "Kapasitas daya PLN. 1300 Watt standar rumah tangga modern dengan AC.",
  pagar:
    "Pengaman area depan rumah. Hollow Galvanis lebih tahan karat dibanding besi hitam biasa.",
};

const getMaterialImage = (name: string, categoryName: string) => {
  const searchTerms = `${categoryName} ${name}`.toLowerCase();
  const key = Object.keys(MATERIAL_IMAGES).find((k) => searchTerms.includes(k));
  return key ? MATERIAL_IMAGES[key] : MATERIAL_IMAGES["default"];
};

const getCategoryTooltip = (categoryName: string) => {
  const key = Object.keys(CATEGORY_INFO).find((k) =>
    categoryName.toLowerCase().includes(k)
  );
  return key ? CATEGORY_INFO[key] : "Pilih spesifikasi sesuai kebutuhan Anda.";
};

export default function HouseCustomizer() {
  const { categories, selectedSpecs, totalPrice, loading, handleSelect } =
    useHouseCalculator();
  const supabase = createClient();

  // State Flow
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [step, setStep] = useState(1);

  // State Pembayaran
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

  const toIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleDpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setDpRaw(rawVal);
  };

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

  const handleSubmit = async () => {
    if (!customerData.name || !customerData.contact) {
      toast.error("Mohon lengkapi Nama dan Kontak Anda.");
      return;
    }
    if (paymentMethod === "CREDIT" && dpAmount >= totalPrice) {
      toast.warning("DP tidak boleh melebihi harga rumah.");
      return;
    }

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
      setStep(4);
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Sedang memuat data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-5xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg hidden md:block">
              Studio Custom Rumah
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              Step 1: Spesifikasi
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                Estimasi
              </p>
              <p className="font-bold text-lg text-primary leading-none">
                {toIDR(totalPrice)}
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {category.name}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                    >
                      <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-slate-900 text-white border-none shadow-xl">
                    <p className="text-sm leading-relaxed">
                      {getCategoryTooltip(category.name)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* TAMPILAN GRID GAMBAR (UNTUK SEMUA KATEGORI) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.materials.map((mat) => {
                const isSelected = selectedSpecs[category.id]?.id === mat.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => handleSelect(category.id, mat.id.toString())}
                    className={cn(
                      "cursor-pointer group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-muted/50 bg-card hover:border-primary/50"
                    )}
                  >
                    {/* Image Container */}
                    <div className="aspect-4/3 w-full overflow-hidden bg-muted relative">
                      <Image
                        src={getMaterialImage(mat.name, category.name)}
                        alt={mat.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-500 group-hover:scale-110",
                          isSelected ? "scale-105" : ""
                        )}
                      />
                      {/* Overlay Gradient for Text readability if needed */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md animate-in zoom-in spin-in-90 duration-300">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-sm md:text-base leading-tight">
                          {mat.name}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-dashed border-muted-foreground/20 flex justify-between items-center">
                        <Badge
                          variant={mat.price > 0 ? "secondary" : "outline"}
                          className="text-[10px] font-normal px-1.5 h-5"
                        >
                          {mat.price > 0 ? "Upgrade" : "Standar"}
                        </Badge>
                        <span className="text-xs font-mono font-medium text-muted-foreground">
                          {mat.price > 0
                            ? `+${(mat.price / 1000000).toFixed(1)}jt`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-30">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center max-w-5xl gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 hidden sm:flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Estimasi
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Harga estimasi konstruksi bangunan, belum termasuk lahan
                        jika terpisah.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {toIDR(totalPrice)}
                </p>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl font-bold"
            onClick={() => {
              setStep(1);
              setIsConfirmOpen(true);
            }}
          >
            Lanjut Pembayaran <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* DIALOG WIZARD */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl">
          {/* STEP 1: REVIEW */}
          {step === 1 && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl">
                  Review Spesifikasi
                </DialogTitle>
                <DialogDescription>
                  Cek kembali detail pesanan custom Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-6 pt-2">
                <div className="rounded-xl border bg-muted/30 divide-y divide-dashed">
                  {Object.values(selectedSpecs).map((spec: any, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted hidden sm:block shadow-sm">
                          <Image
                            src={getMaterialImage(spec.name, "")}
                            alt={spec.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="font-medium text-sm text-foreground">
                          {spec.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs sm:text-sm text-muted-foreground">
                        {spec.price > 0 ? toIDR(spec.price) : "Termasuk"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-end mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Harga Akhir
                  </span>
                  <span className="text-primary text-2xl font-bold">
                    {toIDR(totalPrice)}
                  </span>
                </div>
              </div>
              <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
                <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
                  Batal
                </Button>
                <Button onClick={() => setStep(2)}>Konfirmasi & Lanjut</Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 2: METODE BAYAR */}
          {step === 2 && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Metode Pembayaran</DialogTitle>
                <DialogDescription>
                  Pilih skema yang paling nyaman untuk Anda.
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 pt-2 space-y-6">
                <RadioGroup
                  defaultValue="CASH"
                  onValueChange={(v: any) => setPaymentMethod(v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div
                    className={`relative flex flex-col items-center justify-center space-y-2 border-2 p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-all h-32 ${
                      paymentMethod === "CASH"
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/20"
                    }`}
                    onClick={() => setPaymentMethod("CASH")}
                  >
                    <RadioGroupItem
                      value="CASH"
                      id="cash"
                      className="sr-only"
                    />
                    <span className="font-bold text-lg">Cash Keras</span>
                    <span className="text-xs text-center text-muted-foreground px-2">
                      Lunas langsung tanpa bunga
                    </span>
                  </div>
                  <div
                    className={`relative flex flex-col items-center justify-center space-y-2 border-2 p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-all h-32 ${
                      paymentMethod === "CREDIT"
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/20"
                    }`}
                    onClick={() => setPaymentMethod("CREDIT")}
                  >
                    <RadioGroupItem
                      value="CREDIT"
                      id="credit"
                      className="sr-only"
                    />
                    <span className="font-bold text-lg">Kredit (KPR)</span>
                    <span className="text-xs text-center text-muted-foreground px-2">
                      Cicilan ringan Bunga Flat 12%
                    </span>
                  </div>
                </RadioGroup>

                {paymentMethod === "CREDIT" && (
                  <div className="bg-muted/30 p-5 rounded-xl space-y-5 border animate-in fade-in slide-in-from-top-4">
                    {/* Input DP */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Uang Muka (DP)</Label>
                        <span className="text-xs text-muted-foreground font-mono">
                          Min. Rp 0
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground font-bold">
                          Rp
                        </span>
                        <Input
                          type="text"
                          placeholder="0"
                          value={toIDR(dpAmount).replace("Rp", "").trim()}
                          onChange={handleDpChange}
                          className="pl-10 h-12 font-bold text-lg"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground p-2 rounded bg-background border border-dashed">
                        <span>Sisa Pokok Hutang:</span>
                        <span className="font-bold text-foreground">
                          {toIDR(calculateCredit.pokokHutang)}
                        </span>
                      </div>
                    </div>

                    {/* Input Tenor */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base">
                          Tenor (Jangka Waktu)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Semakin lama tenor, cicilan semakin kecil, namun
                                total bunga semakin besar.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={tenor} onValueChange={setTenor}>
                        <SelectTrigger className="h-12 bg-background">
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

                    {/* Ringkasan Kredit */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-xl border border-blue-100 dark:border-blue-900 mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          Angsuran per Bulan
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Menggunakan sistem Bunga Flat (Tetap).</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </p>
                      </div>
                      <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
                        {toIDR(calculateCredit.angsuranPerBulan)}
                      </p>
                      <Separator className="my-3 bg-blue-200 dark:bg-blue-800" />
                      <div className="flex justify-between text-xs text-blue-800 dark:text-blue-300">
                        <span>Total Bunga ({tenor} bln):</span>
                        <span className="font-mono">
                          {toIDR(calculateCredit.totalBunga)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-blue-800 dark:text-blue-300 mt-1">
                        <span>Total Bayar Akhir:</span>
                        <span className="font-mono font-bold">
                          {toIDR(calculateCredit.totalKewajiban)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Kembali
                </Button>
                <Button onClick={() => setStep(3)}>Lanjut Isi Data</Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: DATA DIRI */}
          {step === 3 && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6">
                <DialogTitle>Data Pemesan</DialogTitle>
                <DialogDescription>
                  Lengkapi data untuk penerbitan SPK resmi.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0 space-y-5">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    className="h-11"
                    placeholder="Contoh: Budi Santoso"
                    value={customerData.name}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. WhatsApp / HP</Label>
                  <Input
                    className="h-11"
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
                    className="h-11"
                    placeholder="Kota Serang, Banten"
                    value={customerData.address}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="p-6 border-t bg-muted/10">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto min-w-37.5"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Kirim Pesanan
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 4: SUCCESS PAGE */}
          {step === 4 && (
            <div className="p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold text-green-700">
                  Pesanan Diterima!
                </DialogTitle>
                <DialogDescription className="max-w-sm mx-auto text-base">
                  Terima kasih <strong>{customerData.name}</strong>, konfigurasi
                  rumah impian Anda telah tersimpan.
                </DialogDescription>
              </div>

              <div className="bg-muted/50 p-6 rounded-2xl w-full border border-dashed border-muted-foreground/30 text-left space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-muted-foreground/20">
                  <span className="text-sm text-muted-foreground">
                    Order ID
                  </span>
                  <span className="font-mono font-bold bg-background px-2 py-1 rounded border">
                    {orderId}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Langkah Selanjutnya:
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        1
                      </span>
                      Admin kami akan menghubungi via WhatsApp.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        2
                      </span>
                      Jadwal survei lokasi & konsultasi final.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        3
                      </span>
                      Proses administrasi & pembangunan dimulai.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 w-full justify-center pt-2">
                <Button variant="outline" className="flex-1" disabled>
                  <Download className="w-4 h-4 mr-2" /> Unduh PDF
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">Selesai</Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
