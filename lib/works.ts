import fs from "node:fs/promises";
import path from "node:path";
import type { ColorMethod, Work } from "@/types/work";

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp)$/i;
const projectRoot = process.cwd();

function asColorMethod(value: unknown): ColorMethod {
  return value === "printed" || value === "painted" ? value : "none";
}

function normalizeImagePath(imagePath: string) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/images/")) return imagePath;
  if (imagePath.startsWith("/")) return `/images${imagePath}`;
  return `/images/${imagePath}`;
}

function normalizeWork(raw: Partial<Work>, index: number): Work {
  return {
    id: raw.id ?? `local-${index}`,
    name: raw.name || "عمل مطبوع",
    material: raw.material || "PLA",
    printHours: raw.printHours || "—",
    colorMethod: asColorMethod(raw.colorMethod),
    description: raw.description || "",
    images: Array.isArray(raw.images)
      ? raw.images.map(normalizeImagePath).filter(Boolean)
      : [],
    addedAt: raw.addedAt || "",
  };
}

async function readSeedWorks() {
  try {
    const file = await fs.readFile(
      path.join(projectRoot, "data", "works.json"),
      "utf8",
    );
    return JSON.parse(file) as Partial<Work>[];
  } catch {
    return [];
  }
}

async function readImageWorks(savedWorks: Work[]) {
  try {
    const imageDir = path.join(projectRoot, "public", "images");
    const files = await fs.readdir(imageDir);
    const savedPaths = new Set(savedWorks.flatMap((work) => work.images));

    return files
      .filter((file) => IMAGE_EXT.test(file))
      .map((file, index) =>
        normalizeWork(
          {
            id: `image-${index}`,
            name: "عمل مطبوع",
            material: "PLA",
            printHours: "—",
            colorMethod: "none",
            description: "",
            images: [`/images/${file}`],
          },
          index,
        ),
      )
      .filter((work) => !savedPaths.has(work.images[0]));
  } catch {
    return [];
  }
}

async function localImageExists(imagePath: string) {
  if (/^https?:\/\//i.test(imagePath)) return true;
  if (!imagePath.startsWith("/images/")) return false;

  try {
    await fs.access(path.join(projectRoot, "public", imagePath));
    return true;
  } catch {
    return false;
  }
}

export async function getLocalWorks(): Promise<Work[]> {
  const rawSavedWorks = (await readSeedWorks()).map(normalizeWork);
  const savedWorks = (
    await Promise.all(
      rawSavedWorks.map(async (work) => ({
        ...work,
        images: (
          await Promise.all(
            work.images.map(async (imagePath) => ({
              imagePath,
              exists: await localImageExists(imagePath),
            })),
          )
        )
          .filter((image) => image.exists)
          .map((image) => image.imagePath),
      })),
    )
  ).filter((work) => work.images.length > 0);
  const imageWorks = await readImageWorks(savedWorks);

  return [...savedWorks, ...imageWorks];
}
