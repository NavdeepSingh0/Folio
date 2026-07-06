import { create } from 'zustand';

interface ScrollStore {
  positions: Record<string, number>;
  setScrollPosition: (id: string, y: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  positions: {},
  setScrollPosition: (id, y) => set((state) => ({ positions: { ...state.positions, [id]: y } })),
}));
