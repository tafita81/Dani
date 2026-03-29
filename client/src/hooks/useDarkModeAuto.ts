import { useState, useEffect } from "react";

export function useDarkModeAuto() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    // Verificar preferência salva
    const saved = localStorage.getItem("darkMode");
    const savedAuto = localStorage.getItem("darkModeAuto");

    if (saved !== null) {
      setIsDarkMode(saved === "true");
    }
    if (savedAuto !== null) {
      setIsAutoMode(savedAuto === "true");
    }

    // Se modo automático ativado, verificar hora
    if (savedAuto === "true" || savedAuto === null) {
      updateDarkModeByTime();
      // Atualizar a cada minuto
      const interval = setInterval(updateDarkModeByTime, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  const updateDarkModeByTime = () => {
    const hour = new Date().getHours();
    // Modo noturno entre 18:00 (18) e 06:00 (6)
    const shouldBeDark = hour >= 18 || hour < 6;
    setIsDarkMode(shouldBeDark);
    applyDarkMode(shouldBeDark);
  };

  const applyDarkMode = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#ffffff";
    } else {
      html.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
  };

  const toggleDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    setIsAutoMode(false);
    localStorage.setItem("darkMode", String(dark));
    localStorage.setItem("darkModeAuto", "false");
    applyDarkMode(dark);
  };

  const toggleAutoMode = (auto: boolean) => {
    setIsAutoMode(auto);
    localStorage.setItem("darkModeAuto", String(auto));
    if (auto) {
      updateDarkModeByTime();
    }
  };

  return {
    isDarkMode,
    isAutoMode,
    toggleDarkMode,
    toggleAutoMode,
    updateDarkModeByTime,
  };
}
