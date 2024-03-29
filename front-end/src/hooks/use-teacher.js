// import { create } from "zustand";

// export const useTeacherStore = create((set) => ({
//   teacherid: null,
//   set: (newId) => set({ teacherid: newId }),
// }));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTeacherStore = create(
  persist(
    (set) => ({
      teacherid: null,
      setTeacherId: (newId) => set({ teacherid: newId }),
    }),
    {
      name: "teacher-store", // Key for local storage
    }
  )
);
