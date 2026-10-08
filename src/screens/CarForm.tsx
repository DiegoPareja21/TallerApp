import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClientPicker from '../components/ClientPicker';
import { Avatar, Btn, CarImage, exito, Field, Icon, SheetHeader, Tappable, Txt } from '../components/ui';
import { anioPorMatricula, normalizarMatricula } from '../matricula';
import { DatosDetectados, reconocerCoche, reconocimientoDisponible } from '../reconocimiento';
import { guardarFoto, useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { COLORES_COCHE } from '../theme';
import { Coche } from '../types';

type Props = { visible: boolean; coche?: Coche; clienteInicial?: string; onClose: () => void };

export default function CarForm({ visible, coche, clienteInicial, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {visible && <Formulario coche={coche} clienteInicial={clienteInicial} onClose={onClose} />}
    </Modal>
  );
}

type Escaneo = { estado: 'nada' } | { estado: 'analizando' } | { estado: 'ok'; datos: DatosDetectados } | { estado: 'error'; mensaje: string };

function Formulario({ coche, clienteInicial, onClose }: Omit<Props, 'visible'>) {
  const { crearCoche, editarCoche, users } = useStore();
  const { c, sombra } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();

  const [clienteId, setClienteId] = useState(coche?.userId ?? clienteInicial);
  const [elegirCliente, setElegirCliente] = useState(false);
  const [matricula, setMatricula] = useState(coche?.matricula ?? '');
  const [marca, setMarca] = useState(coche?.marca ?? '');
  const [modelo, setModelo] = useState(coche?.modelo ?? '');
  const [anio, setAnio] = useState(coche?.anio ?? '');
  const [anioAuto, setAnioAuto] = useState(!coche?.anio);
  const [km, setKm] = useState(coche?.km ?? '');
  const [color, setColor] = useState(coche?.color);
  const [problema, setProblema] = useState(coche?.problema ?? '');
  const [foto, setFoto] = useState(coche?.foto);
  const [dims, setDims] = useState({ ancho: 0, alto: 0 });
  const [escaneo, setEscaneo] = useState<Escaneo>({ estado: 'nada' });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cliente = users.find((u) => u.id === clienteId);

  // Al escribir la matrícula se recalcula el año, salvo que el mecánico lo haya puesto a mano
  const cambiarMatricula = (texto: string) => {
    setMatricula(texto);
    if (anioAuto) setAnio(anioPorMatricula(texto)?.toString() ?? '');
  };

  const cambiarAnio = (texto: string) => {
    setAnio(texto);
    setAnioAuto(texto === '');
  };

  const analizar = async (uri: string, ancho: number, alto: number) => {
    setEscaneo({ estado: 'analizando' });
    try {
      const d = await reconocerCoche(uri, ancho, alto);
      if (d.matricula) {
        setMatricula(d.matricula);
        const a = anioPorMatricula(d.matricula);
        if (a) {
          setAnio(String(a));
          setAnioAuto(true);
        }
      }
      if (d.marca) setMarca(d.marca);
      if (d.modelo) setModelo(d.modelo);
      if (d.color) setColor(d.color);
      setEscaneo({ estado: 'ok', datos: d });
      exito();
    } catch (e) {
      setEscaneo({ estado: 'error', mensaje: e instanceof Error ? e.message : 'No se pudo analizar la foto.' });
    }
  };

  const elegirFoto = async (camara: boolean) => {
    const permiso = camara
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return Alert.alert('Permiso necesario', 'Activa el permiso en los ajustes del teléfono.');
    const opciones: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9 };
    const r = camara ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones);
    const a = r.assets?.[0];
    if (r.canceled || !a) return;
    setFoto(a.uri);
    setDims({ ancho: a.width, alto: a.height });
    analizar(a.uri, a.width, a.height);
  };

  const guardar = async () => {
    setError(null);
    if (!clienteId) return setError('Elige el cliente al que pertenece el coche.');
    if (!matricula.trim() || !marca.trim() || !modelo.trim()) return setError('Matrícula, marca y modelo son obligatorios.');
    if (anio && !/^(19|20)\d{2}$/.test(anio)) return setError('El año no es válido.');
    setGuardando(true);
    const fotoFinal = foto && foto !== coche?.foto ? await guardarFoto(foto) : foto;
    const datos = {
      userId: clienteId,
      matricula: normalizarMatricula(matricula),
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: anio.trim() || undefined,
      km: km.replace(/\D/g, '') || undefined,
      color,
      problema: problema.trim() || undefined,
      foto: fotoFinal,
    };
    if (coche) editarCoche(coche.id, datos);
    else crearCoche(datos);
    exito();
    setGuardando(false);
    onClose();
  };

  const analizando = escaneo.estado === 'analizando';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader titulo={coche ? 'Editar coche' : 'Nuevo coche'} onClose={onClose} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
          {/* 1. Foto y escaneo */}
          <Paso n={1} titulo="Foto de la parte trasera" sub="Se leen la matrícula, la marca, el modelo y el color" />
          <View style={sombra}>
            <CarImage foto={foto} color={color} estado={coche?.estado ?? 'pendiente'} height={200} />
            {analizando && (
              <View style={s.overlay}>
                <ActivityIndicator color="#fff" size="large" />
                <Txt w="semibold" color="#fff" style={{ marginTop: 10 }}>
                  Leyendo matrícula y modelo…
                </Txt>
              </View>
            )}
            {!foto && !analizando && (
              <View style={s.marco} pointerEvents="none">
                <Icon name="line-scan" size={30} color={c.primary} />
                <Txt w="semibold" size={13} color={c.textSoft}>
                  Encuadra la parte trasera con la matrícula visible
                </Txt>
              </View>
            )}
          </View>
          <View style={s.fotoBtns}>
            <Btn title="Hacer foto" icon="camera-outline" onPress={() => elegirFoto(true)} disabled={analizando} style={{ flex: 1 }} small />
            <Btn title="Galería" icon="image-outline" variant="secondary" onPress={() => elegirFoto(false)} disabled={analizando} style={{ flex: 1 }} small />
          </View>
          {foto && !analizando && reconocimientoDisponible() && (
            <Tappable onPress={() => analizar(foto, dims.ancho, dims.alto)} style={s.reintentar}>
              <Icon name="refresh" size={16} color={c.primary} />
              <Txt w="semibold" size={13} color={c.primary}>
                Volver a analizar esta foto
              </Txt>
            </Tappable>
          )}
          <ResultadoEscaneo escaneo={escaneo} />

          {/* 2. Cliente */}
          <Paso n={2} titulo="Cliente" sub="El coche aparecerá en su app" />
          <Tappable onPress={() => setElegirCliente(true)} style={[s.cliente, !cliente && { borderStyle: 'dashed' }]}>
            {cliente ? (
              <>
                <Avatar nombre={cliente.nombre} />
                <View style={{ flex: 1 }}>
                  <Txt w="semibold">{cliente.nombre}</Txt>
                  <Txt size={13} color={c.textMuted} numberOfLines={1}>
                    {cliente.telefono || cliente.email}
                  </Txt>
                </View>
                <Txt w="semibold" size={13} color={c.primary}>
                  Cambiar
                </Txt>
              </>
            ) : (
              <>
                <View style={s.clienteIcon}>
                  <Icon name="account-plus-outline" size={22} color={c.primary} />
                </View>
                <Txt w="semibold" color={c.primary} style={{ flex: 1 }}>
                  Seleccionar cliente
                </Txt>
                <Icon name="chevron-right" size={22} color={c.primary} />
              </>
            )}
          </Tappable>

          {/* 3. Datos */}
          <Paso n={3} titulo="Datos del vehículo" sub="Revisa lo detectado y corrige si hace falta" />
          <Field
            label="Matrícula *"
            icon="card-text-outline"
            placeholder="1234 BCD"
            value={matricula}
            onChangeText={cambiarMatricula}
            onBlur={() => matricula && setMatricula(normalizarMatricula(matricula))}
            autoCapitalize="characters"
          />
          <View style={s.fila}>
            <View style={{ flex: 1 }}>
              <Field label="Marca *" placeholder="Seat" value={marca} onChangeText={setMarca} autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Modelo *" placeholder="Ibiza" value={modelo} onChangeText={setModelo} autoCapitalize="words" />
            </View>
          </View>
          <View style={s.fila}>
            <View style={{ flex: 1 }}>
              <Field label="Año" icon="calendar-outline" placeholder="2020" value={anio} onChangeText={cambiarAnio} keyboardType="number-pad" maxLength={4} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Kilómetros" icon="speedometer" placeholder="85000" value={km} onChangeText={setKm} keyboardType="number-pad" />
            </View>
          </View>
          {anioAuto && !!anio && (
            <View style={s.pista}>
              <Icon name="auto-fix" size={15} color={c.primary} />
              <Txt size={12} color={c.textSoft} style={{ flex: 1 }}>
                Año calculado por las letras de la matrícula (aproximado: es el año de matriculación).
              </Txt>
            </View>
          )}

          <Txt w="semibold" size={13} color={c.textSoft} style={{ marginBottom: 10, marginLeft: 2 }}>
            Color {color ? `· ${color}` : ''}
          </Txt>
          <View style={s.colores}>
            {COLORES_COCHE.map((col) => {
              const sel = color === col.nombre;
              return (
                <Tappable key={col.nombre} onPress={() => setColor(sel ? undefined : col.nombre)} style={[s.colorAro, sel && { borderColor: c.primary }]}>
                  <View style={[s.color, { backgroundColor: col.hex }]}>
                    {sel && <Icon name="check" size={16} color={['Blanco', 'Plata', 'Amarillo'].includes(col.nombre) ? '#0F172A' : '#fff'} />}
                  </View>
                </Tappable>
              );
            })}
          </View>

          <Field
            label="Motivo de la visita"
            icon="message-text-outline"
            placeholder="Ej: ruido al frenar, revisión de 30.000 km…"
            value={problema}
            onChangeText={setProblema}
            multiline
          />

          {error && (
            <View style={s.error}>
              <Icon name="alert-circle-outline" size={18} color={c.danger} />
              <Txt size={13} color={c.danger} style={{ flex: 1 }}>
                {error}
              </Txt>
            </View>
          )}

          <Btn
            title={coche ? 'Guardar cambios' : 'Dar de alta y avisar al cliente'}
            icon={coche ? 'check' : 'car-arrow-right'}
            onPress={guardar}
            loading={guardando}
            disabled={analizando}
            style={{ marginTop: 8 }}
          />
          {!coche && (
            <Txt size={12} color={c.textMuted} style={{ textAlign: 'center', marginTop: 10 }}>
              El cliente recibirá una notificación y verá el coche en su app.
            </Txt>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ClientPicker visible={elegirCliente} seleccionado={clienteId} onElegir={(u) => setClienteId(u.id)} onClose={() => setElegirCliente(false)} />
    </View>
  );
}

