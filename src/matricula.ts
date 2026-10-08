// Matrículas españolas del sistema actual (desde sept. 2000): 4 cifras + 3 consonantes, p. ej. "1234 BCD".
// Las letras avanzan en orden y sin vocales, Ñ ni Q, así que las letras indican el año de matriculación.

const CONSONANTES = 'BCDFGHJKLMNPRSTVWXYZ';

// Primera combinación de letras de cada año (aproximada).
// Fuente: hibridosyelectricos.com/fecha-matricula-coche.html. Amplía la tabla cada año.
const INICIO_ANIO: [number, string][] = [
  [2000, 'BBB'],
  [2001, 'BFJ'],
  [2002, 'BSL'],
  [2003, 'CDV'],
  [2004, 'CRV'],
  [2005, 'DFZ'],
  [2006, 'DVW'],
  [2007, 'FKY'],
  [2008, 'FZR'],
  [2009, 'GKS'],
  [2010, 'GTC'],
  [2011, 'HBP'],
  [2012, 'HJC'],
  [2013, 'HNT'],
  [2014, 'HVN'],
  [2015, 'JCK'],
  [2016, 'JLN'],
  [2017, 'JWN'],
  [2018, 'KHG'],
  [2019, 'KTJ'],
  [2020, 'LFH'],
  [2021, 'LML'],
  [2022, 'LWD'],
  [2023, 'MDR'],
  [2024, 'MNC'],
  [2025, 'MYF'],
  [2026, 'NKH'],
];

const RE_ACTUAL = /^(\d{4})\s*-?\s*([BCDFGHJKLMNPRSTVWXYZ]{3})$/;

const valor = (letras: string) => [...letras].reduce((v, l) => v * CONSONANTES.length + CONSONANTES.indexOf(l), 0);

/** Limpia la matrícula y la deja como "1234 BCD" si tiene el formato actual. */
export function normalizarMatricula(texto: string): string {
  const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = limpio.match(/^(\d{4})([A-Z]{3})$/);
  if (m) return `${m[1]} ${m[2]}`;
  return texto.toUpperCase().trim().replace(/\s+/g, ' ');
}

// ---------- Lectura de la matrícula en un texto del OCR ----------

// Confusiones típicas del OCR según si en esa posición debe ir una cifra o una letra
const A_CIFRA: Record<string, string> = { O: '0', Q: '0', D: '0', U: '0', I: '1', L: '1', T: '1', Z: '2', S: '5', B: '8', G: '6' };
const A_LETRA: Record<string, string> = { '8': 'B', '5': 'S', '2': 'Z', '6': 'G', '0': 'D', '1': 'L', '4': 'H' };

// Prefijos de las matrículas provinciales antiguas (M-1234-AB)
const PROVINCIAS = new Set(
  'A AB AL AV B BA BI BU C CA CC CE CO CR CS CU GC GE GI GR GU H HU IB J L LE LO LU M MA ML MU NA O OR OU P PM PO S SA SE SG SO SS T TE TF TO V VA VI Z ZA'.split(' ')
);

export type LecturaMatricula = { texto: string; correcciones: number };

/** Busca una matrícula dentro de un texto leído por el OCR, corrigiendo confusiones típicas (O/0, B/8…). */
export function leerMatricula(textoOcr: string): LecturaMatricula | undefined {
  let compacto = textoOcr.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // La "E" de la franja azul europea suele leerse delante: "E1234BCD"
  if (/^E\d/.test(compacto)) compacto = compacto.slice(1);

  const antigua = compacto.match(/^([A-Z]{1,2})(\d{4})([A-Z]{1,2})$/);
  if (antigua && PROVINCIAS.has(antigua[1])) return { texto: `${antigua[1]}-${antigua[2]}-${antigua[3]}`, correcciones: 1 };

  let mejor: LecturaMatricula | undefined;
  for (let i = 0; i + 7 <= compacto.length; i++) {
    let correcciones = 0;
    let texto = '';
    for (let j = 0; j < 7; j++) {
      let ch = compacto[i + j];
      if (j < 4 ? !/\d/.test(ch) : !CONSONANTES.includes(ch)) {
        ch = (j < 4 ? A_CIFRA : A_LETRA)[ch] ?? '';
        correcciones++;
      }
      if (!ch) break;
      texto += ch;
    }
    if (texto.length === 7 && correcciones <= 2 && (!mejor || correcciones < mejor.correcciones)) {
      mejor = { texto: `${texto.slice(0, 4)} ${texto.slice(4)}`, correcciones };
    }
  }
  return mejor;
}

/** Año aproximado de matriculación según las letras, o undefined si no es del formato actual. */
export function anioPorMatricula(matricula: string): number | undefined {
  const m = normalizarMatricula(matricula).match(RE_ACTUAL);
  if (!m) return undefined;
  const v = valor(m[2]);
  let anio: number | undefined;
  for (const [a, inicio] of INICIO_ANIO) {
    if (v >= valor(inicio)) anio = a;
  }
  return anio;
}
