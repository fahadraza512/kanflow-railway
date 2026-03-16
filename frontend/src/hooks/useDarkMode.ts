import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      const darkMode = stored === "true";
      setIsDark(darkMode);
      updateTheme(darkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      updateTheme(prefersDark);
    }
  }, []);

  const updateTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("darkMode", String(newValue));
    updateTheme(newValue);
  };

  const setDarkMode = (dark: boolean) => {
    setIsDark(dark);
    localStorage.setItem("darkMode", String(dark));
    updateTheme(dark);
  };

  return {
    isDark,
    toggle,
    setDarkMode,
  };
}
