export type GalleryStatCardKey = "works" | "materials" | "colored";

export type GallerySettings = {
  statsCompact: boolean;
  statsLayout: "row" | "stack";
  hiddenStatCards: GalleryStatCardKey[];
};
