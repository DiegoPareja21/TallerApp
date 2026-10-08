import { useState } from 'react';
import { FlatList, Linking, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clientesDe, coincide } from '../components/ClientPicker';
import { Avatar, Btn, Empty, Field, IconBtn, Placa, SheetHeader, StatusBadge, Tappable, Txt } from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { fmtFecha, TALLER } from '../theme';
import CarForm from './CarForm';

const soloDigitos = (t: string) => t.replace(/[^\d+]/g, '');

export default function ClientsScreen({
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
  const { users, coches } = useStore();
  const { c, sombra } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [altaPara, setAltaPara] = useState<string | null>(null);
  const lista = clientesDe(users).filter((u) => coincide(u, q));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader titulo={`Clientes (${clientesDe(users).length})`} onClose={onClose} />
      <View style={{ paddingHorizontal: 20 }}>
        <Field icon="magnify" placeholder="Buscar por nombre, email o teléfono" value={q} onChangeText={setQ} autoCapitalize="none" />
      </View>
      <FlatList
        data={lista}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 12 }}
        ListEmptyComponent={
          <Empty
            icon="account-group-outline"
            titulo={q ? 'Sin resultados' : 'Aún no hay clientes'}
            texto={q ? 'Prueba con otro nombre o teléfono.' : 'Los clientes aparecerán aquí cuando creen su cuenta en la app.'}
          />
        }
        renderItem={({ item }) => {
          const suyos = coches.filter((x) => x.userId === item.id).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
          return (
            <View style={[s.card, sombra]}>
              <View style={s.cabecera}>
                <Avatar nombre={item.nombre} size={46} />
                <View style={{ flex: 1 }}>
                  <Txt w="bold">{item.nombre}</Txt>
                  <Txt size={12} color={c.textMuted} numberOfLines={1}>
                    {item.email}
                  </Txt>
                  <Txt size={12} color={c.textMuted}>
                    Cliente desde {fmtFecha(item.creado)}
                  </Txt>
                </View>
                {!!item.telefono && (
                  <>
                    <IconBtn
                      icon="whatsapp"
                      color="#25D366"
                      onPress={() =>
                        Linking.openURL(
                          `https://wa.me/${soloDigitos(item.telefono).replace('+', '')}?text=${encodeURIComponent(`Hola ${item.nombre.split(' ')[0]}, te escribimos de ${TALLER.nombre}.`)}`
                        ).catch(() => {})
                      }
                    />
                    <IconBtn icon="phone" color={c.primary} onPress={() => Linking.openURL(`tel:${soloDigitos(item.telefono)}`).catch(() => {})} />
                  </>
                )}
              </View>

              {suyos.length > 0 && (
                <View style={{ gap: 8, marginTop: 12 }}>
                  {suyos.map((coche) => (
                    <Tappable
                      key={coche.id}
                      onPress={() => {
                        onClose();
                        onAbrirCoche(coche.id);
                      }}
                      style={s.coche}
                    >
                      <Placa matricula={coche.matricula} size="sm" />
                      <Txt w="semibold" size={13} numberOfLines={1} style={{ flex: 1 }}>
                        {coche.marca} {coche.modelo}
                      </Txt>
                      <StatusBadge estado={coche.estado} />
                    </Tappable>
                  ))}
                </View>
              )}

              <Btn title="Dar de alta un coche" icon="car-arrow-right" variant="secondary" small onPress={() => setAltaPara(item.id)} style={{ marginTop: 12 }} />
            </View>
          );
        }}
      />
      <CarForm visible={!!altaPara} clienteInicial={altaPara ?? undefined} onClose={() => setAltaPara(null)} />
    </View>
  );
}

const useS = crearEstilos((c) => ({
  card: { backgroundColor: c.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: c.cardBorder },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coche: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.bg, borderRadius: 12, padding: 8 },
}));
