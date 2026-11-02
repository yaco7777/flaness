import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

// Genera los íconos de la PWA a partir de public/logo.svg.
// Uso:  npm run generate-pwa-assets
// El fondo del ícono maskable y del apple-touch-icon usa el marrón de la marca
// (en lugar del blanco por defecto) para que el recorte de Android/iOS no deje
// bordes blancos alrededor del logo.
const FONDO = "#2b1409";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      resizeOptions: { background: FONDO },
    },
    apple: {
      ...preset.apple,
      resizeOptions: { background: FONDO },
    },
  },
  images: ["public/logo.svg"],
});
