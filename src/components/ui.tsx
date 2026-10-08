import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { crearEstilos, ModoTema, useTema } from '../tema';
import { colorHex, estadoIndex, estadoInfo, ESTADOS, F, IconName, iniciales } from '../theme';
import { Estado } from '../types';

export const Icon = MaterialCommunityIcons;

export const tap = () => Haptics.selectionAsync().catch(() => {});
export const exito = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

// ---------- Texto ----------
type TxtProps = TextProps & { w?: keyof typeof F; size?: number; color?: string };
export function Txt({ w = 'regular', size = 15, color, style, ...p }: TxtProps) {
  const { c } = useTema();
  return <Text {...p} style={[{ fontFamily: F[w], fontSize: size, color: color ?? c.text }, style]} />;
}

// ---------- Pressable con efecto de pulsación ----------
export function Tappable({ style, onPress, ...p }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...p}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
    />
  );
}

// ---------- Botón ----------
type BtnProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
};
export function Btn({ title, onPress, icon, variant = 'primary', loading, disabled, style, small }: BtnProps) {
  const { c, sombra } = useTema();
  const s = useS();
  const fg = variant === 'secondary' ? c.primary : variant === 'ghost' ? c.textSoft : '#fff';
  const contenido = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <View style={s.btnRow}>
      {icon && <Icon name={icon} size={small ? 16 : 20} color={fg} />}
      <Txt w="semibold" size={small ? 13 : 16} color={fg}>
        {title}
      </Txt>
    </View>
  );
  const base = [s.btn, small && s.btnSmall, (disabled || loading) && { opacity: 0.6 }];
  const grad: Record<string, [string, string]> = {
    primary: [c.primary, c.primaryDark],
    danger: ['#F87171', '#DC2626'],
    success: ['#34D399', '#059669'],
  };

  return (
    <Tappable onPress={onPress} disabled={disabled || loading} style={style}>
      {grad[variant] ? (
        <LinearGradient colors={grad[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[base, sombra]}>
          {contenido}
        </LinearGradient>
      ) : (
        <View style={[base, variant === 'secondary' ? s.btnSecondary : s.btnGhost]}>{contenido}</View>
      )}
    </Tappable>
  );
}

// ---------- Campo de texto ----------
type FieldProps = TextInputProps & { label?: string; icon?: IconName; right?: ReactNode };
export function Field({ label, icon, right, style, ...p }: FieldProps) {
  const { c, oscuro } = useTema();
  const s = useS();
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Txt w="semibold" size={13} color={c.textSoft} style={{ marginBottom: 6, marginLeft: 2 }}>
          {label}
        </Txt>
      )}
      <View style={[s.field, foco && s.fieldFoco, p.multiline && { alignItems: 'flex-start', paddingVertical: 12 }]}>
        {icon && <Icon name={icon} size={20} color={foco ? c.primary : c.textMuted} style={{ marginRight: 10 }} />}
        <TextInput
          placeholderTextColor={c.textMuted}
          keyboardAppearance={oscuro ? 'dark' : 'light'}
          selectionColor={c.primary}
          {...p}
          onFocus={(e) => {
            setFoco(true);
            p.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            p.onBlur?.(e);
          }}
          style={[s.input, p.multiline && { minHeight: 80, textAlignVertical: 'top' }, style]}
        />
        {right}
      </View>
    </View>
  );
}

// ---------- Tarjeta ----------
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { sombra } = useTema();
  const s = useS();
  return <View style={[s.card, sombra, style]}>{children}</View>;
}

// ---------- Insignia de estado ----------
export function StatusBadge({ estado, solid }: { estado: Estado; solid?: boolean }) {
  const { suave } = useTema();
  const s = useS();
  const e = estadoInfo(estado);
  return (
    <View style={[s.badge, { backgroundColor: solid ? e.color : suave(e) }]}>
      <Icon name={e.icon} size={14} color={solid ? '#fff' : e.color} />
      <Txt w="bold" size={12} color={solid ? '#fff' : e.color}>
        {e.corto}
      </Txt>
    </View>
  );
}

// ---------- Matrícula europea (siempre blanca, como las reales) ----------
export function Placa({ matricula, size = 'md' }: { matricula: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = useS();
  const fs = size === 'lg' ? 22 : size === 'sm' ? 12 : 15;
  return (
    <View style={[s.placa, size === 'lg' && { height: 40 }, size === 'sm' && { height: 22 }]}>
      <View style={[s.placaEu, size === 'lg' && { width: 22 }]}>
        <Txt w="bold" size={size === 'lg' ? 11 : 8} color="#fff">
          E
        </Txt>
      </View>
      <Txt w="black" size={fs} color="#0F172A" style={{ paddingHorizontal: size === 'lg' ? 12 : 7, letterSpacing: 1.5 }}>
        {matricula}
      </Txt>
    </View>
  );
}

// ---------- Avatar ----------
export function Avatar({ nombre, size = 44, light }: { nombre: string; size?: number; light?: boolean }) {
  const { c } = useTema();
  return (
    <LinearGradient
      colors={light ? ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.12)'] : ['#6D8BFF', c.primary]}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt w="bold" size={size * 0.38} color="#fff">
        {iniciales(nombre)}
      </Txt>
    </LinearGradient>
  );
}

// ---------- Imagen del coche (foto o ilustración) ----------
export function CarImage({
  foto,
  color,
  estado,
  height = 160,
  radius = 18,
}: {
  foto?: string;
  color?: string;
  estado: Estado;
  height?: number;
  radius?: number;
}) {
  const { c, oscuro, suave } = useTema();
  const e = estadoInfo(estado);
  if (foto) {
    return <Image source={{ uri: foto }} style={{ height, borderRadius: radius, width: '100%' }} contentFit="cover" transition={250} />;
  }
  const tinte = colorHex(color) ?? (oscuro ? '#94A3B8' : '#CBD5E1');
  return (
    <LinearGradient
      colors={[suave(e), oscuro ? c.card : '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height, borderRadius: radius, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          backgroundColor: e.color,
          opacity: oscuro ? 0.12 : 0.08,
          width: height * 1.4,
          height: height * 1.4,
          borderRadius: height,
        }}
      />
      <Icon
        name="car-sports"
        size={height * 0.6}
        color={tinte}
        style={{ textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 3 } }}
      />
    </LinearGradient>
  );
}

