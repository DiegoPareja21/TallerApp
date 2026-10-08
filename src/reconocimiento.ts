// Reconocimiento del coche a partir de una foto, con dos motores gratuitos para leer el texto:
// - Google ML Kit: en el propio móvil y sin internet. Solo en la app de desarrollo (Android).
// - OCR.space: en la nube (plan gratuito). Funciona en Expo Go y en iPhone.
// La matrícula, la marca y el modelo salen de esos textos; el color, de los píxeles de la carrocería.
import type { Text } from '@infinitered/react-native-mlkit-text-recognition';
import { requireOptionalNativeModule } from 'expo';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { LecturaMatricula, leerMatricula, normalizarMatricula } from './matricula';
import { detectarMarcaModelo } from './vehiculos';

type Frame = { left: number; top: number; width: number; height: number };
type Linea = { texto: string; frame: Frame };
/** Textos leídos, con su posición en una imagen de tamaño ancho × alto. */
type Lectura = { lineas: Linea[]; extras: Linea[]; ancho: number; alto: number };

export type DatosDetectados = {
  matricula?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  colorSeguro: boolean;
  textos: string[];
  motor: 'ML Kit' | 'OCR.space';
};

const OCR_KEY = process.env.EXPO_PUBLIC_OCRSPACE_API_KEY;
const mlKitDisponible = () => !!requireOptionalNativeModule('RNMLKitTextRecognition');

export const reconocimientoDisponible = () => mlKitDisponible() || !!OCR_KEY;

// ---------- Motor 1: ML Kit (en el móvil) ----------

const desdeRect = (r: { left: number; top: number; right: number; bottom: number }): Frame => ({
  left: r.left,
  top: r.top,
  width: r.right - r.left,
  height: r.bottom - r.top,
});

async function leerConMlKit(uri: string, ancho: number, alto: number): Promise<Lectura> {
  // Se carga solo al usarlo: importarlo en Expo Go rompería la app entera
  const { recognizeText } = require('@infinitered/react-native-mlkit-text-recognition') as typeof import('@infinitered/react-native-mlkit-text-recognition');
  const r: Text = await recognizeText(uri);
  return {
    lineas: r.blocks.flatMap((b) => b.lines.map((l) => ({ texto: l.text, frame: desdeRect(l.frame) }))),
    // El bloque entero también cuenta: a veces la placa sale partida en dos líneas
    extras: r.blocks.map((b) => ({ texto: b.text, frame: desdeRect(b.frame) })),
    ancho,
    alto,
  };
}

// ---------- Motor 2: OCR.space (en la nube) ----------

type OcrSpaceWord = { WordText: string; Left: number; Top: number; Width: number; Height: number };
type OcrSpaceRespuesta = {
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: { TextOverlay?: { Lines: { LineText: string; Words: OcrSpaceWord[] }[] } }[];
};

/** Reduce la foto por debajo de 1 MB, el límite del plan gratuito. */
async function prepararParaOcr(uri: string) {
  for (const [ancho, calidad] of [[1600, 0.7], [1200, 0.6], [900, 0.5]] as const) {
    const ctx = ImageManipulator.manipulate(uri);
    ctx.resize({ width: ancho });
    const ref = await ctx.renderAsync();
    const img = await ref.saveAsync({ format: SaveFormat.JPEG, compress: calidad, base64: true });
    if (img.base64 && img.base64.length * 0.75 < 950_000) return { base64: img.base64, ancho: img.width, alto: img.height };
  }
  throw new Error('La foto es demasiado grande para analizarla.');
}

async function leerConOcrSpace(uri: string): Promise<Lectura> {
  const img = await prepararParaOcr(uri);
  const form = new FormData();
  form.append('base64Image', `data:image/jpeg;base64,${img.base64}`);
  form.append('OCREngine', '2');
  form.append('isOverlayRequired', 'true');
  form.append('detectOrientation', 'true');
  form.append('scale', 'true');

  let res: Response;
  try {
    res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', headers: { apikey: OCR_KEY! }, body: form });
  } catch {
    throw new Error('Sin conexión con el lector de matrículas. Revisa internet o rellena los datos a mano.');
  }
  if (res.status === 403 || res.status === 401) throw new Error('La clave de OCR.space no es válida.');
  if (!res.ok) throw new Error(`El lector de matrículas no responde (${res.status}). Prueba en un momento.`);

  const json = (await res.json()) as OcrSpaceRespuesta;
  if (json.IsErroredOnProcessing || json.OCRExitCode > 2) {
    const msg = Array.isArray(json.ErrorMessage) ? json.ErrorMessage[0] : json.ErrorMessage;
    throw new Error(`No se pudo leer la foto${msg ? `: ${msg}` : '.'}`);
  }

  const lineas: Linea[] = (json.ParsedResults?.[0]?.TextOverlay?.Lines ?? []).map((l) => {
    const left = Math.min(...l.Words.map((w) => w.Left));
    const top = Math.min(...l.Words.map((w) => w.Top));
    const right = Math.max(...l.Words.map((w) => w.Left + w.Width));
    const bottom = Math.max(...l.Words.map((w) => w.Top + w.Height));
    return { texto: l.LineText, frame: { left, top, width: right - left, height: bottom - top } };
  });
  // Parejas de líneas seguidas, por si la placa se ha leído partida
  const extras = lineas.slice(1).map((l, i) => ({ texto: `${lineas[i].texto} ${l.texto}`, frame: lineas[i].frame }));
  return { lineas, extras, ancho: img.ancho, alto: img.alto };
}

// ---------- Matrícula ----------

type Plato = LecturaMatricula & { frame: Frame };

function buscarMatricula(l: Lectura): Plato | undefined {
  const candidatos: Plato[] = [];
  for (const { texto, frame } of [...l.lineas, ...l.extras]) {
    const lectura = leerMatricula(texto);
    if (lectura) candidatos.push({ ...lectura, frame });
  }
  // Mejor candidato: menos correcciones y, a igualdad, el texto más grande (la placa suele serlo)
  return candidatos.sort((a, b) => a.correcciones - b.correcciones || b.frame.height - a.frame.height)[0];
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
  const motor = mlKitDisponible() ? 'ML Kit' : OCR_KEY ? 'OCR.space' : null;
  if (!motor) {
    throw new Error(
      'El escaneo no está configurado en este móvil: falta la clave gratuita de OCR.space (EXPO_PUBLIC_OCRSPACE_API_KEY en .env.local). Rellena los datos a mano.'
    );
  }
  const lectura = motor === 'ML Kit' ? await leerConMlKit(uri, ancho, alto) : await leerConOcrSpace(uri);
  const placa = buscarMatricula(lectura);

  // Para buscar el modelo se quitan las líneas de la matrícula (sus cifras podrían parecer un "2008" o un "500")
  const cifrasPlaca = placa?.texto.replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const textos = lectura.lineas
    .map((l) => l.texto)
    .filter((t) => !cifrasPlaca || !t.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cifrasPlaca));
  const { marca, modelo } = detectarMarcaModelo(textos);

  let color: { color: string; seguro: boolean } | undefined;
  try {
    color = await detectarColor(uri, lectura.ancho, lectura.alto, placa?.frame);
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
    motor,
  };
}
