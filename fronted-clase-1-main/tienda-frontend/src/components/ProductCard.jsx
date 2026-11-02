import React, { useState } from 'react';
import { urlImagen } from '../utils/imagenes';

export default function ProductCard({ 
  producto, 
  onSelectProduct, 
  onAddToCart,
  user,
  onOpenUploadModal 
}) {
  const [isAddedAnim, setIsAddedAnim] = useState(false);

  if (!producto) return null;

  const {
    nombre,
    precio,
    precio_final,
    precio_anterior,
    subtitulo,
    categoria,
    badge,
    rating,
    reviews_count,
    cuotas_cantidad = 3,
    cuotas_valor,
    porciones
  } = producto;

  const imagenSrc = urlImagen(producto);
  const precioMostrar = precio_final ?? precio ?? 0;
  const cuotaEstimada = cuotas_valor || (precioMostrar / (cuotas_cantidad || 3)).toFixed(0);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAddedAnim(true);
    if (onAddToCart) {
      onAddToCart(producto, 1);
    }
    setTimeout(() => {
      setIsAddedAnim(false);
    }, 1200);
  };

  return (
    <div 
      onClick={() => onSelectProduct && onSelectProduct(producto)}
      className="group bg-white rounded-3xl overflow-hidden border border-amber-900/10 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* === IMAGEN CON ASPECT-SQUARE Y MARCADOR DE POSICIÓN (Parte 4) === */}
      <div className="relative w-full aspect-square overflow-hidden bg-amber-50">
        {imagenSrc ? (
          <img
            src={imagenSrc}
            alt={nombre}
            loading="lazy"
            width="400"
            height="400"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100/70 via-stone-100 to-amber-200/50 text-amber-900/60 p-4 text-center select-none">
            <span className="text-5xl mb-2 drop-shadow-xs">🍮</span>
            <span className="text-xs font-bold text-amber-950/70 tracking-wide uppercase">Sin imagen</span>
            <span className="text-[10px] text-stone-500 mt-0.5">Marcador de posición</span>
          </div>
        )}

        {/* Gradiente sutil inferior para legibilidad si hay imagen */}
        {imagenSrc && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity"></div>
        )}

        {/* Badges superiores */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {badge ? (
            <span className="bg-amber-950/90 text-amber-200 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-amber-500/30">
              {badge}
            </span>
          ) : (
            <span className="bg-amber-950/80 text-amber-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {categoria || 'Flan Artesanal'}
            </span>
          )}

          {(!user?.es_admin || !onOpenUploadModal) && rating && (
            <span className="bg-white/95 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="text-amber-500">★</span>
              <span>{rating}</span>
              {reviews_count && (
                <span className="text-stone-400 font-normal text-[10px]">({reviews_count})</span>
              )}
            </span>
          )}
        </div>

        {/* Botón rápido para subir/cambiar foto (visible para admin o si se pasa handler) */}
        {onOpenUploadModal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenUploadModal(producto);
            }}
            className="absolute top-3.5 right-3.5 z-10 bg-amber-900/90 hover:bg-amber-950 text-amber-200 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-amber-400/40 shadow-md cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
            title="Subir o cambiar foto de este producto"
          >
            <span>📷</span>
            <span className="text-[10px]">Foto</span>
          </button>
        )}

        {/* Etiqueta de porciones inferior sobre la foto */}
        {porciones && (
          <div className="absolute bottom-3 left-3.5">
            <span className="bg-black/60 text-stone-200 text-[11px] font-medium px-2.5 py-0.5 rounded-md backdrop-blur-xs">
              🍽️ {porciones.split('(')[0]}
            </span>
          </div>
        )}
      </div>

      {/* === CONTENIDO DE LA TARJETA === */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Categoría pill */}
          <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold block mb-1">
            {categoria || 'Tradicional'}
          </span>

          {/* Nombre */}
          <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug">
            {nombre}
          </h3>

          {/* Subtítulo / Descripción corta */}
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {subtitulo || producto.descripcion_corta || 'Delicioso flan tradicional bañado en caramelo artesanal punto toffee.'}
          </p>
        </div>

        {/* Bloque de Precio y Financiación */}
        <div className="pt-3 border-t border-amber-900/5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-black text-amber-950">
                  ${precioMostrar.toLocaleString('es-AR')}
                </span>
                {precio_anterior && (
                  <span className="text-xs text-stone-400 line-through">
                    ${precio_anterior.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                💳 {cuotas_cantidad} cuotas sin interés de ${Math.round(cuotaEstimada).toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          {/* Botones de acción: Ver Detalle y Agregar al Carrito */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onSelectProduct && onSelectProduct(producto)}
              className="px-3 py-2.5 rounded-xl border border-amber-900/20 hover:bg-amber-50 text-amber-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver Ficha</span>
              <svg className="w-3.5 h-3.5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleAddToCart}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                isAddedAnim
                  ? 'bg-emerald-700 text-white scale-95'
                  : 'bg-amber-900 hover:bg-amber-950 text-amber-50 hover:shadow-md'
              }`}
            >
              {isAddedAnim ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>¡Listo!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}