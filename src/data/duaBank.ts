import hisnulCategories from './hisnulMuslimAll.json';

export interface DuaItem {
  id: string;
  categoryId: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  virtue?: string;
  repeatCount?: number;
  procedure?: string;
}

export interface DuaCategory {
  id: number;
  bnNumber: string;
  name: string;
  count: number;
  duas: DuaItem[];
}

export const DUA_CATEGORIES: DuaCategory[] = (hisnulCategories as DuaCategory[]).map((cat, idx) => ({
  ...cat,
  count: cat.duas.length,
  duas: cat.duas.map(dua => ({
    ...dua,
    categoryId: dua.categoryId || (idx + 1)
  }))
}));
