import { useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CarCard from '../components/CarCard';
import { Avatar, BotonTema, Empty, GradientHeader, Icon, IconBtn, Tappable, Txt } from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import CarDetail from './CarDetail';
import Inbox from './Inbox';

const saludo = () => {
  const h = new Date().getHours();
  return h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
};

export default function ClientHome() {
  const { user, coches, avisos, salir } = useStore();
  const { c, sombra } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [abierto, setAbierto] = useState<string | null>(null);
  const [inbox, setInbox] = useState(false);
  if (!user) return null;

  const mios = coches.filter((x) => x.userId === user.id).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const listos = mios.filter((x) => x.estado === 'terminado');
  const enTaller = mios.filter((x) => x.estado !== 'entregado' && x.estado !== 'terminado').length;
  const sinLeer = avisos.filter((a) => a.userId === user.id && !a.leido).length;

  const cerrarSesion = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: salir },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={mios}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        ListHeaderComponent={
          <>
            <GradientHeader style={{ paddingBottom: 56 }}>
              <View style={s.top}>
                <Avatar nombre={user.nombre} light />
                <View style={{ flex: 1 }}>
                  <Txt size={13} color="rgba(255,255,255,0.7)">
                    {saludo()} 👋
                  </Txt>
                  <Txt w="bold" size={20} color="#fff" numberOfLines={1}>
                    {user.nombre.split(' ')[0]}
                  </Txt>
                </View>
                <BotonTema light />
                <IconBtn icon="bell-outline" light badge={sinLeer} onPress={() => setInbox(true)} />
                <IconBtn icon="logout" light onPress={cerrarSesion} />
              </View>
              <Txt w="black" size={26} color="#fff" style={{ marginTop: 24 }}>
                Mis coches
              </Txt>
              <Txt color="rgba(255,255,255,0.75)" style={{ marginTop: 4 }}>
                {mios.length === 0
                  ? 'Aquí verás tus coches cuando entren al taller'
                  : `${mios.length} ${mios.length === 1 ? 'coche' : 'coches'} · ${enTaller} en el taller`}
              </Txt>
            </GradientHeader>

            <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
              {listos.length > 0 && (
                <Tappable onPress={() => setAbierto(listos[0].id)} style={[s.listo, sombra]}>
                  <View style={s.listoIcon}>
                    <Icon name="party-popper" size={26} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt w="bold" size={16} color={c.successTexto}>
                      {listos.length === 1 ? '¡Tu coche está listo!' : `¡${listos.length} coches listos!`}
                    </Txt>
                    <Txt size={13} color={c.successTexto2}>
                      {listos.map((x) => `${x.marca} ${x.modelo}`).join(', ')} · pasa a recogerlo
                    </Txt>
                  </View>
                  <Icon name="chevron-right" size={22} color={c.successTexto2} />
                </Tappable>
              )}
              {mios.length === 0 && (
                <View style={[s.vacio, sombra]}>
                  <Empty
                    icon="car-clock"
                    titulo="Aún no tienes coches en el taller"
                    texto={`Cuando lleves tu coche, el mecánico lo registrará con tu cuenta (${user.email}) y podrás seguir la reparación paso a paso.`}
                  />
                </View>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <CarCard coche={item} onPress={() => setAbierto(item.id)} />
          </View>
        )}
      />

      <CarDetail cocheId={abierto} onClose={() => setAbierto(null)} />
      <Inbox visible={inbox} onClose={() => setInbox(false)} onAbrirCoche={(id) => setTimeout(() => setAbierto(id), 450)} />
    </View>
  );
}

const useS = crearEstilos((c) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.successSuave,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.successBorde,
  },
  listoIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: c.success, alignItems: 'center', justifyContent: 'center' },
  vacio: { backgroundColor: c.card, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: c.cardBorder },
}));
