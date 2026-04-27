export type ColorMethod = "none" | "printed" | "painted";

export type Work = {
  id: number | string;
  name: string;
  material: string;
  printHours: string;
  colorMethod: ColorMethod;
  description: string;
  images: string[];
  addedAt: string;
};

export type WorkDraft = Omit<Work, "id" | "addedAt">;
