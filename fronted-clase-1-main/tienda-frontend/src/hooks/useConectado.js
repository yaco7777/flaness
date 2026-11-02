import { useState, useEffect } from "react";

/**
 * useConectado — devuelve true/false según el navegador tenga conexión.
 * Escucha los eventos "online" / "offline" de window y se limpia al desmontar.
 */
export function useConectado() {
  const [conectado, setConectado] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const si = () => setConectado(true);
    const no = () => setConectado(false);
    window.addEventListener("online", si);
    window.addEventListener("offline", no);
    return () => {
      window.removeEventListener("online", si);
      window.removeEventListener("offline", no);
    };
  }, []);

  return conectado;
}

export default useConectado;
