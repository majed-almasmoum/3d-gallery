import Image from "next/image";
import Link from "next/link";

type NavProps = {
  active: "home" | "gallery";
};

export function Nav({ active }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-black/72 px-5 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6">
        <Link href="/" aria-label="الرئيسية" className="group flex min-w-0 items-center gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--gold)]/25 bg-white/[0.04] shadow-lg shadow-black/30 transition group-hover:border-[color:var(--gold)]/45">
            <Image
              src="/brand-logo.jpeg"
              alt="Majed Almasmoum logo"
              fill
              className="object-cover"
              sizes="44px"
            />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-[1.75rem] tracking-[0.02em] text-[var(--foreground)]">
              Majed Almasmoum
            </span>
            <span className="block truncate text-[10px] uppercase tracking-[0.28em] text-[var(--subtle)]">
              3D Print Studio
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] text-white/55">
            <Link
              href="/gallery"
              className={`${active === "gallery" ? "border-b border-[color:var(--gold)] pb-1 text-[color:var(--gold)]" : "hover:text-white"}`}
            >
              Gallery
            </Link>
            <Link
              href="/"
              className={`${active === "home" ? "border-b border-[color:var(--gold)] pb-1 text-[color:var(--gold)]" : "hover:text-white"}`}
            >
              Studio
            </Link>
          </div>

          <Link
            href="/gallery"
            className="inline-flex h-11 items-center rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-strong))] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_20px_rgba(212,175,55,0.22)] transition hover:opacity-90"
          >
            Commission
          </Link>
        </div>
      </div>
    </nav>
  );
}