// ---------- Barra de progreso por pasos ----------
export function Progreso({ estado }: { estado: Estado }) {
  const { c } = useTema();
  const idx = estadoIndex(estado);
  const info = estadoInfo(estado);
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {ESTADOS.slice(0, 4).map((p, i) => (
        <View key={p.key} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= idx ? info.color : c.border }} />
      ))}
    </View>
  );
}

// ---------- Estado vacío ----------
export function Empty({ icon, titulo, texto, children }: { icon: IconName; titulo: string; texto: string; children?: ReactNode }) {
  const { c } = useTema();
  const s = useS();
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={42} color={c.primary} />
      </View>
      <Txt w="bold" size={18} style={{ textAlign: 'center' }}>
        {titulo}
      </Txt>
      <Txt color={c.textSoft} style={{ textAlign: 'center', marginTop: 6, lineHeight: 21 }}>
        {texto}
      </Txt>
      {children}
    </View>
  );
}

// ---------- Cabecera con degradado ----------
export function GradientHeader({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTema();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[c.headerFrom, c.headerTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden' }, style]}
    >
      <StatusBar style="light" />
      <View style={{ position: 'absolute', backgroundColor: '#fff', width: 260, height: 260, borderRadius: 130, top: -90, right: -80, opacity: 0.1 }} />
      <View style={{ position: 'absolute', backgroundColor: '#fff', width: 160, height: 160, borderRadius: 80, bottom: -70, left: -40, opacity: 0.07 }} />
      {children}
    </LinearGradient>
  );
}

// ---------- Botón redondo de icono ----------
export function IconBtn({
  icon,
  onPress,
  badge,
  light,
  color,
}: {
  icon: IconName;
  onPress: () => void;
  badge?: number;
  light?: boolean;
  color?: string;
}) {
  const { c, sombra } = useTema();
  const s = useS();
  return (
    <Tappable onPress={onPress} style={[s.iconBtn, light ? s.iconBtnLight : [s.iconBtnSolid, sombra]]}>
      <Icon name={icon} size={22} color={color ?? (light ? '#fff' : c.text)} />
      {!!badge && (
        <View style={s.dot}>
          <Txt w="bold" size={10} color="#fff">
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      )}
    </Tappable>
  );
}

// ---------- Selector de tema (claro / oscuro / automático) ----------
export function BotonTema({ light }: { light?: boolean }) {
  const { modo, setModo, oscuro } = useTema();
  const opciones: { m: ModoTema; t: string }[] = [
    { m: 'sistema', t: 'Automático (como el móvil)' },
    { m: 'claro', t: 'Claro' },
    { m: 'oscuro', t: 'Oscuro' },
  ];
  const abrir = () =>
    Alert.alert(
      'Apariencia',
      'Elige cómo quieres ver la app',
      opciones.map((o) => ({ text: `${o.m === modo ? '✓ ' : ''}${o.t}`, onPress: () => setModo(o.m) })),
      { cancelable: true }
    );
  return <IconBtn icon={oscuro ? 'weather-night' : 'white-balance-sunny'} light={light} onPress={abrir} />;
}

// ---------- Cabecera de hoja modal ----------
export function SheetHeader({ titulo, onClose, right }: { titulo: string; onClose: () => void; right?: ReactNode }) {
  const { oscuro } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.sheetHeader, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
      <StatusBar style={oscuro ? 'light' : 'dark'} />
      <IconBtn icon="close" onPress={onClose} />
      <Txt w="bold" size={17} numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
        {titulo}
      </Txt>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// ---------- Fila de dato ----------
export function Dato({ icon, label, valor }: { icon: IconName; label: string; valor: string }) {
  const { c } = useTema();
  const s = useS();
  return (
    <View style={s.dato}>
      <View style={s.datoIcon}>
        <Icon name={icon} size={18} color={c.primary} />
      </View>
      <Txt size={12} color={c.textMuted}>
        {label}
      </Txt>
      <Txt w="semibold" size={14} numberOfLines={1}>
        {valor}
      </Txt>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const s = useS();
  return (
    <View style={s.section}>
      <Txt w="bold" size={17}>
        {children}
      </Txt>
      {right}
    </View>
  );
}

const useS = crearEstilos((c) => ({
  btn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnSmall: { height: 40, borderRadius: 12, paddingHorizontal: 14 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnSecondary: { backgroundColor: c.primarySuave, borderWidth: 1, borderColor: c.primaryBorde },
  btnGhost: { backgroundColor: 'transparent' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.input,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  fieldFoco: { borderColor: c.primary, backgroundColor: c.inputFoco },
  input: { flex: 1, fontFamily: F.medium, fontSize: 15, color: c.text, paddingVertical: 0 },
  card: { backgroundColor: c.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: c.cardBorder },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  placa: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
    height: 28,
  },
  placaEu: { backgroundColor: '#1D4ED8', alignSelf: 'stretch', width: 14, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: c.primarySuave, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconBtnSolid: { backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder },
  iconBtnLight: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: c.headerTo,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: c.bg },
  dato: { flex: 1, minWidth: '30%', backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12, gap: 2 },
  datoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: c.primarySuave, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 },
}));
