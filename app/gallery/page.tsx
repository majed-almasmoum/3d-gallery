import { getLocalWorks } from "@/lib/works";
import { GalleryClient } from "./gallery-client";

export const metadata = {
  title: "معرض الأعمال · Majed 3D Portfolio",
};

export default async function GalleryPage() {
  const initialWorks = await getLocalWorks();

  return <GalleryClient initialWorks={initialWorks} />;
}
