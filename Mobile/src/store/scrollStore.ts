import { create } from 'zustand';

interface ScrollStore {
  positions: Record<string, number>;
  setScrollPosition: (id: string, y: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  positions: {},
  setScrollPosition: (id, y) => set((state) => {
    // Skip no-op writes so subscribers aren't notified for sub-4px jitter
    const prev = state.positions[id];
    if (prev !== undefined && Math.abs(prev - y) <= 4) return state;
    return { positions: { ...state.positions, [id]: y } };
  }),
}));
