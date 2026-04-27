import Image from "next/image";
import Link from "next/link";

type NavProps = {
  active: "home" | "gallery";
};

export function Nav({ active }: NavProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b10]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="الرئيسية"
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-10 sm:w-10">
            <Image
              src="/logo.PNG"
              alt="Majed 3D Printing"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="hidden text-sm font-bold text-white sm:inline">
            Majed · 3D Printing
          </span>
        </Link>

        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
          <Link
            href="/"
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              active === "home"
                ? "bg-gradient-to-l from-[#fb923c] to-[#f59e0b] text-black shadow-lg shadow-[#fb923c]/15"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/gallery"
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              active === "gallery"
                ? "bg-gradient-to-l from-[#fb923c] to-[#f59e0b] text-black shadow-lg shadow-[#fb923c]/15"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            الأعمال
          </Link>
        </div>
      </div>
    </nav>
  );
}
