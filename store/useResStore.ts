import { create } from "zustand";

interface ResponseStore {
  data: any | null;
  setData: (data: any) => void;
  headers: any | null;
  setHeaders: (headers: any) => void;
  cookies: any | null;
  setCookies: (cookies: any) => void;
  status: number;
  setStatus: (status: number) => void;
}

export const useResStore = create<ResponseStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),

  headers: null,
  setHeaders: (headers) => set({ headers }),

  cookies: null,
  setCookies: (cookies) => set({ cookies }),

  status: 0,
  setStatus: (status) => set({ status }),
}));
