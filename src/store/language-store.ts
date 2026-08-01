import { create } from "zustand";


interface LanguageStore {

  language: "en" | "hi";

  setLanguage:(lang:"en"|"hi")=>void;

}


export const useLanguageStore =
create<LanguageStore>((set)=>({

language:"hi",

setLanguage:(lang)=>
set({
language:lang
})

}));