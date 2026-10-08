import { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CarCard from '../components/CarCard';
import { Avatar, BotonTema, Empty, GradientHeader, Icon, IconBtn, Tappable, Txt } from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { ESTADOS, F, IconName, TALLER } from '../theme';
import { Estado } from '../types';
import CarDetail from './CarDetail';
import CarForm from './CarForm';
import ClientsScreen from './ClientsScreen';

type Filtro = Estado | 'activos' | 'todos';

export default function WorkshopHome() {
  const { user, users, coches, salir } = useStore();
  const { c, sombra, oscuro } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState<Filtro>('activos');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [clientes, setClientes] = useState(false);

  const nombreDe = (id: string) => users.find((u) => u.id === id)?.nombre ?? 'Cliente';

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return coches
      .filter((x) => (filtro === 'todos' ? true : filtro === 'activos' ? x.estado !== 'entregado' : x.estado === filtro))
      .filter(
        (x) =>
          !q ||
          `${x.matricula} ${x.marca} ${x.modelo} ${users.find((u) => u.id === x.userId)?.nombre ?? ''}`.toLowerCase().includes(q)
      )
      .sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  }, [coches, users, filtro, busqueda]);

  if (!user) return null;

  const cuenta = (e: Estado) => coches.filter((x) => x.estado === e).length;
  const activos = coches.filter((x) => x.estado !== 'entregado').length;
  const ingresos = coches
    .filter((x) => x.estado === 'terminado' || x.estado === 'entregado')
    .reduce((t, x) => t + (x.presupuesto ?? 0), 0);

  const cerrarSesion = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: salir },
    ]);

  const filtros: { key: Filtro; label: string; n: number; color: string }[] = [
    { key: 'activos', label: 'Activos', n: activos, color: c.primary },
    ...ESTADOS.map((e) => ({ key: e.key as Filtro, label: e.corto, n: cuenta(e.key), color: e.color })),
    { key: 'todos', label: 'Todos', n: coches.length, color: oscuro ? '#475569' : '#0F172A' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={lista}
        keyExtractor={(x) => x.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        ListHeaderComponent={
          <>
            <GradientHeader style={{ paddingBottom: 60 }}>
              <View style={s.top}>
                <Avatar nombre={user.nombre} light />
                <View style={{ flex: 1 }}>
                  <Txt size={13} color="rgba(255,255,255,0.7)" numberOfLines={1}>
                    {TALLER.nombre} · Panel del taller
                  </Txt>
                  <Txt w="bold" size={20} color="#fff" numberOfLines={1}>
                    {user.nombre}
                  </Txt>
                </View>
                <IconBtn icon="account-group-outline" light onPress={() => setClientes(true)} />
                <BotonTema light />
                <IconBtn icon="logout" light onPress={cerrarSesion} />
              </View>

              <View style={s.kpis}>
                <Kpi valor={String(activos)} label="En taller" icon="garage-open-variant" />
                <Kpi valor={String(cuenta('terminado'))} label="Por recoger" icon="check-decagram" />
                <Kpi valor={`${Math.round(ingresos).toLocaleString('es-ES')} €`} label="Facturado" icon="cash-multiple" />
              </View>
            </GradientHeader>

            <View style={{ paddingHorizontal: 20, marginTop: -30 }}>
              <View style={[s.buscar, sombra]}>
                <Icon name="magnify" size={22} color={c.textMuted} />
                <TextInput
                  placeholder="Buscar matrícula, marca o cliente"
                  placeholderTextColor={c.textMuted}
                  keyboardAppearance={oscuro ? 'dark' : 'light'}
                  selectionColor={c.primary}
                  value={busqueda}
                  onChangeText={setBusqueda}
                  style={s.buscarInput}
                />
                {!!busqueda && (
                  <Tappable onPress={() => setBusqueda('')} hitSlop={10}>
                    <Icon name="close-circle" size={20} color={c.textMuted} />
                  </Tappable>
                )}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtros} keyboardShouldPersistTaps="handled">
              {filtros.map((f) => {
                const sel = filtro === f.key;
                return (
                  <Tappable key={f.key} onPress={() => setFiltro(f.key)} style={[s.filtro, sel && { backgroundColor: f.color, borderColor: f.color }]}>
                    <Txt w="semibold" size={13} color={sel ? '#fff' : c.textSoft}>
                      {f.label}
                    </Txt>
                    <View style={[s.contador, { backgroundColor: sel ? 'rgba(255,255,255,0.25)' : c.bg }]}>
                      <Txt w="bold" size={11} color={sel ? '#fff' : c.textSoft}>
                        {f.n}
                      </Txt>
                    </View>
                  </Tappable>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <Empty
            icon={busqueda ? 'magnify-close' : 'garage-variant'}
            titulo={busqueda ? 'Sin resultados' : 'No hay coches aquí'}
            texto={busqueda ? 'Prueba con otra matrícula o nombre.' : 'Pulsa «Nuevo coche», hazle una foto a la parte trasera y asígnalo a su cliente.'}
          />
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <CarCard coche={item} dueño={nombreDe(item.userId)} onPress={() => setAbierto(item.id)} />
          </View>
        )}
      />
      <Tappable onPress={() => setNuevo(true)} style={[s.fab, sombra, { bottom: insets.bottom + 24 }]}>
        <Icon name="camera-plus-outline" size={22} color="#fff" />
        <Txt w="bold" color="#fff">
          Nuevo coche
        </Txt>
      </Tappable>

      <CarForm visible={nuevo} onClose={() => setNuevo(false)} />
      <CarDetail cocheId={abierto} onClose={() => setAbierto(null)} />
      <ClientsScreen visible={clientes} onClose={() => setClientes(false)} onAbrirCoche={(id) => setTimeout(() => setAbierto(id), 450)} />
    </View>
  );
}

function Kpi({ valor, label, icon }: { valor: string; label: string; icon: IconName }) {
  const s = useS();
  return (
    <View style={s.kpi}>
      <Icon name={icon} size={20} color="rgba(255,255,255,0.85)" />
      <Txt w="black" size={20} color="#fff" numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 6 }}>
        {valor}
      </Txt>
      <Txt size={12} color="rgba(255,255,255,0.7)">
        {label}
      </Txt>
    </View>
  );
}

const useS = crearEstilos((c) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kpis: { flexDirection: 'row', gap: 10, marginTop: 24 },
  kpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: 12,
  },
  buscar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  buscarInput: { flex: 1, fontFamily: F.medium, fontSize: 15, color: c.text },
  filtros: { gap: 8, paddingHorizontal: 20, paddingVertical: 16 },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    paddingLeft: 14,
    paddingRight: 8,
    height: 38,
    borderRadius: 19,
  },
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.primary,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
  },
  contador: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
}));
