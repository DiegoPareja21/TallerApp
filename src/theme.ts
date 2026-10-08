import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Estado } from './types';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Datos del taller (cámbialos por los tuyos)
export const TALLER = {
  nombre: 'AutoTaller Pro',
  telefono: '+34600000000',
  direccion: 'Calle Mayor 12, Madrid',
  codigoPersonal: '1234',
};

export const CLARO = {
  bg: '#F4F6FB',
  card: '#FFFFFF',
  cardBorder: 'transparent',
  input: '#FFFFFF',
  inputFoco: '#FAFBFF',
  text: '#0F172A',
  textSoft: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  primary: '#2F5BFF',
  primaryDark: '#1E3FCC',
  primarySuave: '#E0E7FF',
  primaryBorde: '#C7D2FE',
  accent: '#FF7A1A',
  danger: '#EF4444',
  dangerSuave: '#FEF2F2',
  success: '#10B981',
  successSuave: '#ECFDF5',
  successBorde: '#A7F3D0',
  successTexto: '#065F46',
  successTexto2: '#047857',
  headerFrom: '#0B1437',
  headerTo: '#2340B8',
  sombra: 0.08,
};

export const OSCURO: typeof CLARO = {
  bg: '#0A0F1F',
  card: '#141B2F',
  cardBorder: '#1F2942',
  input: '#10172A',
  inputFoco: '#131D3A',
  text: '#F1F5F9',
  textSoft: '#C3CEDF',
  textMuted: '#7686A3',
  border: '#26314D',
  primary: '#5B7CFF',
  primaryDark: '#3556E8',
  primarySuave: '#1C2752',
  primaryBorde: '#2E3D78',
  accent: '#FF8A3D',
  danger: '#F87171',
  dangerSuave: '#3A1719',
  success: '#34D399',
  successSuave: '#0E2A22',
  successBorde: '#14532D',
  successTexto: '#6EE7B7',
  successTexto2: '#34D399',
  headerFrom: '#050816',
  headerTo: '#1A2A7A',
  sombra: 0.35,
};

export type Colores = typeof CLARO;

// Fondo suave de cada estado según el tema
export const suaveDe = (e: { color: string; suave: string }, oscuro: boolean) => (oscuro ? `${e.color}2E` : e.suave);

export const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_800ExtraBold',
};

export const ESTADOS: {
  key: Estado;
  label: string;
  corto: string;
  descripcion: string;
  color: string;
  suave: string;
  icon: IconName;
}[] = [
  {
    key: 'pendiente',
    label: 'Aún no se ha mirado',
    corto: 'En espera',
    descripcion: 'Tu coche está en cola. Un mecánico lo revisará pronto.',
    color: '#64748B',
    suave: '#F1F5F9',
    icon: 'clock-outline',
  },
  {
    key: 'piezas',
    label: 'Pidiendo piezas',
    corto: 'Piezas',
    descripcion: 'Hemos diagnosticado el problema y estamos esperando las piezas.',
    color: '#F59E0B',
    suave: '#FEF3C7',
    icon: 'package-variant-closed',
  },
  {
    key: 'reparando',
    label: 'Arreglándose',
    corto: 'Reparando',
    descripcion: 'Nuestros mecánicos están trabajando en tu coche.',
    color: '#2F5BFF',
    suave: '#E0E7FF',
    icon: 'wrench',
  },
  {
    key: 'terminado',
    label: 'Terminado',
    corto: 'Listo',
    descripcion: '¡Tu coche está listo! Puedes pasar a recogerlo.',
    color: '#10B981',
    suave: '#D1FAE5',
    icon: 'check-decagram',
  },
  {
    key: 'entregado',
    label: 'Entregado',
    corto: 'Entregado',
    descripcion: 'El coche se ha entregado. ¡Gracias por confiar en nosotros!',
    color: '#8B5CF6',
    suave: '#EDE9FE',
    icon: 'key-variant',
  },
];

export const estadoInfo = (e: Estado) => ESTADOS.find((s) => s.key === e) ?? ESTADOS[0];
export const estadoIndex = (e: Estado) => ESTADOS.findIndex((s) => s.key === e);

export const COLORES_COCHE: { nombre: string; hex: string }[] = [
  { nombre: 'Blanco', hex: '#F8FAFC' },
  { nombre: 'Negro', hex: '#111827' },
  { nombre: 'Gris', hex: '#6B7280' },
  { nombre: 'Plata', hex: '#CBD5E1' },
  { nombre: 'Rojo', hex: '#DC2626' },
  { nombre: 'Azul', hex: '#2563EB' },
  { nombre: 'Verde', hex: '#16A34A' },
  { nombre: 'Amarillo', hex: '#FACC15' },
  { nombre: 'Naranja', hex: '#F97316' },
  { nombre: 'Marrón', hex: '#78350F' },
];

export const colorHex = (nombre?: string) => COLORES_COCHE.find((c) => c.nombre === nombre)?.hex;

export const sombraDe = (c: Colores) => ({
  shadowColor: '#000',
  shadowOpacity: c.sombra,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
});

// ---------- Utilidades de formato ----------
export const fmtFecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const fmtFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fmtEuros = (n?: number) =>
  n == null ? '—' : n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export function haceCuanto(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

export const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
