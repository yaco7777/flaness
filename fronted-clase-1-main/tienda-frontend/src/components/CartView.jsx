import React, { useState } from 'react';
import { crearPedido } from '../services/api';
import { useConectado } from '../hooks/useConectado';

export default function CartView({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onSelectProduct,
  onNavigateToHistory,
  onNavigateToLogin,
  user = null,
  onAddSampleItem = null,
}) {
  const conectado = useConectado();
  const [shippingMethod, setShippingMethod] = useState('delivery'); // 'delivery' | 'pickup'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Estados de simulación / compra
  const [enviando, setEnviando] = useState(false);
  const [errorPedido, setErrorPedido] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta'); // 'tarjeta' | 'mp' | 'efectivo'

  // Datos para compra como invitado (simulación rápida sin login)
  const [guestInfo, setGuestInfo] = useState({
    nombre: 'Invitado Gourmet',
    email: 'invitado@cultoalflan.com',
    direccion: 'Av. Santa Fe 3200, Palermo, CABA',
    telefono: '11 4567-8900',
  });

  // Modal de Comprobante / Ticket
  const [showModalComprobante, setShowModalComprobante] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  // Cálculos de montos
  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.producto.precio_final ?? item.producto.precio ?? 0;
    return acc + (p * item.cantidad);
  }, 0);

  const freeShippingThreshold = 25000;
  const deliveryCost = shippingMethod === 'delivery' ? (subtotal >= freeShippingThreshold ? 0 : 2500) : 0;
  
  // Descuento por cupón
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = Math.round(subtotal * appliedCoupon.percentage);
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'CULTO10') {
      setAppliedCoupon({ code: 'CULTO10', percentage: 0.10, label: '10% OFF Especial de Bienvenida' });
      setCouponCode('');
    } else if (code === 'FLANLOVE' || code === 'FLAN15') {
      setAppliedCoupon({ code: code, percentage: 0.15, label: '15% OFF Fanáticos del Flan' });
      setCouponCode('');
    } else {
      setCouponError('Cupón inválido o expirado. Prueba con CULTO10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Confirmar / Simular compra (funciona con o sin login)
  const confirmar = async () => {
    if (enviando) return;
    if (cartItems.length === 0) return;

    setEnviando(true);
    setErrorPedido(null);

    // Snapshot de la compra actual
    const snapshotItems = [...cartItems];
    const snapshotSubtotal = subtotal;
    const snapshotDiscount = discountAmount;
    const snapshotShipping = deliveryCost;
    const snapshotTotal = total;
    const snapshotCoupon = appliedCoupon ? { ...appliedCoupon } : null;

    let apiOrderId = null;

    // Intentar registrar en backend si el servidor está activo
    try {
      const resp = await crearPedido(snapshotItems);
      if (resp && resp.id) {
        apiOrderId = resp.id;
      }
    } catch (err) {
      console.info('Backend no disponible o error en petición, completando en modo simulación:', err.message);
    }

    const orderId = apiOrderId ? `#CF-${apiOrderId}` : `#CF-${Math.floor(100000 + Math.random() * 900000)}`;
    const nuevoPedido = {
      id: orderId,
      fecha: new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      descuento: snapshotDiscount,
      cupon: snapshotCoupon?.code || null,
      envio: snapshotShipping,
      metodoEnvio: shippingMethod,
      metodoPago: paymentMethod,
      total: snapshotTotal,
      cliente: {
        nombre: user ? user.nombre : (guestInfo.nombre || 'Invitado Gourmet'),
        email: user ? user.email : (guestInfo.email || 'invitado@cultoalflan.com'),
        direccion: shippingMethod === 'delivery' ? (guestInfo.direccion || 'Av. Santa Fe 3200, Palermo, CABA') : 'Retiro en Obrador (Palermo)',
        telefono: guestInfo.telefono || '11 4567-8900',
      },
      esInvitado: !user,
      estado: 'Confirmado',
    };

    // Guardar en localStorage para persistencia de pedidos simulados
    try {
      const prev = JSON.parse(localStorage.getItem('pedidos_simulados') || '[]');
      localStorage.setItem('pedidos_simulados', JSON.stringify([nuevoPedido, ...prev]));
    } catch (e) {
      console.error('Error guardando pedido simulado en localStorage:', e);
    }

    setPedidoConfirmado(nuevoPedido);
    setShowModalComprobante(true);

    if (onClearCart) {
      onClearCart();
    }
    setEnviando(false);
  };

  // Carrito Vacío
  if (cartItems.length === 0 && !showModalComprobante) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-amber-100/80 flex items-center justify-center text-5xl mb-6 shadow-inner">
          🍮
        </div>
        <h2 className="font-serif text-3xl font-bold text-amber-950 mb-3">
          Tu carrito está esperando por un flan
        </h2>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          Aún no has agregado ningún manjar tradicional. Explora nuestra carta de flanes horneados con dulce de leche colonial, vainilla Bourbon y recetas premiadas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm px-6 py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explorar Catálogo</span>
          </button>
          {onAddSampleItem && (
            <button
              id="btn-simular-rapido-vacio"
              onClick={onAddSampleItem}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 hover:from-amber-900 hover:to-stone-900 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>⚡ Cargar Flan y Simular Compra</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      
      {/* Encabezado del Carrito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-amber-900/10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-950">
            Resumen de tu Pedido
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Revisá los flanes seleccionados antes de proceder a la entrega refrigerada.
          </p>
        </div>

        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit"
        >
          <span>← Continuar Comprando</span>
        </button>
      </div>

      {/* Grid Carrito: Lista de Items + Columna de Totales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* === LISTA DE PRODUCTOS AGREGADOS (7 COLUMNAS) === */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-900/10 shadow-sm divide-y divide-amber-900/5">
            {cartItems.map((item) => {
              const { producto, cantidad, dedicatoria } = item;
              const unitPrice = producto.precio_final ?? producto.precio ?? 0;
              const itemTotal = unitPrice * cantidad;

              return (
                <div key={producto.id || producto.nombre} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Foto e Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      onClick={() => onSelectProduct && onSelectProduct(producto)}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-amber-900/10 cursor-pointer group"
                    >
                      <img 
                        src={producto.imagen || "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80"} 
                        alt={producto.nombre}
                        width="80"
                        height="80"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                        {producto.categoria || 'Flan'}
                      </span>
                      <h3 
                        onClick={() => onSelectProduct && onSelectProduct(producto)}
                        className="font-serif font-bold text-base text-stone-900 hover:text-amber-900 cursor-pointer transition-colors"
                      >
                        {producto.nombre}
                      </h3>
                      <p className="text-xs text-stone-500">
                        ${unitPrice.toLocaleString('es-AR')} c/u
                      </p>
                      {dedicatoria && (
                        <p className="text-[11px] text-amber-900/80 italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          💌 &ldquo;{dedicatoria}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controles de Cantidad y Total de Línea */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    
                    {/* Selector de Cantidad */}
                    <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                      <button
                        onClick={() => onUpdateQuantity(producto.id, cantidad - 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 font-black text-xs flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Disminuir"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-serif font-black text-stone-900 text-sm">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(producto.id, cantidad + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 font-black text-xs flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio Total Item */}
                    <div className="text-right min-w-[80px]">
                      <span className="font-serif font-black text-base text-amber-950 block">
                        ${itemTotal.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => onRemoveItem(producto.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Quitar producto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Opciones de Entrega y Envío */}
          <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Método de Entrega
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery Refrigerado */}
              <div
                onClick={() => setShippingMethod('delivery')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'delivery'
                    ? 'bg-amber-50/70 border-amber-800 ring-2 ring-amber-600/30'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">🚚 Envío Refrigerado Express</span>
                  <span className="text-xs font-bold text-amber-900">
                    {subtotal >= freeShippingThreshold ? '¡GRATIS!' : '$2.500'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Despacho en caja isotérmica a CABA y GBA en el día.
                </p>
                {subtotal < freeShippingThreshold && (
                  <span className="text-[10px] text-amber-700 font-semibold mt-1">
                    Sumá ${(freeShippingThreshold - subtotal).toLocaleString('es-AR')} más para envío gratis.
                  </span>
                )}
              </div>

              {/* Retiro en Obrador */}
              <div
                onClick={() => setShippingMethod('pickup')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'pickup'
                    ? 'bg-amber-50/70 border-amber-800 ring-2 ring-amber-600/30'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">🏪 Retiro en Obrador</span>
                  <span className="text-xs font-bold text-emerald-700">GRATIS</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Palermo Soho, Gurruchaga 1750 (Lun a Sáb de 10 a 20hs).
                </p>
              </div>
            </div>
          </div>

          {/* DATOS DE ENTREGA Y COMPRA COMO INVITADO (SIMULACIÓN SIN LOGIN) */}
          {!user ? (
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 rounded-3xl p-5 sm:p-6 border-2 border-amber-300/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="font-serif font-bold text-amber-950 text-base">
                      Simulación Rápida de Compra
                    </h3>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Completá el pedido en 1 clic sin necesidad de registrarte ni iniciar sesión.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                  ✓ Sin Iniciar Sesión
                </span>
              </div>

              {/* Campos Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Nombre del Comprador:
                  </label>
                  <input
                    type="text"
                    value={guestInfo.nombre}
                    onChange={(e) => setGuestInfo({ ...guestInfo, nombre: e.target.value })}
                    placeholder="Ej: Luciano Pérez"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-amber-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-300 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Email para el Comprobante:
                  </label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-amber-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-300 outline-none transition-all"
                  />
                </div>
              </div>

              {shippingMethod === 'delivery' && (
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Dirección de Envío Refrigerado:
                  </label>
                  <input
                    type="text"
                    value={guestInfo.direccion}
                    onChange={(e) => setGuestInfo({ ...guestInfo, direccion: e.target.value })}
                    placeholder="Calle, número, piso y depto"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-amber-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-300 outline-none transition-all"
                  />
                </div>
              )}

              {/* Atajos de ayuda */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/50">
                <button
                  type="button"
                  onClick={() => setGuestInfo({
                    nombre: 'Luciano Degustador',
                    email: 'luciano.flan@cultoalflan.ar',
                    direccion: 'Av. Santa Fe 3200, Palermo, CABA',
                    telefono: '11 5555-8888',
                  })}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer flex items-center gap-1.5"
                >
                  <span>✨ Rellenar con datos de prueba</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs text-stone-500 hover:text-amber-900 cursor-pointer"
                >
                  ¿Ya tenés cuenta? Iniciar sesión aquí →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/70 rounded-3xl p-4 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Sesión Activa:</span> {user.nombre} ({user.email})
              </div>
              <span className="bg-emerald-200/80 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                {user.rol || 'Cliente'}
              </span>
            </div>
          )}

        </div>

        {/* === RESUMEN DEL PEDIDO Y TOTALES (5 COLUMNAS) === */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-900/15 shadow-lg space-y-5">
            <h2 className="font-serif text-xl font-bold text-stone-900 pb-3 border-b border-amber-900/10">
              Resumen de Compra
            </h2>

            {/* Cupón de descuento */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                ¿Tenés un cupón de descuento?
              </label>
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: CULTO10 o FLAN15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs uppercase bg-stone-50 border border-stone-200 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="text-xs text-emerald-800">
                    <strong>✓ {appliedCoupon.code}</strong>: {appliedCoupon.label}
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Selector de Método de Pago Simulado */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Método de Pago (Simulación Instantánea):
              </label>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'tarjeta'
                      ? 'bg-amber-100/90 border-amber-800 text-amber-950 ring-2 ring-amber-700/20 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base">💳</span>
                  <span className="text-[11px] leading-tight">Tarjeta (3 cuotas)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mp')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'mp'
                      ? 'bg-amber-100/90 border-amber-800 text-amber-950 ring-2 ring-amber-700/20 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base">📱</span>
                  <span className="text-[11px] leading-tight">Mercado Pago</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'efectivo'
                      ? 'bg-amber-100/90 border-amber-800 text-amber-950 ring-2 ring-amber-700/20 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base">💵</span>
                  <span className="text-[11px] leading-tight">Contra entrega</span>
                </button>
              </div>
            </div>

            {/* Desglose de Precios */}
            <div className="space-y-3 pt-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.cantidad, 0)} productos):</span>
                <span className="font-semibold text-stone-900">${subtotal.toLocaleString('es-AR')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento aplicado ({appliedCoupon.code}):</span>
                  <span>-${discountAmount.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-semibold text-stone-900">
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-700 font-bold">¡GRATIS!</span>
                  ) : (
                    `$${deliveryCost.toLocaleString('es-AR')}`
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-amber-900/10 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-lg font-bold text-stone-900 block">Total Final:</span>
                  <span className="text-[11px] text-stone-400">Impuestos y empaque incluidos</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl font-black text-amber-950 block">
                    ${total.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[11px] text-amber-800 font-bold">
                    O hasta 3 cuotas de ${(total / 3).toFixed(0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje de error si la validación estricta fallase */}
            {errorPedido && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-start gap-2.5 animate-fadeIn">
                <span className="text-base leading-none">⚠️</span>
                <div className="flex-1">
                  <strong className="block text-red-900 font-bold mb-0.5">Aviso:</strong>
                  <p>{errorPedido}</p>
                </div>
              </div>
            )}

            {/* Aviso sin conexión (PWA Offline) */}
            {!conectado && (
              <p role="status" className="p-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                Podés mirar el catálogo, pero para comprar necesitás internet.
              </p>
            )}

            {/* Botón de Confirmación Principal */}
            <button
              id="btn-confirmar-pedido"
              onClick={confirmar}
              disabled={!conectado || enviando || cartItems.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                !conectado || enviando || cartItems.length === 0
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 hover:from-amber-950 hover:to-amber-900 text-white hover:shadow-xl active:scale-98 cursor-pointer ring-2 ring-amber-600/30'
              }`}
            >
              {!conectado ? (
                <span>Sin conexión a internet</span>
              ) : enviando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Procesando simulación de compra...</span>
                </>
              ) : (
                <>
                  <span>
                    {user
                      ? 'Confirmar Compra 🍮'
                      : '⚡ Simular Compra Ahora (Sin Iniciar Sesión) 🍮'}
                  </span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Badges de Seguridad */}
            <div className="pt-2 flex items-center justify-center gap-4 text-stone-400 text-xs">
              <span className="flex items-center gap-1">🔒 Simulación 100% Segura</span>
              <span>•</span>
              <span className="flex items-center gap-1">🍮 Sin Datos Reales</span>
            </div>

          </div>

        </div>

      </div>

      {/* === MODAL DE COMPROBANTE DE COMPRA (TICKET DE PEDIDO SIMULADO) === */}
      {showModalComprobante && pedidoConfirmado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fcfaf7] border border-amber-900/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Botón cerrar X */}
            <button
              onClick={() => {
                setShowModalComprobante(false);
                if (onContinueShopping) onContinueShopping();
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
              title="Cerrar comprobante"
            >
              ✕
            </button>

            {/* Header Modal */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-3xl flex items-center justify-center mx-auto shadow-md">
                🍮
              </div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
                ✓ ¡Compra Simulada con Éxito!
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-950">
                ¡Gracias por tu pedido!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
                {pedidoConfirmado.esInvitado
                  ? 'Tu compra ha sido procesada de forma instantánea sin necesidad de registrarte ni iniciar sesión.'
                  : 'Tu compra ha sido confirmada exitosamente.'}
              </p>
            </div>

            {/* TICKET ARTESANAL */}
            <div id="ticket-compra" className="bg-white rounded-2xl p-5 border border-dashed border-amber-900/30 shadow-inner space-y-4">
              {/* Cabecera ticket */}
              <div className="text-center pb-3 border-b border-stone-200">
                <h3 className="font-serif font-black text-amber-950 text-base uppercase tracking-wider">
                  Culto al Flan • Obrador Central
                </h3>
                <p className="text-[10px] text-stone-500">Palermo Soho, Gurruchaga 1750, Buenos Aires</p>
                <div className="flex justify-between items-center text-[11px] font-semibold text-stone-600 mt-2">
                  <span>Comprobante: <strong className="text-amber-950">{pedidoConfirmado.id}</strong></span>
                  <span>{pedidoConfirmado.fecha}</span>
                </div>
              </div>

              {/* Datos Cliente & Entrega */}
              <div className="text-xs text-stone-600 space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-800">Cliente:</span>
                  <span>{pedidoConfirmado.cliente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-800">Email:</span>
                  <span>{pedidoConfirmado.cliente.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-800">Entrega:</span>
                  <span>{pedidoConfirmado.metodoEnvio === 'delivery' ? '🚚 Envío Refrigerado' : '🏪 Retiro en Obrador'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-800">Destino / Retiro:</span>
                  <span className="truncate max-w-[200px]">{pedidoConfirmado.cliente.direccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-800">Método de Pago:</span>
                  <span className="text-emerald-700 font-bold uppercase text-[11px]">
                    {pedidoConfirmado.metodoPago === 'tarjeta' ? '💳 Tarjeta (Simulada)' : pedidoConfirmado.metodoPago === 'mp' ? '📱 Mercado Pago' : '💵 Contra entrega'}
                  </span>
                </div>
              </div>

              {/* Detalle de Items */}
              <div className="divide-y divide-stone-100 text-xs">
                {pedidoConfirmado.items.map((it, idx) => {
                  const precio = it.producto.precio_final ?? it.producto.precio ?? 0;
                  return (
                    <div key={idx} className="py-2 flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {it.cantidad}x {it.producto.nombre}
                        </span>
                        {it.dedicatoria && (
                          <span className="text-[10px] text-amber-800 italic block">
                            💌 &ldquo;{it.dedicatoria}&rdquo;
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          ${precio.toLocaleString('es-AR')} c/u
                        </span>
                      </div>
                      <span className="font-bold text-stone-900">
                        ${(precio * it.cantidad).toLocaleString('es-AR')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="pt-3 border-t border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>${pedidoConfirmado.subtotal.toLocaleString('es-AR')}</span>
                </div>
                {pedidoConfirmado.descuento > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento ({pedidoConfirmado.cupon}):</span>
                    <span>-${pedidoConfirmado.descuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Costo de Envío:</span>
                  <span>{pedidoConfirmado.envio === 0 ? '¡GRATIS!' : `$${pedidoConfirmado.envio.toLocaleString('es-AR')}`}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-amber-900/10">
                  <span className="font-serif font-black text-sm text-stone-900 uppercase">Total Abonado:</span>
                  <span className="font-serif font-black text-2xl text-amber-950">
                    ${pedidoConfirmado.total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Badge Estado */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-900 font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Estado: Preparando pedido en el obrador
                </span>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Tiempo estimado: 45 - 60 minutos
                </p>
              </div>
            </div>

            {/* Botones de Acción del Modal */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-300"
              >
                <span>🖨️ Imprimir / Guardar Comprobante</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalComprobante(false);
                    if (onContinueShopping) onContinueShopping();
                  }}
                  className="flex-1 py-3 px-4 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🍮 Volver al Catálogo</span>
                </button>

                {user && onNavigateToHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalComprobante(false);
                      onNavigateToHistory();
                    }}
                    className="py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    📦 Mis Pedidos
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
