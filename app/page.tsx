import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  ArrowRight,
  Home,
  ShieldCheck,
  PenTool,
  Search,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar - Sticky & Glassmorphism */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <span>Trias Properti</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Nav for Check Order */}
            <Link href="/cek-pesanan" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                Cek Status
              </Button>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <ModeToggle />
            <Link href="/customizer">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Mulai Pesan <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-20 pb-32 flex flex-col items-center text-center space-y-8 max-w-5xl">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl leading-tight">
              Bangun Rumah Impian <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">
                Sesuai Keinginan Anda
              </span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
              Di PT. Trias Serang Properti, Anda adalah arsiteknya. Tentukan
              spesifikasi material, hitung budget real-time, dan pantau progres
              pembangunan dalam satu aplikasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/customizer">
              <Button
                size="lg"
                className="h-12 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                Custom Rumah Sekarang
              </Button>
            </Link>
            <Link href="/cek-pesanan">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-lg w-full sm:w-auto"
              >
                <Search className="mr-2 w-5 h-5" />
                Lacak Pesanan
              </Button>
            </Link>
          </div>

          {/* Hero Image - Modern Look */}
          <div className="w-full mt-10 relative group perspective-1000">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border bg-muted shadow-2xl">
              {/* UPDATED IMAGE URL */}
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
                alt="Modern House Design"
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur border p-4 rounded-xl shadow-lg hidden md:block animate-in slide-in-from-bottom-10 fade-in duration-1000">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Terpercaya & Legal</p>
                    <p className="text-xs text-muted-foreground">
                      SHM & IMB Terjamin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-24 border-t relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full" />
          </div>

          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Kenapa Memilih Trias?
              </h2>
              <p className="text-muted-foreground">
                Solusi perumahan modern dengan transparansi penuh.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-background shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <PenTool className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Full Customization</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bebas pilih material dari pondasi hingga atap. Sesuaikan spek
                  dengan budget yang Anda miliki secara real-time.
                </p>
              </div>

              <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-background shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Transparansi Harga</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tidak ada biaya tersembunyi. Semua rincian harga material dan
                  jasa ditampilkan terbuka di awal pemesanan.
                </p>
              </div>

              <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-background shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Home className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Cicilan Syariah & KPR</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mendukung pembayaran Cash Keras, Cash Bertahap, maupun KPR
                  Bank dengan simulasi angsuran yang jelas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">
              PT. Trias Serang Properti
            </span>
          </div>

          <div className="flex gap-6">
            <Link
              href="/cek-pesanan"
              className="hover:text-primary transition-colors"
            >
              Cek Pesanan
            </Link>
            <Link
              href="/customizer"
              className="hover:text-primary transition-colors"
            >
              Custom Rumah
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
            <Link
              href="/admin"
              className="opacity-50 hover:opacity-100 flex items-center gap-1 hover:text-primary transition-all"
            >
              <LayoutDashboard className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
