import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { CATEGORIAS_LIST } from '../data/flanes';

export default function CatalogView({ 
  productos, 
  onSelectProduct, 
  onAddToCart,
  isLoading,
  error,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  user,
  onOpenUploadModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('destacados');

  // Parte 4 — Estado lento: avisa si el servidor tarda en despertar (Render free tier)
  const [lento, setLento] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLento(false);
      return;
    }
    const t = setTimeout(() => setLento(true), 5000);
    return () => clearTimeout(t);
  }, [isLoading]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    let list = [...productos];

    // Filtro por categoría
    if (selectedCategory !== 'todos') {
      list = list.filter(item => 
        item.categoria === selectedCategory || 
        item.categoria_id?.toString() === selectedCategory
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.nombre.toLowerCase().includes(q) ||
        (item.subtitulo && item.subtitulo.toLowerCase().includes(q)) ||
        (item.descripcion_corta && item.descripcion_corta.toLowerCase().includes(q)) ||
        (item.categoria && item.categoria.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    if (sortBy === 'precio-menor') {
      list.sort((a, b) => (a.precio_final || a.precio) - (b.precio_final || b.precio));
    } else if (sortBy === 'precio-mayor') {
      list.sort((a, b) => (b.precio_final || b.precio) - (a.precio_final || a.precio));
    } else if (sortBy === 'valoracion') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [productos, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen pb-20">
      
      {/* === HERO BANNER ARTESANAL === */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#381c0d] via-[#4d2511] to-[#2b1409] text-amber-50 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        {/* Glow de caramelo de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-700/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Texto y Slogan */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <span>✨ Tradición Porteña y Repostería de Autor</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                El Santuario del <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent italic">
                  Verdadero Flan Casero
                </span>
              </h1>

              <p className="text-amber-100/80 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Cocción paciente a baño María, 12 yemas de campo por flan, leche fresca de tambo y caramelo rubio en su punto exacto. Una experiencia celestial en cada cucharada.
              </p>

              {/* Badges de calidad y confianza */}
              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-amber-200/90 font-medium">
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <span>🥚</span>
                  <span>100% Huevos Pastoriles</span>
                </div>
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <span>❄️</span>
                  <span>Cadena de Frío Asegurada</span>
                </div>
                <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <span>💳</span>
                  <span>Hasta 6 Cuotas Sin Interés</span>
                </div>
              </div>
            </div>

            {/* Tarjeta Destacada Hero */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-3xl blur-md opacity-40 group-hover:opacity-70 transition duration-1000"></div>
                <div className="relative bg-amber-950/80 border border-amber-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-2xl">
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80" 
                      alt="Flan Destacado"
                      width="400"
                      height="200"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      El Más Aclamado ⭐
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white">Flan Mixto Tradicional</h3>
                  <p className="text-amber-200/70 text-xs mt-1">Con dulce de leche colonial y crema chantilly con vainilla bourbon.</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-medium">Desde</span>
                      <p className="font-serif text-xl font-black text-amber-200">$8.500</p>
                    </div>
                    <button
                      onClick={() => productos[0] && onSelectProduct(productos[0])}
                      className="bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* === BARRA DE FILTROS, CATEGORÍAS Y BÚSQUEDA === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-900/10 p-4 sm:p-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Categorías Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CATEGORIAS_LIST.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-900 text-white shadow-md shadow-amber-900/20 scale-102'
                      : 'bg-stone-100/80 hover:bg-amber-100/80 text-stone-700 hover:text-amber-950'
                  }`}
                >
                  <span>{cat.icono}</span>
                  <span>{cat.nombre}</span>
                </button>
              ))}
            </div>

            {/* Buscador y Ordenador */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Input de Búsqueda */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar flan o sabor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-stone-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 outline-none text-xs font-medium text-stone-800 bg-stone-50 transition-all"
                />
                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setPage(0);
                    }}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selector de Orden */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-700 bg-stone-50 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 outline-none cursor-pointer"
              >
                <option value="destacados">⭐ Más Destacados</option>
                <option value="precio-menor">💵 Menor Precio</option>
                <option value="precio-mayor">💎 Mayor Precio</option>
                <option value="valoracion">🔥 Mejor Valorados</option>
              </select>
            </div>

          </div>

        </div>
      </section>

      {/* === GRILLA DEL CATÁLOGO === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Encabezado de la Grilla */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-950">
              Nuestra Carta de Flanes
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Selección artesanal horneada a diario en nuestro obrador tradicional.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'flan disponible' : 'flanes disponibles'}
          </span>
        </div>

        {/* Estado de Carga */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-amber-100 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-800 border-t-transparent"></div>
            <p className="font-serif text-lg font-bold text-amber-950">Preparando los mejores flanes para ti...</p>
            {lento && (
              <p role="status" className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                {lento
                  ? 'Despertando el servidor, la primera visita puede tardar un minuto…'
                  : 'Cargando productos…'}
              </p>
            )}
          </div>
        )}

        {/* Estado de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-center shadow-sm max-w-xl mx-auto">
            <p className="font-bold text-base mb-1">Nota del sistema</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* Catálogo Vacío */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200 max-w-lg mx-auto">
            <span className="text-5xl block mb-3">🍮</span>
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-1">No encontramos ningún flan coincidente</h3>
            <p className="text-stone-500 text-xs mb-5">Prueba buscando con otro término o seleccionando otra categoría.</p>
            <button
              onClick={() => { setSelectedCategory('todos'); setSearchQuery(''); }}
              className="bg-amber-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Ver todos los flanes
            </button>
          </div>
        )}

        {/* Grilla de Cards */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(producto => (
              <ProductCard
                key={producto.id || producto.slug || producto.nombre}
                producto={producto}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                user={user}
                onOpenUploadModal={onOpenUploadModal}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              page === 0 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-amber-900 text-white hover:bg-amber-800 shadow-md cursor-pointer'
            }`}
          >
            Anterior
          </button>
          <span className="text-stone-600 font-medium">Página {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-900 text-white hover:bg-amber-800 shadow-md transition-colors cursor-pointer"
          >
            Siguiente
          </button>
        </div>

      </section>

      {/* === SECCIÓN DE BENEFICIOS Y GARANTÍA ARTESANAL === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-3xl p-8 sm:p-12 text-amber-50 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none select-none">
            🍮
          </div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Nuestro Compromiso Sagrado
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              ¿Por qué nuestros flanes son una verdadera religión?
            </h3>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              No usamos premezclas, polvos artificiales ni conservantes. Cada flan se elabora bajo pedido con huevos camperos frescos, leche entera de pastura y vainas de vainilla natural, respetando las 4 horas de cocción lenta a baño María que garantizan su textura inimitable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-black/20 p-4 rounded-2xl border border-amber-500/20">
                <span className="text-2xl mb-1 block">🏆</span>
                <h4 className="font-serif font-bold text-sm text-white">Receta Premiada</h4>
                <p className="text-amber-200/70 text-xs mt-1">Elegido mejor flan tradicional de Buenos Aires 2025.</p>
              </div>

              <div className="bg-black/20 p-4 rounded-2xl border border-amber-500/20">
                <span className="text-2xl mb-1 block">🧊</span>
                <h4 className="font-serif font-bold text-sm text-white">Packaging Térmico</h4>
                <p className="text-amber-200/70 text-xs mt-1">Llega a tu mesa a la temperatura exacta de degustación.</p>
              </div>

              <div className="bg-black/20 p-4 rounded-2xl border border-amber-500/20">
                <span className="text-2xl mb-1 block">🎁</span>
                <h4 className="font-serif font-bold text-sm text-white">Listo para Regalar</h4>
                <p className="text-amber-200/70 text-xs mt-1">Presentación de lujo en caja sellada con lazo de satén.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
