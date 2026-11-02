import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * ActualizacionDisponible — aviso cuando el Service Worker detecta una versión
 * nueva del sitio (registerType: "prompt"). El usuario decide cuándo recargar,
 * así no se pierde un carrito o un formulario a medio completar.
 */
export default function ActualizacionDisponible() {
  const {
    needRefresh: [hayNueva, setHayNueva],
    updateServiceWorker,
  } = useRegisterSW();

  if (!hayNueva) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-amber-950/95 text-amber-50 p-4 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md flex items-center justify-between gap-4 animate-fadeIn"
    >
      <p className="text-sm font-medium">
        <span aria-hidden="true">🍮 </span>Hay una versión nueva de la tienda.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          id="btn-sw-actualizar"
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Actualizar
        </button>
        <button
          id="btn-sw-mas-tarde"
          type="button"
          onClick={() => setHayNueva(false)}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}
