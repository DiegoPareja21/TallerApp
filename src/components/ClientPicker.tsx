import { useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { User } from '../types';
import { Avatar, Empty, Field, Icon, SheetHeader, Tappable, Txt } from './ui';

export const clientesDe = (users: User[]) =>
  users.filter((u) => u.rol === 'cliente').sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export const coincide = (u: User, q: string) =>
  !q || `${u.nombre} ${u.email} ${u.telefono}`.toLowerCase().includes(q.trim().toLowerCase());

export default function ClientPicker({
  visible,
  seleccionado,
  onElegir,
  onClose,
}: {
  visible: boolean;
  seleccionado?: string;
  onElegir: (u: User) => void;
  onClose: () => void;
}) {
  const { users, coches } = useStore();
  const { c } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const lista = clientesDe(users).filter((u) => coincide(u, q));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SheetHeader titulo="Elegir cliente" onClose={onClose} />
        <View style={{ paddingHorizontal: 20 }}>
          <Field icon="magnify" placeholder="Buscar por nombre, email o teléfono" value={q} onChangeText={setQ} autoCapitalize="none" />
        </View>
        <FlatList
          data={lista}
          keyExtractor={(u) => u.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 10 }}
          ListEmptyComponent={
            <Empty
              icon="account-search-outline"
              titulo={q ? 'Sin resultados' : 'No hay clientes registrados'}
              texto={q ? 'Prueba con otro nombre o teléfono.' : 'Pide a tu cliente que se descargue la app y cree su cuenta.'}
            />
          }
          renderItem={({ item }) => {
            const sel = item.id === seleccionado;
            const n = coches.filter((x) => x.userId === item.id).length;
            return (
              <Tappable
                onPress={() => {
                  onElegir(item);
                  onClose();
                }}
                style={[s.fila, sel && { borderColor: c.primary, backgroundColor: c.primarySuave }]}
              >
                <Avatar nombre={item.nombre} />
                <View style={{ flex: 1 }}>
                  <Txt w="semibold">{item.nombre}</Txt>
                  <Txt size={13} color={c.textMuted} numberOfLines={1}>
                    {item.telefono || item.email} · {n} {n === 1 ? 'coche' : 'coches'}
                  </Txt>
                </View>
                {sel ? <Icon name="check-circle" size={22} color={c.primary} /> : <Icon name="chevron-right" size={22} color={c.textMuted} />}
              </Tappable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const useS = crearEstilos((c) => ({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: c.cardBorder === 'transparent' ? c.border : c.cardBorder,
  },
}));
