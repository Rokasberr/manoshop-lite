import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationEffects = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      return true;
    };

    if (scrollToTarget()) return undefined;

    const retryTimers = [50, 200, 500].map((delay) => window.setTimeout(scrollToTarget, delay));
    return () => retryTimers.forEach((timer) => window.clearTimeout(timer));
  }, [hash, pathname]);

  return null;
};

export default NavigationEffects;
