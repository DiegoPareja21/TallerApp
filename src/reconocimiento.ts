// Reconocimiento del coche en el propio móvil, gratis y sin internet:
// - Google ML Kit lee los textos de la foto (matrícula, nombre del modelo, marca escrita).
// - El color se calcula analizando los píxeles de la carrocería.
import type { Text } from '@infinitered/react-native-mlkit-text-recognition';
import { requireOptionalNativeModule } from 'expo';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { LecturaMatricula, leerMatricula, normalizarMatricula } from './matricula';
import { detectarMarcaModelo } from './vehiculos';

type Frame = { left: number; top: number; width: number; height: number };
const aFrame = (r: { left: number; top: number; right: number; bottom: number }): Frame => ({
  left: r.left,
  top: r.top,
  width: r.right - r.left,
  height: r.bottom - r.top,
});

export type DatosDetectados = {
  matricula?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  colorSeguro: boolean;
  textos: string[];
};

/** ML Kit es código nativo: no existe en Expo Go, solo en la app de desarrollo propia. */
export const reconocimientoDisponible = () => !!requireOptionalNativeModule('RNMLKitTextRecognition');

// Se carga solo al usarlo: importarlo en Expo Go rompería la app entera
async function leerTextos(uri: string): Promise<Text> {
  const { recognizeText } = require('@infinitered/react-native-mlkit-text-recognition') as typeof import('@infinitered/react-native-mlkit-text-recognition');
  return recognizeText(uri);
}

// ---------- Matrícula ----------

type Plato = LecturaMatricula & { alto: number; frame: Frame };

function buscarMatricula(r: Text): Plato | undefined {
  const candidatos: Plato[] = [];
  for (const bloque of r.blocks) {
    // Se prueba línea a línea y también el bloque entero (a veces la placa sale partida en dos líneas)
    const piezas = [...bloque.lines.map((l) => ({ t: l.text, f: aFrame(l.frame) })), { t: bloque.text, f: aFrame(bloque.frame) }];
    for (const { t, f } of piezas) {
      const lectura = leerMatricula(t);
      if (lectura) candidatos.push({ ...lectura, alto: f.height, frame: f });
    }
  }
  // Mejor candidato: menos correcciones y, a igualdad, el texto más grande (la placa suele serlo)
  return candidatos.sort((a, b) => a.correcciones - b.correcciones || b.alto - a.alto)[0];
}

// ---------- Color ----------

function base64ABytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function clasificarPixel(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  if (v < 0.18) return 'Negro';
  if (s < 0.15 || (s < 0.25 && v < 0.45)) {
    if (v > 0.82) return 'Blanco';
    if (v > 0.6) return 'Plata';
    if (v > 0.3) return 'Gris';
    return 'Negro';
  }
  const d = max - min || 1;
  const rr = r / 255, gg = g / 255, bb = b / 255;
  let h = rr === max ? ((gg - bb) / d) % 6 : gg === max ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 330) return 'Rojo';
  if (h < 40) return v < 0.55 ? 'Marrón' : 'Naranja';
  if (h < 70) return v < 0.45 ? 'Marrón' : 'Amarillo';
  if (h < 170) return 'Verde';
  if (h < 260) return 'Azul';
  return h < 300 ? 'Azul' : 'Rojo';
}

/**
 * Color mayoritario de la carrocería. Si se conoce la matrícula, mira la zona justo encima
 * (el portón); si no, el centro de la foto.
 */
async function detectarColor(uri: string, ancho: number, alto: number, placa?: Frame) {
  const ANCHO_MUESTRA = 96;
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: ANCHO_MUESTRA });
  const ref = await ctx.renderAsync();
  const img = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.9, base64: true });
  if (!img.base64) return undefined;
  const { data, width, height } = jpeg.decode(base64ABytes(img.base64), { useTArray: true, formatAsRGBA: true });

  let zona = { x0: 0.2, x1: 0.8, y0: 0.3, y1: 0.6 };
  if (placa && ancho > 0 && alto > 0) {
    const cx = (placa.left + placa.width / 2) / ancho;
    const pw = placa.width / ancho;
    const top = placa.top / alto;
    const ph = placa.height / alto;
    zona = { x0: cx - pw * 1.8, x1: cx + pw * 1.8, y0: top - ph * 4, y1: top - ph * 0.6 };
  }
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const x0 = Math.floor(clamp(zona.x0) * width), x1 = Math.ceil(clamp(zona.x1) * width);
  const y0 = Math.floor(clamp(zona.y0) * height), y1 = Math.ceil(clamp(zona.y1) * height);

  const votos: Record<string, number> = {};
  let total = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      const c = clasificarPixel(data[i], data[i + 1], data[i + 2]);
      votos[c] = (votos[c] ?? 0) + 1;
      total++;
    }
  }
  if (!total) return undefined;
  const [color, n] = Object.entries(votos).sort((a, b) => b[1] - a[1])[0];
  return { color, seguro: n / total >= 0.45 };
}

// ---------- Todo junto ----------

export async function reconocerCoche(uri: string, ancho: number, alto: number): Promise<DatosDetectados> {
  if (!reconocimientoDisponible()) {
    throw new Error('El escaneo necesita la app de desarrollo de AutoTaller (no funciona dentro de Expo Go). Rellena los datos a mano.');
  }
  const resultado = await leerTextos(uri);
  const placa = buscarMatricula(resultado);

  // Para buscar el modelo se quitan las líneas de la matrícula (sus cifras podrían parecer un "2008" o un "500")
  const textos = resultado.blocks.flatMap((b) => b.lines.map((l) => l.text)).filter((t) => {
    const c = t.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return !placa || !c.includes(placa.texto.replace(/[^A-Z0-9]/g, '').slice(0, 4));
  });
  const { marca, modelo } = detectarMarcaModelo(textos);

  let color: { color: string; seguro: boolean } | undefined;
  try {
    color = await detectarColor(uri, ancho, alto, placa?.frame);
  } catch {
    color = undefined;
  }

  return {
    matricula: placa ? normalizarMatricula(placa.texto) : undefined,
    marca,
    modelo,
    color: color?.color,
    colorSeguro: !!color?.seguro,
    textos,
  };
}
