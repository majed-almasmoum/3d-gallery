import Image from "next/image";
import Link from "next/link";

type NavProps = {
  active: "home" | "gallery";
  adminMode?: boolean;
};

export function Nav({ active, adminMode = false }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#15151d]/95 px-5 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" aria-label="الرئيسية" className="flex items-center">
          <Image
            src="/logo.PNG"
            alt="Majed 3D Printing"
            width={128}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {adminMode ? (
            <span className="hidden rounded-full border border-[#fb923c]/35 bg-[#fb923c]/10 px-3 py-1 text-xs font-semibold text-[#fb923c] sm:inline">
              وضع الإدارة
            </span>
          ) : null}
          <Link
            href="/"
            className={`rounded-lg px-4 py-2 text-sm transition ${
              active === "home"
                ? "border border-[#fb923c]/30 bg-[#fb923c]/10 text-[#fb923c]"
                : "text-white/55 hover:bg-white/10 hover:text-white"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/gallery"
            className={`rounded-lg px-4 py-2 text-sm transition ${
              active === "gallery"
                ? "border border-[#fb923c]/30 bg-[#fb923c]/10 text-[#fb923c]"
                : "text-white/55 hover:bg-white/10 hover:text-white"
            }`}
          >
            الأعمال
          </Link>
        </div>
      </div>
    </nav>
  );
}
