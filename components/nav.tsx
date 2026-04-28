import Image from "next/image";
import Link from "next/link";

type NavProps = {
  active: "home" | "gallery";
};

export function Nav({ active }: NavProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-[#2A2724] bg-[#0A0A0A]/88 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4">

        {/* Logo + brand */}
        <Link
          href="/"
          aria-label="الرئيسية"
          className="flex items-center gap-3 transition hover:opacity-80"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden border border-[#2A2724] bg-[#141414]">
            <Image
              src="/logo.PNG"
              alt="Majed Almasmoum"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="hidden flex-col sm:flex">
            <span
              className="font-serif text-xl italic leading-none text-[#B22222]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              M
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F5F0E8]">
              MAJED ALMASMOUM
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-[11px] font-medium uppercase tracking-[0.14em] transition ${
              active === "home"
                ? "border-b border-[#9A7A4A] pb-0.5 text-[#F5F0E8]"
                : "text-[#A09A90] hover:text-[#F5F0E8]"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/gallery"
            className={`text-[11px] font-medium uppercase tracking-[0.14em] transition ${
              active === "gallery"
                ? "border-b border-[#9A7A4A] pb-0.5 text-[#F5F0E8]"
                : "text-[#A09A90] hover:text-[#F5F0E8]"
            }`}
          >
            الأعمال
          </Link>
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/966568866602"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 bg-[#8C1A1A] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#F5F0E8] transition hover:bg-[#B22222] sm:inline-flex"
        >
          تواصل
        </a>
      </div>
    </nav>
  );
}
