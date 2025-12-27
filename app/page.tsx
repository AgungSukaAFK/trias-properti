import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowRight, Home, ShieldCheck, PenTool } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar - Container aligned */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Home className="w-6 h-6" />
            <span>Trias Properti</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/customizer">
              <Button>
                Mulai Pesan <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center space-y-6 max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Bangun Rumah Impian <br className="hidden md:inline" />
            <span className="text-primary">Sesuai Keinginan Anda</span>
          </h1>
          {/* FIX: Ganti max-w-[700px] jadi max-w-2xl */}
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Kami tidak menjual rumah siap huni biasa. Di PT. Trias Serang
            Properti, Anda adalah arsiteknya. Tentukan spesifikasi, hitung
            budget, dan wujudkan sekarang.
          </p>
          <div className="flex gap-4">
            <Link href="/customizer">
              <Button size="lg" className="h-12 px-8 text-lg">
                Custom Rumah Sekarang
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 max-w-5xl">
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Full Custom</h3>
              <p className="text-muted-foreground">
                Pilih sendiri pondasi, lantai, hingga jenis genteng sesuai
                selera dan budget.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Transparan</h3>
              <p className="text-muted-foreground">
                Harga material update real-time. Tidak ada biaya tersembunyi.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Cicilan Fleksibel</h3>
              <p className="text-muted-foreground">
                Tersedia opsi Cash Keras atau KPR dengan simulasi bunga flat
                yang jelas.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} PT. Trias Serang Properti. All rights
        reserved.
      </footer>
    </div>
  );
}
