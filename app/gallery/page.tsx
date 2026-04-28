import { getGallerySettings } from "@/lib/gallery-settings";
import { getLocalWorks } from "@/lib/works";
import { GalleryClient } from "./gallery-client";

export const metadata = {
  title: "معرض الأعمال · Majed 3D Portfolio",
};

export default async function GalleryPage() {
  const initialWorks = await getLocalWorks();
  const initialSettings = await getGallerySettings();

  return <GalleryClient initialWorks={initialWorks} initialSettings={initialSettings} />;
}
