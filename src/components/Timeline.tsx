import { View } from 'react-native';
import { crearEstilos, useTema } from '../tema';
import { estadoIndex, estadoInfo, ESTADOS, fmtFechaHora } from '../theme';
import { Coche } from '../types';
import { Icon, Txt } from './ui';

// Pasos de la reparación: hechos, actual y pendientes
export function Stepper({ coche }: { coche: Coche }) {
  const { c, suave } = useTema();
  const s = useS();
  const actual = estadoIndex(coche.estado);
  const pasos = coche.estado === 'entregado' ? ESTADOS : ESTADOS.slice(0, 4);
  return (
    <View>
      {pasos.map((p, i) => {
        const hecho = i < actual;
        const esActual = i === actual;
        const fecha = [...coche.historial].reverse().find((h) => h.estado === p.key)?.fecha;
        const ultimo = i === pasos.length - 1;
        return (
          <View key={p.key} style={s.paso}>
            <View style={s.columna}>
              <View
                style={[
                  s.punto,
                  hecho && { backgroundColor: p.color, borderColor: p.color },
                  esActual && { backgroundColor: p.color, borderColor: suave(p), borderWidth: 5, width: 40, height: 40 },
                ]}
              >
                <Icon name={hecho ? 'check' : p.icon} size={esActual ? 16 : 14} color={hecho || esActual ? '#fff' : c.textMuted} />
              </View>
              {!ultimo && <View style={[s.linea, { backgroundColor: hecho ? p.color : c.border }]} />}
            </View>
            <View style={[s.texto, ultimo && { paddingBottom: 0 }]}>
              <Txt w={esActual ? 'bold' : 'semibold'} size={15} color={hecho || esActual ? c.text : c.textMuted}>
                {p.label}
              </Txt>
              {esActual ? (
                <Txt size={13} color={c.textSoft} style={{ marginTop: 2, lineHeight: 19 }}>
                  {p.descripcion}
                </Txt>
              ) : null}
              {fecha && (hecho || esActual) ? (
                <Txt size={12} color={c.textMuted} style={{ marginTop: 2 }}>
                  {fmtFechaHora(fecha)}
                </Txt>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Historial completo con notas del taller
export function Historial({ coche }: { coche: Coche }) {
  const { c, suave } = useTema();
  const s = useS();
  const eventos = [...coche.historial].reverse();
  return (
    <View>
      {eventos.map((ev, i) => {
        const e = estadoInfo(ev.estado);
        return (
          <View key={`${ev.fecha}-${i}`} style={[s.evento, i === eventos.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[s.eventoIcon, { backgroundColor: suave(e) }]}>
              <Icon name={e.icon} size={18} color={e.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Txt w="semibold" size={14}>
                  {e.label}
                </Txt>
                <Txt size={12} color={c.textMuted}>
                  {fmtFechaHora(ev.fecha)}
                </Txt>
              </View>
              {ev.nota ? (
                <Txt size={13} color={c.textSoft} style={{ marginTop: 3, lineHeight: 19 }}>
                  {ev.nota}
                </Txt>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useS = crearEstilos((c) => ({
  paso: { flexDirection: 'row' },
  columna: { width: 44, alignItems: 'center' },
  punto: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: c.border,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linea: { width: 3, flex: 1, minHeight: 18, borderRadius: 2, marginVertical: 3 },
  texto: { flex: 1, paddingLeft: 10, paddingBottom: 18, paddingTop: 5 },
  evento: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  eventoIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
}));
