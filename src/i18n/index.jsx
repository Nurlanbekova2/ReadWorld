import { createContext, useContext, useEffect, useState } from "react";
import en from "./en";
import ru from "./ru";
import ky from "./ky";

const translations = { en, ru, ky };
const supportedLanguages = Object.keys(translations);

function getInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem("lang");
    return supportedLanguages.includes(savedLanguage) ? savedLanguage : "ru";
  } catch (error) {
    console.warn("Could not read the saved language preference:", error);
    return "ru";
  }
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    getInitialLanguage
  );

  function changeLang(l) {
    if (!supportedLanguages.includes(l)) {
      throw new Error(`Unsupported language: ${l}`);
    }
    setLang(l);
    try {
      localStorage.setItem("lang", l);
    } catch (error) {
      console.warn("Could not save the language preference:", error);
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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