import { createContext, useContext, useState } from "react";
import en from "./en";
import ru from "./ru";
import ky from "./ky";

const translations = { en, ru, ky };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("lang") || "ru"
  );

  function changeLang(l) {
    setLang(l);
    localStorage.setItem("lang", l);
  }

  const t = translations[lang] || translations.ru;

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}