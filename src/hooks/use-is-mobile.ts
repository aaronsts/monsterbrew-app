import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}
