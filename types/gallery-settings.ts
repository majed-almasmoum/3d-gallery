export type GalleryStatCardKey = "works" | "materials" | "colored";

export type GallerySettings = {
  statsCompact: boolean;
  hiddenStatCards: GalleryStatCardKey[];
};
