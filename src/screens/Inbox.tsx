import { useEffect } from 'react';
import { FlatList, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Empty, Icon, SheetHeader, Tappable, Txt } from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { estadoInfo, haceCuanto } from '../theme';

export default function Inbox({
  visible,
  onClose,
  onAbrirCoche,
}: {
  visible: boolean;
  onClose: () => void;
  onAbrirCoche: (id: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {visible && <Lista onClose={onClose} onAbrirCoche={onAbrirCoche} />}
    </Modal>
  );
}

function Lista({ onClose, onAbrirCoche }: { onClose: () => void; onAbrirCoche: (id: string) => void }) {
  const { avisos, user, coches, marcarAvisosLeidos } = useStore();
  const { c, sombra, suave } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const mios = avisos.filter((a) => a.userId === user?.id);

  // Se marcan como leídos al cerrar, para que el usuario vea cuáles eran nuevos
  useEffect(() => () => marcarAvisosLeidos(), [marcarAvisosLeidos]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader titulo="Notificaciones" onClose={onClose} />
      <FlatList
        data={mios}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: insets.bottom + 20, gap: 10 }}
        ListEmptyComponent={
          <Empty icon="bell-sleep-outline" titulo="Sin notificaciones" texto="Aquí verás los avisos del taller sobre tus coches." />
        }
        renderItem={({ item }) => {
          const e = estadoInfo(item.estado);
          const existe = coches.some((x) => x.id === item.cocheId);
          return (
            <Tappable
              disabled={!existe}
              onPress={() => {
                onClose();
                onAbrirCoche(item.cocheId);
              }}
              style={[s.aviso, sombra, !item.leido && s.nuevo]}
            >
              <View style={[s.icono, { backgroundColor: suave(e) }]}>
                <Icon name={e.icon} size={22} color={e.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Txt w="bold" size={14} style={{ flex: 1 }}>
                    {item.titulo}
                  </Txt>
                  <Txt size={12} color={c.textMuted}>
                    {haceCuanto(item.fecha)}
                  </Txt>
                </View>
                <Txt size={13} color={c.textSoft} style={{ marginTop: 3, lineHeight: 19 }}>
                  {item.cuerpo}
                </Txt>
              </View>
              {!item.leido && <View style={s.punto} />}
            </Tappable>
          );
        }}
      />
    </View>
  );
}

const useS = crearEstilos((c) => ({
  aviso: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: c.cardBorder,
  },
  nuevo: { borderLeftWidth: 4, borderLeftColor: c.accent },
  icono: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  punto: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.accent, marginTop: 4 },
}));
