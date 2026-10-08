import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Historial, Stepper } from '../components/Timeline';
import {
  Avatar,
  Btn,
  Card,
  CarImage,
  Dato,
  exito,
  Field,
  Icon,
  IconBtn,
  Placa,
  SectionTitle,
  SheetHeader,
  StatusBadge,
  Tappable,
  Txt,
} from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { estadoInfo, ESTADOS, fmtEuros, fmtFecha, haceCuanto, TALLER } from '../theme';
import { Coche, Estado } from '../types';
import CarForm from './CarForm';

const soloDigitos = (t: string) => t.replace(/[^\d+]/g, '');
const llamar = (tel: string) => Linking.openURL(`tel:${soloDigitos(tel)}`).catch(() => {});
const whatsapp = (tel: string, texto: string) =>
  Linking.openURL(`https://wa.me/${soloDigitos(tel).replace('+', '')}?text=${encodeURIComponent(texto)}`).catch(() =>
    Alert.alert('No se pudo abrir WhatsApp')
  );

export default function CarDetail({ cocheId, onClose }: { cocheId: string | null; onClose: () => void }) {
  return (
    <Modal visible={!!cocheId} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {cocheId && <Detalle cocheId={cocheId} onClose={onClose} />}
    </Modal>
  );
}

function Detalle({ cocheId, onClose }: { cocheId: string; onClose: () => void }) {
  const { coches, user, users, borrarCoche } = useStore();
  const { c, sombra, suave } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [editando, setEditando] = useState(false);
  const coche = coches.find((x) => x.id === cocheId);

  useEffect(() => {
    if (!coche) onClose();
  }, [coche, onClose]);
  if (!coche || !user) return null;

  const esTaller = user.rol === 'taller';
  const dueño = users.find((u) => u.id === coche.userId);
  const e = estadoInfo(coche.estado);

  const eliminar = () =>
    Alert.alert('Eliminar coche', `¿Seguro que quieres eliminar el ${coche.marca} ${coche.modelo}? Se perderá su historial y el cliente dejará de verlo.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => borrarCoche(coche.id) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader
        titulo={`${coche.marca} ${coche.modelo}`}
        onClose={onClose}
        right={esTaller ? <IconBtn icon="pencil-outline" onPress={() => setEditando(true)} /> : undefined}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* Imagen y cabecera */}
          <View style={sombra}>
            <CarImage foto={coche.foto} color={coche.color} estado={coche.estado} height={210} radius={24} />
            <View style={s.badgeFoto}>
              <StatusBadge estado={coche.estado} solid />
            </View>
          </View>
          <View style={s.titulo}>
            <View style={{ flex: 1 }}>
              <Txt w="black" size={24}>
                {coche.marca} {coche.modelo}
              </Txt>
              <Txt size={13} color={c.textMuted} style={{ marginTop: 2 }}>
                Actualizado {haceCuanto(coche.actualizado)}
              </Txt>
            </View>
            <Placa matricula={coche.matricula} size="lg" />
          </View>

          {/* Estado actual destacado */}
          <View style={[s.estadoCard, { backgroundColor: suave(e), borderColor: e.color + '55' }]}>
            <View style={[s.estadoIcon, { backgroundColor: e.color }]}>
              <Icon name={e.icon} size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="bold" size={17} color={e.color}>
                {e.label}
              </Txt>
              <Txt size={13} color={c.textSoft} style={{ marginTop: 2, lineHeight: 19 }}>
                {e.descripcion}
              </Txt>
            </View>
          </View>

          {/* Presupuesto y entrega */}
          <View style={s.grid}>
            <Dato icon="cash-multiple" label="Presupuesto" valor={fmtEuros(coche.presupuesto)} />
            <Dato icon="calendar-check-outline" label="Entrega estimada" valor={fmtFecha(coche.entregaEstimada)} />
          </View>

          {esTaller ? (
            <PanelTaller coche={coche} />
          ) : (
            <>
              <SectionTitle>Seguimiento</SectionTitle>
              <Card>
                <Stepper coche={coche} />
              </Card>
            </>
          )}

          {/* Cliente (solo taller) */}
          {esTaller && dueño && (
            <>
              <SectionTitle>Cliente</SectionTitle>
              <Card style={s.cliente}>
                <Avatar nombre={dueño.nombre} size={48} />
                <View style={{ flex: 1 }}>
                  <Txt w="bold">{dueño.nombre}</Txt>
                  <Txt size={13} color={c.textMuted}>
                    {dueño.telefono || dueño.email}
                  </Txt>
                </View>
                {!!dueño.telefono && (
                  <>
                    <IconBtn
                      icon="whatsapp"
                      color="#25D366"
                      onPress={() =>
                        whatsapp(
                          dueño.telefono,
                          `Hola ${dueño.nombre.split(' ')[0]}, te escribimos de ${TALLER.nombre} sobre tu ${coche.marca} ${coche.modelo} (${coche.matricula}).`
                        )
                      }
                    />
                    <IconBtn icon="phone" color={c.primary} onPress={() => llamar(dueño.telefono)} />
                  </>
                )}
              </Card>
            </>
          )}

          {/* Datos del vehículo */}
          <SectionTitle>Vehículo</SectionTitle>
          <View style={s.grid}>
            <Dato icon="calendar-outline" label="Año" valor={coche.anio ?? '—'} />
            <Dato icon="speedometer" label="Kilómetros" valor={coche.km ? `${Number(coche.km).toLocaleString('es-ES')} km` : '—'} />
            <Dato icon="palette-outline" label="Color" valor={coche.color ?? '—'} />
          </View>
          {coche.problema ? (
            <Card style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <Icon name="message-alert-outline" size={18} color={c.accent} />
                <Txt w="semibold" size={14}>
                  Motivo de la visita
                </Txt>
              </View>
              <Txt color={c.textSoft} style={{ lineHeight: 21 }}>
                {coche.problema}
              </Txt>
            </Card>
          ) : null}

          {/* Historial */}
          <SectionTitle>Historial</SectionTitle>
          <Card style={{ paddingVertical: 6 }}>
            <Historial coche={coche} />
          </Card>

          {/* Contacto y acciones del cliente */}
          {!esTaller && (
            <>
              <SectionTitle>{TALLER.nombre}</SectionTitle>
              <Card style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Icon name="map-marker-outline" size={20} color={c.primary} />
                  <Txt color={c.textSoft} style={{ flex: 1 }}>
                    {TALLER.direccion}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Btn title="Llamar" icon="phone" variant="secondary" small onPress={() => llamar(TALLER.telefono)} style={{ flex: 1 }} />
                  <Btn
                    title="WhatsApp"
                    icon="whatsapp"
                    variant="success"
                    small
                    onPress={() => whatsapp(TALLER.telefono, `Hola, quería preguntar por mi ${coche.marca} ${coche.modelo} (${coche.matricula}).`)}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            </>
          )}

          {esTaller && (
            <Tappable onPress={eliminar} style={s.eliminar}>
              <Icon name="trash-can-outline" size={18} color={c.danger} />
              <Txt w="semibold" color={c.danger}>
                Eliminar coche
              </Txt>
            </Tappable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CarForm visible={editando} coche={coche} onClose={() => setEditando(false)} />
    </View>
  );
}

// ---------- Panel de gestión del taller ----------
const ATAJOS_FECHA = [
  { label: 'Hoy', dias: 0 },
  { label: 'Mañana', dias: 1 },
  { label: '3 días', dias: 3 },
  { label: '1 semana', dias: 7 },
];

const mismoDia = (a?: string, b?: string) => !!a && !!b && new Date(a).toDateString() === new Date(b).toDateString();

function PanelTaller({ coche }: { coche: Coche }) {
  const { actualizarTaller } = useStore();
  const { c, suave } = useTema();
  const s = useS();
  const [estado, setEstado] = useState<Estado>(coche.estado);
  const [nota, setNota] = useState('');
  const [presupuesto, setPresupuesto] = useState(coche.presupuesto != null ? String(coche.presupuesto).replace('.', ',') : '');
  const [entrega, setEntrega] = useState(coche.entregaEstimada);

  const guardar = () => {
    const p = presupuesto.trim() ? Number(presupuesto.replace(',', '.')) : undefined;
    if (p != null && (isNaN(p) || p < 0)) return Alert.alert('Presupuesto no válido');
    actualizarTaller(coche.id, { estado, nota, presupuesto: p, entregaEstimada: entrega });
    exito();
    setNota('');
    Alert.alert(
      'Cambios guardados',
      estado !== coche.estado || nota.trim()
        ? `El coche ahora está en «${estadoInfo(estado).label}» y se ha notificado al cliente.`
        : 'Los datos del coche se han actualizado.'
    );
  };

  return (
    <>
      <SectionTitle>Actualizar estado</SectionTitle>
      <Card>
        <View style={s.estados}>
          {ESTADOS.map((op) => {
            const sel = estado === op.key;
            return (
              <Tappable
                key={op.key}
                onPress={() => setEstado(op.key)}
                style={[s.opcion, { borderColor: sel ? op.color : c.border, backgroundColor: sel ? suave(op) : c.card }]}
              >
                <View style={[s.opcionIcon, { backgroundColor: sel ? op.color : c.bg }]}>
                  <Icon name={op.icon} size={18} color={sel ? '#fff' : op.color} />
                </View>
                <Txt w="semibold" size={13} color={sel ? op.color : c.text} style={{ flex: 1 }}>
                  {op.label}
                </Txt>
                {sel && <Icon name="check-circle" size={18} color={op.color} />}
              </Tappable>
            );
          })}
        </View>

        <View style={{ height: 16 }} />
        <Field
          label="Nota para el cliente (opcional)"
          icon="message-processing-outline"
          placeholder="Ej: Han llegado las piezas, lo tendremos mañana."
          value={nota}
          onChangeText={setNota}
          multiline
        />
        <Field
          label="Presupuesto (€)"
          icon="currency-eur"
          placeholder="0,00"
          value={presupuesto}
          onChangeText={setPresupuesto}
          keyboardType="decimal-pad"
        />

        <Txt w="semibold" size={13} color={c.textSoft} style={{ marginBottom: 8, marginLeft: 2 }}>
          Entrega estimada {entrega ? `· ${fmtFecha(entrega)}` : ''}
        </Txt>
        <View style={s.chips}>
          {ATAJOS_FECHA.map((a) => {
            const fecha = new Date(Date.now() + a.dias * 86400_000).toISOString();
            const sel = mismoDia(entrega, fecha);
            return (
              <Tappable key={a.label} onPress={() => setEntrega(sel ? undefined : fecha)} style={[s.chip, sel && s.chipSel]}>
                <Txt w="semibold" size={13} color={sel ? '#fff' : c.textSoft}>
                  {a.label}
                </Txt>
              </Tappable>
            );
          })}
        </View>

        <Btn
          title={estado === 'terminado' && coche.estado !== 'terminado' ? 'Marcar listo y avisar' : 'Guardar y notificar'}
          icon={estado === 'terminado' ? 'bell-ring-outline' : 'content-save-outline'}
          variant={estado === 'terminado' ? 'success' : 'primary'}
          onPress={guardar}
          style={{ marginTop: 18 }}
        />
      </Card>
    </>
  );
}

const useS = crearEstilos((c) => ({
  badgeFoto: { position: 'absolute', top: 14, left: 14 },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  estadoCard: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginTop: 18 },
  estadoIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  cliente: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eliminar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 12 },
  estados: { gap: 8 },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1.5 },
  opcionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border },
  chipSel: { backgroundColor: c.primary, borderColor: c.primary },
}));
