import Image from "next/image";
import Link from "next/link";

type NavProps = {
  active: "home" | "gallery";
};

export function Nav({ active }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#080706]/78 px-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" aria-label="الرئيسية" className="group flex min-w-0 items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--gold)]/25 bg-white/[0.04] shadow-lg shadow-black/25 transition group-hover:border-[color:var(--gold)]/45">
            <Image
              src="/brand-logo.jpeg"
              alt="Majed Almasmoum logo"
              fill
              className="object-cover"
              sizes="44px"
            />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-xl text-[var(--foreground)] sm:text-2xl">
              Majed Almasmoum
            </span>
            <span className="block truncate text-[10px] uppercase tracking-[0.22em] text-[var(--subtle)] sm:text-[11px]">
              3D Print Studio
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <Link
            href="/"
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              active === "home"
                ? "bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] font-semibold text-black shadow-lg shadow-black/25"
                : "text-white/55 hover:bg-white/8 hover:text-white"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/gallery"
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              active === "gallery"
                ? "bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] font-semibold text-black shadow-lg shadow-black/25"
                : "text-white/55 hover:bg-white/8 hover:text-white"
            }`}
          >
            الأعمال
          </Link>
        </div>
      </div>
    </nav>
  );
}
