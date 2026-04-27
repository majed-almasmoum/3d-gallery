import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Majed Almasmoum · 3D Printing Portfolio",
  description: "معرض أعمال ماجد المسموم للطباعة ثلاثية الأبعاد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