function Paso({ n, titulo, sub }: { n: number; titulo: string; sub: string }) {
  const { c } = useTema();
  const s = useS();
  return (
    <View style={s.paso}>
      <View style={s.pasoN}>
        <Txt w="bold" size={13} color="#fff">
          {n}
        </Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="bold" size={16}>
          {titulo}
        </Txt>
        <Txt size={12} color={c.textMuted}>
          {sub}
        </Txt>
      </View>
    </View>
  );
}

function ResultadoEscaneo({ escaneo }: { escaneo: Escaneo }) {
  const { c } = useTema();
  const s = useS();
  if (escaneo.estado === 'error') {
    return (
      <View style={[s.resultado, { backgroundColor: c.dangerSuave }]}>
        <Icon name="alert-circle-outline" size={20} color={c.danger} />
        <Txt size={13} color={c.danger} style={{ flex: 1 }}>
          {escaneo.mensaje}
        </Txt>
      </View>
    );
  }
  if (escaneo.estado !== 'ok') return null;
  const d = escaneo.datos;
  const detectados = [d.matricula && 'matrícula', d.marca && 'marca', d.modelo && 'modelo', d.color && 'color'].filter(Boolean);
  const dudoso = detectados.length < 4 || !d.colorSeguro;
  return (
    <View style={[s.resultado, { backgroundColor: dudoso ? '#F59E0B22' : c.successSuave }]}>
      <Icon name={dudoso ? 'alert-outline' : 'check-decagram'} size={20} color={dudoso ? '#D97706' : c.success} />
      <Txt size={13} color={dudoso ? '#B45309' : c.successTexto} style={{ flex: 1 }}>
        {detectados.length === 0
          ? 'No se ha podido identificar el coche. Prueba con otra foto o rellena los datos a mano.'
          : `Detectado: ${detectados.join(', ')}.${dudoso ? ' Revisa los datos (sobre todo el color) antes de guardar.' : ''}`}
      </Txt>
    </View>
  );
}

const useS = crearEstilos((c) => ({
  paso: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 12 },
  pasoN: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  overlay: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const),
    borderRadius: 18,
    backgroundColor: 'rgba(5,8,22,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marco: {
    ...({ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14 } as const),
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.primaryBorde,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
    gap: 4,
  },
  fotoBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  reintentar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  resultado: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, marginTop: 10 },
  cliente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: c.primaryBorde,
  },
  clienteIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primarySuave, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', gap: 12 },
  pista: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6, marginBottom: 14, marginLeft: 2 },
  colores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  colorAro: { padding: 3, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  color: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.dangerSuave, padding: 12, borderRadius: 12, marginBottom: 10 },
}));
