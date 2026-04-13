import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed: number = 30, enabled: boolean = true): string {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const prevTextRef = useRef(text);
  const indexRef = useRef(0);

  useEffect(() => {
    // If text changed, restart animation
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      indexRef.current = 0;
      if (enabled) {
        setDisplayed("");
      } else {
        setDisplayed(text);
        return;
      }
    }

    if (!enabled || indexRef.current >= text.length) return;

    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return displayed;
}
