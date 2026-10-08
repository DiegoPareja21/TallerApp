import { View } from 'react-native';
import { crearEstilos, useTema } from '../tema';
import { estadoInfo, fmtFecha, haceCuanto } from '../theme';
import { Coche } from '../types';
import { CarImage, Icon, Placa, Progreso, StatusBadge, Tappable, Txt } from './ui';

export default function CarCard({ coche, onPress, dueño }: { coche: Coche; onPress: () => void; dueño?: string }) {
  const { c, sombra } = useTema();
  const s = useS();
  const e = estadoInfo(coche.estado);
  const ultimaNota = [...coche.historial].reverse().find((h) => h.nota)?.nota;
  return (
    <Tappable onPress={onPress} style={[s.card, sombra]}>
      <View>
        <CarImage foto={coche.foto} color={coche.color} estado={coche.estado} height={150} radius={18} />
        <View style={s.badge}>
          <StatusBadge estado={coche.estado} solid />
        </View>
        <View style={s.placa}>
          <Placa matricula={coche.matricula} size="sm" />
        </View>
      </View>

      <View style={{ padding: 14, paddingTop: 12 }}>
        <View style={s.fila}>
          <View style={{ flex: 1 }}>
            <Txt w="bold" size={17} numberOfLines={1}>
              {coche.marca} {coche.modelo}
            </Txt>
            <Txt size={13} color={c.textMuted} numberOfLines={1}>
              {dueño ? `${dueño} · ` : ''}
              {haceCuanto(coche.actualizado)}
            </Txt>
          </View>
          <Icon name="chevron-right" size={24} color={c.textMuted} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Progreso estado={coche.estado} />
        </View>

        <View style={[s.fila, { marginTop: 10 }]}>
          <Txt w="semibold" size={13} color={e.color} style={{ flex: 1 }}>
            {e.label}
          </Txt>
          {coche.entregaEstimada && coche.estado !== 'entregado' ? (
            <View style={s.entrega}>
              <Icon name="calendar-clock" size={14} color={c.textSoft} />
              <Txt size={12} color={c.textSoft}>
                {fmtFecha(coche.entregaEstimada)}
              </Txt>
            </View>
          ) : null}
        </View>

        {ultimaNota ? (
          <View style={s.nota}>
            <Icon name="format-quote-open" size={16} color={c.textMuted} />
            <Txt size={13} color={c.textSoft} numberOfLines={2} style={{ flex: 1, lineHeight: 18 }}>
              {ultimaNota}
            </Txt>
          </View>
        ) : null}
      </View>
    </Tappable>
  );
}

const useS = crearEstilos((c) => ({
  card: { backgroundColor: c.card, borderRadius: 22, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: c.cardBorder },
  badge: { position: 'absolute', top: 10, left: 10 },
  placa: { position: 'absolute', bottom: 10, right: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entrega: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  nota: { flexDirection: 'row', gap: 6, backgroundColor: c.bg, padding: 10, borderRadius: 12, marginTop: 10 },
}));
