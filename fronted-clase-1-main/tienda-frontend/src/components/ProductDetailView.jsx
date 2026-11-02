import React, { useState } from 'react';
import { urlImagen } from '../utils/imagenes';

export default function ProductDetailView({ 
  producto, 
  onBackToCatalog, 
  onAddToCart,
  onBuyNow,
  allProducts = [],
  onSelectOtherProduct,
  user,
  onOpenUploadModal
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [selectedCuotaPlan, setSelectedCuotaPlan] = useState('3-sin-interes');
  const [dedicatoria, setDedicatoria] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!producto) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4">🍮</span>
        <h2 className="font-serif text-2xl font-bold text-amber-950 mb-2">No se ha seleccionado ningún flan</h2>
        <p className="text-stone-500 text-sm mb-6">Por favor regresa al catálogo para elegir tu postre favorito.</p>
        <button
          onClick={onBackToCatalog}
          className="bg-amber-900 text-white font-bold text-sm px-6 py-3 rounded-2xl hover:bg-amber-800 transition-all cursor-pointer shadow-md"
        >
          ← Explorar el Catálogo
        </button>
      </div>
    );
  }

  const {
    nombre,
    precio,
    precio_final,
    precio_anterior,
    subtitulo,
    categoria,
    badge,
    rating = 4.9,
    reviews_count = 85,
    porciones = "6 - 8 porciones (1.2 kg)",
    tiempo_elaboracion = "4 horas de cocción lenta a baño María",
    garantia_texto,
    cuotas_cantidad = 3,
    cuotas_valor,
    imagen,
    imagenes_galeria = [imagen],
    descripcion_corta,
    descripcion_larga,
    ingredientes = [],
    maridaje_sugerido,
    stock_disponible = 10
  } = producto;

  const cuotasCant = cuotas_cantidad || 3;
  const cuotasVal = cuotas_valor ? Math.round(cuotas_valor) : Math.round(precioFinalCalculado / cuotasCant);
  const precioFinalCalculado = precio_final ?? precio ?? 0;
  const ahorro = precio_anterior ? precio_anterior - precioFinalCalculado : 0;
  const galeria = imagenes_galeria && imagenes_galeria.length > 0 ? imagenes_galeria : [imagen];

  const handleIncrement = () => {
    if (cantidad < stock_disponible) setCantidad(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    if (onAddToCart) {
      onAddToCart(producto, cantidad, dedicatoria);
    }
    setTimeout(() => {
      setIsAdding(false);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }, 400);
  };

  const handleBuyNow = () => {
    if (onAddToCart) {
      onAddToCart(producto, cantidad, dedicatoria);
    }
    if (onBuyNow) {
      onBuyNow();
    }
  };

  // Productos relacionados
  const relatedProducts = allProducts
    .filter(p => (p.id !== producto.id && p.nombre !== producto.nombre))
    .slice(0, 3);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      
      {/* === BREADCRUMB Y BOTÓN VOLVER === */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-900/10">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al Catálogo</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onBackToCatalog} className="hover:text-amber-900">Inicio</button>
          <span>/</span>
          <button onClick={onBackToCatalog} className="hover:text-amber-900">Catálogo</button>
          <span>/</span>
          <span className="text-amber-950 font-bold truncate max-w-xs">{nombre}</span>
        </div>
      </div>

      {/* === GRID PRINCIPAL DE LA FICHA DE PRODUCTO === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        
        {/* === COLUMNA IZQUIERDA: GALERÍA DE FOTOS (5 COLUMNAS) === */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Foto Principal con Badges y Marcador de Posición */}
          <div className="relative rounded-3xl overflow-hidden bg-amber-50 border border-amber-900/10 shadow-lg aspect-4/3 sm:aspect-square flex items-center justify-center">
            {urlImagen(producto) || galeria[selectedImage] || imagen ? (
              <img
                src={urlImagen(producto) || galeria[selectedImage] || imagen}
                alt={nombre}
                width="600"
                height="600"
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100/70 via-stone-100 to-amber-200/50 text-amber-900/60 p-8 text-center select-none">
                <span className="text-7xl mb-3 drop-shadow-xs">🍮</span>
                <span className="text-sm font-bold text-amber-950/70 tracking-wide uppercase">Sin imagen oficial</span>
                <span className="text-xs text-stone-500 mt-1">Marcador de posición</span>
              </div>
            )}
            
            {/* Badges Flotantes */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {badge && (
                <span className="bg-amber-950/95 text-amber-200 text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-md border border-amber-500/30">
                  {badge}
                </span>
              )}
              <span className="bg-emerald-800/90 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
                ✓ En Stock para Despacho Hoy
              </span>
            </div>

            {/* Botón de Subida / Cambio de Foto para Admin */}
            {onOpenUploadModal && (
              <button
                onClick={() => onOpenUploadModal(producto)}
                className="absolute top-4 right-4 bg-amber-900/90 hover:bg-amber-950 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg border border-amber-400/40 backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
                title="Subir o cambiar foto del producto"
              >
                <span>📷</span>
                <span>Subir Foto</span>
              </button>
            )}

            {/* Badge de porciones */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-xl backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                <span>🍽️</span>
                <span>{porciones}</span>
              </span>
            </div>
          </div>

          {/* Miniaturas de la Galería */}
          {galeria.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galeria.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImage === idx 
                      ? 'border-amber-900 scale-105 shadow-md ring-2 ring-amber-400/40' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`${nombre} vista ${idx+1}`} width="80" height="80" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Ficha técnica rápida */}
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-900/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Tiempo de horneado</span>
              <p className="font-semibold text-stone-800">{tiempo_elaboracion}</p>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Categoría</span>
              <p className="font-semibold text-amber-900">{categoria || 'Tradicional'}</p>
            </div>
          </div>

        </div>

        {/* === COLUMNA DERECHA: DETALLES, PRECIOS, CUOTAS, GARANTÍA Y COMPRA (6-7 COLUMNAS) === */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Encabezado del Producto */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md">
                {categoria || 'Flan Tradicional'}
              </span>

              <div className="flex items-center gap-1 text-xs font-bold text-stone-700">
                <span className="text-amber-500 text-sm">★</span>
                <span>{rating}</span>
                <span className="text-stone-400 font-normal">({reviews_count} opiniones verificadas)</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              {nombre}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed font-light">
              {subtitulo || descripcion_corta}
            </p>
          </div>

          {/* === BLOQUE DE PRECIO DESTACADO === */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-5 rounded-3xl border border-amber-200/80 shadow-inner space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900/80 uppercase tracking-wide block">Precio Final al Público</span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-serif text-3xl sm:text-4xl font-black text-amber-950">
                    ${precioFinalCalculado.toLocaleString('es-AR')}
                  </span>
                  {precio_anterior && (
                    <span className="text-sm sm:text-base text-stone-400 line-through">
                      ${precio_anterior.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>

              {ahorro > 0 && (
                <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Ahorrás ${ahorro.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* === OPCIONES DE CUOTAS (Requerimiento clave) === */}
            <div className="pt-3 border-t border-amber-900/10 space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                💳 Opciones de Financiación y Pago:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Opción 1: 3 Cuotas sin Interés */}
                <div 
                  onClick={() => setSelectedCuotaPlan('3-sin-interes')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCuotaPlan === '3-sin-interes'
                      ? 'bg-white border-amber-800 shadow-sm ring-2 ring-amber-600/30'
                      : 'bg-white/60 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">{cuotasCant} Cuotas Sin Interés</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">0% TNA</span>
                  </div>
                  <p className="font-serif font-black text-base text-amber-900 mt-1">
                    {cuotasCant}x ${cuotasVal.toLocaleString('es-AR')}
                  </p>
                  <span className="text-[11px] text-stone-500">Con Visa, Mastercard y Amex</span>
                </div>

                {/* Opción 2: 6 Cuotas */}
                <div 
                  onClick={() => setSelectedCuotaPlan('6-fijas')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCuotaPlan === '6-fijas'
                      ? 'bg-white border-amber-800 shadow-sm ring-2 ring-amber-600/30'
                      : 'bg-white/60 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">6 Cuotas Fijas</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">Bancos Amigos</span>
                  </div>
                  <p className="font-serif font-black text-base text-stone-900 mt-1">
                    6x ${(precioFinalCalculado / 5.5).toFixed(0).toLocaleString('es-AR')}
                  </p>
                  <span className="text-[11px] text-stone-500">Válido para todas las tarjetas</span>
                </div>

              </div>

              {/* Transferencia con descuento */}
              <div className="bg-amber-100/60 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-950">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span>⚡</span>
                  <span>10% OFF pagando con Transferencia / Débito:</span>
                </span>
                <span className="font-bold text-amber-900">
                  ${(precioFinalCalculado * 0.9).toFixed(0).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* === SECCIÓN DE GARANTÍA DE CALIDAD (Requerimiento clave) === */}
          <div className="bg-white rounded-3xl p-5 border border-amber-900/15 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 text-xl font-bold shrink-0">
                🛡️
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-amber-950">
                  Garantía Oficial de Calidad & Frescura
                </h3>
                <p className="text-xs text-stone-500">
                  Elaboración artesanal bajo los más altos estándares gastronómicos.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3.5 text-xs text-stone-700 space-y-2 border border-stone-100">
              <p className="font-medium text-amber-950">
                {garantia_texto || "Garantía de Frescura 100%: Cada flan se elabora bajo pedido exclusivamente el mismo día de tu entrega con ingredientes de tambo y huevos de granja."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">✔</span> Sin conservantes artificiales
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">✔</span> Cadena de frío asegurada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">✔</span> Apto refrigeración por 5 días
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600">✔</span> Devolución total si no te fascina
                </span>
              </div>
            </div>
          </div>

          {/* === CONTROLES DE COMPRA Y SELECTOR DE CANTIDAD === */}
          <div className="space-y-4 bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm">
            
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-stone-700 block">Cantidad a encargar:</span>
                <span className="text-[11px] text-emerald-700 font-medium">({stock_disponible} unidades disponibles hoy)</span>
              </div>

              {/* Selector + / - */}
              <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200">
                <button
                  onClick={handleDecrement}
                  disabled={cantidad <= 1}
                  className="w-9 h-9 rounded-xl bg-white text-stone-700 font-black text-sm flex items-center justify-center hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer shadow-xs"
                >
                  -
                </button>
                <span className="w-12 text-center font-serif font-black text-stone-900 text-base">
                  {cantidad}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={cantidad >= stock_disponible}
                  className="w-9 h-9 rounded-xl bg-white text-stone-700 font-black text-sm flex items-center justify-center hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Dedicatoria o mensaje opcional */}
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">
                💌 Mensaje para dedicatoria o instrucciones de entrega (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: 'Feliz cumple mamá' o 'Entregar con caramelo extra'"
                value={dedicatoria}
                onChange={(e) => setDedicatoria(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
              />
            </div>

            {/* BOTONES PRINCIPALES DE ACCIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Botón AGREGAR AL CARRITO (Requerimiento clave) */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  addedSuccess
                    ? 'bg-emerald-700 text-white scale-98 ring-4 ring-emerald-200'
                    : 'bg-amber-900 hover:bg-amber-950 text-white hover:shadow-lg active:scale-98'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Agregar al Carrito ({cantidad})</span>
                  </>
                )}
              </button>

              {/* Botón COMPRAR AHORA */}
              <button
                onClick={handleBuyNow}
                className="w-full py-4 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <span>⚡ Comprar Ahora</span>
              </button>

            </div>

            <p className="text-[11px] text-center text-stone-500 font-medium">
              ✨ Podés simular y completar tu compra en 1 clic sin necesidad de registrarte ni iniciar sesión.
            </p>

            {/* Total estimado */}
            <div className="text-center text-xs text-stone-500 pt-1">
              Subtotal por {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}:{' '}
              <strong className="text-amber-950 font-bold">${(precioFinalCalculado * cantidad).toLocaleString('es-AR')}</strong>
            </div>

          </div>

        </div>

      </div>

      {/* === DESCRIPCIÓN DETALLADA E INGREDIENTES === */}
      <div className="mt-14 bg-white rounded-3xl p-6 sm:p-10 border border-amber-900/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-2xl font-bold text-amber-950">
            La Historia & Elaboración de este Flan
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
            {descripcion_larga || descripcion_corta}
          </p>
          {maridaje_sugerido && (
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950">
              <strong>🍷 Maridaje Recomendado:</strong> {maridaje_sugerido}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-200">
          <h4 className="font-serif font-bold text-lg text-amber-950 flex items-center gap-2">
            <span>🌿</span> Ingredientes 100% Puros
          </h4>
          <ul className="space-y-2 text-xs text-stone-700">
            {ingredientes.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">✦</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* === PRODUCTOS RELACIONADOS / SUGERIDOS === */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold text-amber-950">
              Otras Obras Maestras para Deleitarte
            </h3>
            <button
              onClick={onBackToCatalog}
              className="text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer"
            >
              Ver todo el catálogo →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <div
                key={rel.id || rel.nombre}
                onClick={() => onSelectOtherProduct && onSelectOtherProduct(rel)}
                className="bg-white rounded-2xl overflow-hidden border border-amber-900/10 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="h-40 overflow-hidden relative bg-amber-50">
                  <img src={rel.imagen} alt={rel.nombre} width="300" height="160" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {rel.categoria}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
                    {rel.nombre}
                  </h4>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-serif font-bold text-amber-950 text-base">
                      ${(rel.precio_final || rel.precio).toLocaleString('es-AR')}
                    </span>
                    <span className="text-xs text-amber-800 font-bold group-hover:underline">
                      Ver Ficha →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
