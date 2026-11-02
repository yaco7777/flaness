import React, { useState, useRef, useEffect } from 'react';
import { subirImagen } from '../services/api';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export default function SubirImagenModal({
  isOpen,
  onClose,
  producto,
  onProductUpdated,
  showToast,
}) {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState('');
  const [isSubiendo, setIsSubiendo] = useState(false);
  const inputRef = useRef(null);

  // Parte 2 — Punto 4: useEffect que revoca el ObjectURL cuando cambia preview o al desmontar
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Limpiar estado al cerrar o cambiar producto
  useEffect(() => {
    if (!isOpen) {
      limpiarCampos();
    }
  }, [isOpen]);

  const limpiarCampos = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setArchivo(null);
    setErrorValidacion('');
    setIsSubiendo(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Parte 1 y 2: Manejo de archivo y validación previa a previsualizar
  const handleFileChange = (e) => {
    setErrorValidacion('');
    const file = e.target.files?.[0];

    if (!file) {
      setArchivo(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      return;
    }

    // Parte 1 — Punto 4: Mostrar en consola el objeto File (name, size, type)
    console.log('Objeto File seleccionado:', {
      name: file.name,
      size: `${file.size} bytes (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      type: file.type || '(sin type reportado)',
    });

    // Parte 2 — Punto 5: Validar tipo permitido (debe ser imagen)
    if (!file.type.startsWith('image/')) {
      const msg = `El archivo "${file.name}" no es una imagen válida (tipo reportado: "${file.type || 'desconocido'}"). Solo se permiten imágenes.`;
      setErrorValidacion(msg);
      // Limpiar input con la ref
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setArchivo(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      return;
    }

    // Parte 2 — Punto 5: Validar tamaño menor a 2 MB
    if (file.size > MAX_SIZE_BYTES) {
      const tamanoMb = (file.size / (1024 * 1024)).toFixed(2);
      const msg = `El archivo pesa ${tamanoMb} MB y excede el tamaño máximo permitido de 2 MB.`;
      setErrorValidacion(msg);
      // Limpiar input con la ref
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setArchivo(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      return;
    }

    // Archivo válido: guardar estado y generar preview
    setArchivo(file);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    const nuevaUrl = URL.createObjectURL(file);
    console.log('Vista previa generada con URL efímera:', nuevaUrl);
    setPreview(nuevaUrl);
  };

  // Parte 3: Subida con FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !producto) return;

    setIsSubiendo(true);
    setErrorValidacion('');

    try {
      const productoActualizado = await subirImagen(producto.id, archivo);
      if (showToast) {
        showToast('¡Imagen subida con éxito!', `La imagen de "${producto.nombre}" fue actualizada correctamente.`, 'success');
      }
      if (onProductUpdated) {
        onProductUpdated(productoActualizado);
      }
      limpiarCampos();
      onClose();
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setErrorValidacion(err.message || 'Error inesperado al subir la imagen.');
    } finally {
      setIsSubiendo(false);
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-900/10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xl">
              📷
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold leading-tight">Subir Imagen de Producto</h2>
              <p className="text-xs text-amber-200/80 font-light truncate max-w-xs">{producto.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Reglas e información del contrato */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <span>📋</span> Requisitos del sistema (Contrato DSI2):
            </p>
            <ul className="list-disc list-inside text-stone-600 space-y-0.5 pl-1">
              <li>Formato de imagen permitido: JPG, PNG, WEBP.</li>
              <li>Tamaño máximo: <strong>2 MB</strong>.</li>
              <li>El navegador genera el multipart boundary automáticamente.</li>
            </ul>
          </div>

          {/* Input de archivo no controlado con ref y accept */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Seleccionar archivo de imagen:
            </label>
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-stone-600
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-bold
                file:bg-amber-900 file:text-white
                hover:file:bg-amber-800
                file:cursor-pointer cursor-pointer
                border border-amber-900/20 rounded-2xl p-2 bg-stone-50"
            />
          </div>

          {/* Mensaje de error de validación o del backend */}
          {errorValidacion && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-700 flex items-start gap-2.5 animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1 font-medium">{errorValidacion}</div>
            </div>
          )}

          {/* Parte 2 — Vista previa de la imagen */}
          {preview && (
            <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <span className="text-xs font-bold text-amber-950 block">
                ✨ Vista previa (URL.createObjectURL):
              </span>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm bg-white shrink-0">
                  <img
                    src={preview}
                    alt="Vista previa"
                    width="112"
                    height="112"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-stone-600 space-y-1 overflow-hidden">
                  <p className="font-semibold text-stone-900 truncate">
                    {archivo?.name}
                  </p>
                  <p className="text-stone-500">
                    Tamaño: {((archivo?.size || 0) / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-stone-500">
                    Tipo: {archivo?.type}
                  </p>
                  <p className="text-[11px] text-amber-800 font-mono bg-white/80 p-1.5 rounded-lg border border-amber-200/50 break-all select-all">
                    {preview}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parte 3 — Punto 6: Tres estados del botón de subida */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-amber-900/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubiendo}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!archivo || isSubiendo}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${
                !archivo || isSubiendo
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-900 hover:bg-amber-950 text-white cursor-pointer hover:shadow-md'
              }`}
            >
              {isSubiendo ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <span>☁️</span>
                  <span>Subir Imagen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
