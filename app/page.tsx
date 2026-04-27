import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Camera,
  Images,
  Mail,
  MessageCircle,
  Music2,
} from "lucide-react";
import { Nav } from "@/components/nav";

const stats = [
  {
    value: "2022",
    label: "بدأت الطباعة ثلاثية الأبعاد كهواية وتطورت لشغف",
  },
  {
    value: "4",
    label: "طابعات مختلفة لأفضل جودة حسب نوع العمل",
  },
  {
    value: "PLA",
    label: "المادة الأساسية للطباعة مع تجارب متعددة",
  },
];

const printers = [
  {
    name: "Anycubic Kobra 3",
    desc: "للطباعة المتوسطة بتفاصيل واضحة وجودة ثابتة",
  },
  {
    name: "Anycubic Kobra 3 Max",
    desc: "للأعمال كبيرة الحجم التي تحتاج مساحة طباعة أوسع",
  },
  {
    name: "Bambu Lab A1",
    desc: "للطباعة السريعة مع الحفاظ على دقة عالية في التفاصيل",
  },
  {
    name: "Creality K1 Max",
    desc: "للأعمال التجريبية واختبار إعدادات مختلفة",
  },
];

const socials = [
  {
    name: "واتساب",
    handle: "تواصل مباشر",
    href: "https://wa.me/966568866602",
    Icon: MessageCircle,
  },
  {
    name: "انستقرام",
    handle: "@majed.almasmoum",
    href: "https://www.instagram.com/majed.almasmoum",
    Icon: Camera,
  },
  {
    name: "تيكتوك",
    handle: "@majed.almasmoum",
    href: "https://www.tiktok.com/@majed.almasmoum",
    Icon: Music2,
  },
  {
    name: "البريد",
    handle: "majed.almasmoum.m",
    href: "mailto:majed.almasmoum.m@gmail.com",
    Icon: Mail,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f13] text-[#f0ece4]">
      <Nav active="home" />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1fr_auto] md:py-20">
        <div className="text-center md:text-right">
          <p className="mb-5 inline-flex rounded-full border border-[#fb923c]/35 bg-[#fb923c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#fb923c]">
            3D Printing · PLA · FDM
          </p>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
            3D Printed
            <br />
            <span className="text-[#fb923c]">Models</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55 md:mx-0">
            شغفي هو تحويل النماذج الرقمية إلى مجسمات واقعية بتفاصيل دقيقة
            وجودة عالية، سواء كانت للعرض أو الاستخدام اليومي.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/gallery"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-l from-[#fb923c] to-[#f59e0b] px-6 text-sm font-bold text-black transition hover:opacity-90"
            >
              <Images size={18} />
              معرض الأعمال
            </Link>
            <a
              href="https://wa.me/966568866602"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <MessageCircle size={18} />
              تواصل معي
            </a>
          </div>
        </div>

        <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#161620] shadow-2xl shadow-black/30 sm:h-60 sm:w-60">
          <Image
            src="/logo.PNG"
            alt="3D Portfolio Logo"
            width={320}
            height={320}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-14 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="rounded-lg border border-white/10 bg-[#161620] p-6 transition hover:border-[#fb923c]/35"
          >
            <div className="mb-2 text-2xl font-black text-[#fb923c]">
              {stat.value}
            </div>
            <p className="text-sm leading-7 text-white/45">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <p className="mb-6 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
          الطابعات المستخدمة
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {printers.map((printer) => (
            <article
              key={printer.name}
              className="rounded-lg border border-white/10 bg-[#161620] p-5 transition hover:-translate-y-1 hover:border-[#fb923c]/35"
            >
              <h2 className="mb-2 text-base font-bold text-white">
                {printer.name}
              </h2>
              <p className="text-sm leading-7 text-white/45">{printer.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <p className="mb-6 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
          نبذة عني
        </p>
        <div className="rounded-lg border border-white/10 bg-[#161620] p-7">
          <p className="text-sm leading-8 text-white/60">
            بدأت في مجال الطباعة ثلاثية الأبعاد عام 2022 كهواية بسيطة، وتحولت
            مع الوقت إلى شغف أستمتع فيه بتجربة إعدادات مختلفة وتطوير جودة عملي
            في كل مشروع جديد.
          </p>
          <p className="mt-4 text-sm leading-8 text-white/60">
            أهتم بالتفاصيل وتشطيب المجسمات واختيار الإعدادات المناسبة لكل عمل،
            سواء كان شخصية، قطعة ديكور، أو جزء عملي للاستخدام اليومي. أحرص أن
            تطلع النتيجة جاهزة للعرض أو للاستخدام مباشرة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <p className="mb-6 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
          التواصل
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {socials.map(({ Icon, href, name, handle }) => (
            <a
              key={name}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex items-center gap-4 rounded-lg border border-white/10 bg-[#161620] p-5 transition hover:-translate-y-1 hover:border-[#fb923c]/40"
            >
              <Icon className="h-6 w-6 shrink-0 text-[#fb923c]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">{name}</span>
                <span className="block truncate text-xs text-white/40">
                  {handle}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 text-white/25 transition group-hover:text-[#fb923c]" />
            </a>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs text-white/30">
        © 2026 Majed Almasmoum · 3D Printing Portfolio
      </footer>
    </main>
  );
}
