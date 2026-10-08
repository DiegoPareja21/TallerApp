import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { estadoInfo, TALLER } from './theme';
import { Aviso, Coche, Estado, User } from './types';

// ---------- Persistencia ----------
const K = { users: 'tp_users_v2', coches: 'tp_coches_v2', avisos: 'tp_avisos_v2', session: 'tp_session_v2' };

async function load<T>(key: string, def: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}
const save = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const ahora = () => new Date().toISOString();

const hash = (email: string, password: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email}::${password}::taller`);

// ---------- Fotos ----------
export async function guardarFoto(uriTemporal: string): Promise<string> {
  try {
    const destino = new File(Paths.document, `coche-${uid()}.jpg`);
    await new File(uriTemporal).copy(destino);
    return destino.uri;
  } catch {
    return uriTemporal;
  }
}

function borrarFoto(uri?: string) {
  if (!uri || !uri.startsWith('file:')) return;
  try {
    new File(uri).delete();
  } catch {}
}

// ---------- Notificaciones ----------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function pedirPermisoNotificaciones() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('estado-coche', {
        name: 'Estado de tu coche',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: '#2F5BFF',
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();
  } catch {}
}

function mensajeEstado(coche: Coche, estado: Estado) {
  const nombre = `${coche.marca} ${coche.modelo}`;
  switch (estado) {
    case 'terminado':
      return { titulo: '¡Tu coche está listo! 🎉', cuerpo: `Tu ${nombre} (${coche.matricula}) ya está listo para recoger.` };
    case 'piezas':
      return { titulo: 'Estamos pidiendo piezas 📦', cuerpo: `Ya hemos diagnosticado tu ${nombre}. Esperamos las piezas.` };
    case 'reparando':
      return { titulo: 'Tu coche está en reparación 🔧', cuerpo: `Los mecánicos están trabajando en tu ${nombre}.` };
    case 'entregado':
      return { titulo: '¡Gracias por tu visita! 🔑', cuerpo: `Tu ${nombre} se ha entregado. ¡Buen viaje!` };
    default:
      return { titulo: 'Coche recibido', cuerpo: `Tu ${nombre} está en cola para revisión.` };
  }
}

async function lanzarNotificacion(titulo: string, cuerpo: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: cuerpo, sound: true },
      trigger: Platform.OS === 'android' ? { channelId: 'estado-coche' } : null,
    });
  } catch {}
}

// ---------- Contexto ----------
export type NuevoCoche = Omit<Coche, 'id' | 'estado' | 'historial' | 'creado' | 'actualizado'>;
type CambioTaller = { estado: Estado; nota?: string; presupuesto?: number; entregaEstimada?: string };

type Store = {
  listo: boolean;
  user: User | null;
  users: User[];
  coches: Coche[];
  avisos: Aviso[];
  registrar: (d: { nombre: string; email: string; telefono: string; password: string; codigo: string }) => Promise<string | null>;
  entrar: (email: string, password: string) => Promise<string | null>;
  salir: () => void;
  crearCoche: (d: NuevoCoche) => void;
  editarCoche: (id: string, d: Partial<NuevoCoche>) => void;
  borrarCoche: (id: string) => void;
  actualizarTaller: (id: string, cambio: CambioTaller) => void;
  marcarAvisosLeidos: () => void;
  cargarDemo: (rol: 'cliente' | 'taller', restablecer?: boolean) => Promise<void>;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de StoreProvider');
  return s;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [coches, setCoches] = useState<Coche[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [u, c, a, s] = await Promise.all([
        load<User[]>(K.users, []),
        load<Coche[]>(K.coches, []),
        load<Aviso[]>(K.avisos, []),
        load<string | null>(K.session, null),
      ]);
      setUsers(u);
      setCoches(c);
      setAvisos(a);
      setSessionId(s);
      setListo(true);
      pedirPermisoNotificaciones();
    })();
  }, []);

  // Guarda automáticamente cada vez que cambian los datos
  useEffect(() => void (listo && save(K.users, users)), [users, listo]);
  useEffect(() => void (listo && save(K.coches, coches)), [coches, listo]);
  useEffect(() => void (listo && save(K.avisos, avisos)), [avisos, listo]);
  useEffect(() => void (listo && save(K.session, sessionId)), [sessionId, listo]);

  const user = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);

  const registrar: Store['registrar'] = useCallback(
    async ({ nombre, email, telefono, password, codigo }) => {
      const em = email.trim().toLowerCase();
      if (!nombre.trim()) return 'Introduce tu nombre.';
      if (!/^\S+@\S+\.\S+$/.test(em)) return 'El email no es válido.';
      if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
      if (users.some((u) => u.email === em)) return 'Ya existe una cuenta con ese email.';
      if (codigo && codigo !== TALLER.codigoPersonal) return 'El código de taller no es correcto.';
      const nuevo: User = {
        id: uid(),
        nombre: nombre.trim(),
        email: em,
        telefono: telefono.trim(),
        passwordHash: await hash(em, password),
        rol: codigo ? 'taller' : 'cliente',
        creado: ahora(),
      };
      setUsers((prev) => [...prev, nuevo]);
      setSessionId(nuevo.id);
      return null;
    },
    [users]
  );

  const entrar: Store['entrar'] = useCallback(
    async (email, password) => {
      const em = email.trim().toLowerCase();
      const u = users.find((x) => x.email === em);
      if (!u || u.passwordHash !== (await hash(em, password))) return 'Email o contraseña incorrectos.';
      setSessionId(u.id);
      return null;
    },
    [users]
  );

  const salir = useCallback(() => setSessionId(null), []);

  // El taller da de alta el coche y lo asigna a un cliente, que recibe un aviso
  const crearCoche: Store['crearCoche'] = useCallback((d) => {
    const t = ahora();
    const coche: Coche = {
      ...d,
      id: uid(),
      estado: 'pendiente',
      historial: [{ estado: 'pendiente', fecha: t, nota: 'Coche recibido en el taller.' }],
      creado: t,
      actualizado: t,
    };
    setCoches((prev) => [coche, ...prev]);
    const aviso: Aviso = {
      id: uid(),
      userId: d.userId,
      cocheId: coche.id,
      titulo: 'Tu coche ha entrado en el taller 🚗',
      cuerpo: `Hemos registrado tu ${d.marca} ${d.modelo} (${d.matricula}). Te avisaremos de cada novedad.`,
      estado: 'pendiente',
      fecha: t,
      leido: false,
    };
    setAvisos((prev) => [aviso, ...prev]);
    lanzarNotificacion(aviso.titulo, aviso.cuerpo);
  }, []);

  const editarCoche: Store['editarCoche'] = useCallback((id, d) => {
    setCoches((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if ('foto' in d && d.foto !== c.foto) borrarFoto(c.foto);
        return { ...c, ...d, actualizado: ahora() };
      })
    );
  }, []);

  const borrarCoche = useCallback((id: string) => {
    setCoches((prev) => {
      borrarFoto(prev.find((c) => c.id === id)?.foto);
      return prev.filter((c) => c.id !== id);
    });
    setAvisos((prev) => prev.filter((a) => a.cocheId !== id));
  }, []);

  const actualizarTaller: Store['actualizarTaller'] = useCallback(
    (id, { estado, nota, presupuesto, entregaEstimada }) => {
      const coche = coches.find((c) => c.id === id);
      if (!coche) return;
      const t = ahora();
      const notaLimpia = nota?.trim() || undefined;
      const cambiaEstado = estado !== coche.estado;

      setCoches((prev) =>
        prev.map((c) =>
          c.id !== id
            ? c
            : {
                ...c,
                estado,
                presupuesto,
                entregaEstimada,
                actualizado: t,
                historial: cambiaEstado || notaLimpia ? [...c.historial, { estado, fecha: t, nota: notaLimpia }] : c.historial,
              }
        )
      );

      if (cambiaEstado || notaLimpia) {
        const m = cambiaEstado
          ? mensajeEstado(coche, estado)
          : { titulo: `Novedades de tu ${coche.marca}`, cuerpo: notaLimpia! };
        const aviso: Aviso = {
          id: uid(),
          userId: coche.userId,
          cocheId: id,
          titulo: m.titulo,
          cuerpo: cambiaEstado && notaLimpia ? `${m.cuerpo}\n«${notaLimpia}»` : m.cuerpo,
          estado,
          fecha: t,
          leido: false,
        };
        setAvisos((prev) => [aviso, ...prev]);
        lanzarNotificacion(aviso.titulo, aviso.cuerpo);
      }
    },
    [coches]
  );

  const marcarAvisosLeidos = useCallback(() => {
    if (!sessionId) return;
    setAvisos((prev) => prev.map((a) => (a.userId === sessionId ? { ...a, leido: true } : a)));
  }, [sessionId]);

  const cargarDemo = useCallback(async (rol: 'cliente' | 'taller', restablecer = false) => {
    // Si la demo ya existe, solo se inicia sesión: así se conservan los cambios hechos por el taller
    if (!restablecer && users.some((u) => u.id === 'demo-cliente')) {
      setSessionId(rol === 'taller' ? 'demo-taller' : 'demo-cliente');
      return;
    }
    const t = Date.now();
    const hace = (h: number) => new Date(t - h * 3600_000).toISOString();
    const enDias = (d: number) => new Date(t + d * 86400_000).toISOString();

    const taller: User = {
      id: 'demo-taller',
      nombre: 'Carlos Mecánico',
      email: 'taller@demo.com',
      telefono: TALLER.telefono,
      passwordHash: await hash('taller@demo.com', 'demo1234'),
      rol: 'taller',
      creado: hace(500),
    };
    const cliente: User = {
      id: 'demo-cliente',
      nombre: 'Laura García',
      email: 'cliente@demo.com',
      telefono: '+34611222333',
      passwordHash: await hash('cliente@demo.com', 'demo1234'),
      rol: 'cliente',
      creado: hace(400),
    };
    const base = { userId: cliente.id, creado: hace(72) };
    const demoCoches: Coche[] = [
      {
        ...base,
        id: 'demo-c1',
        matricula: '4821 KXM',
        marca: 'Volkswagen',
        modelo: 'Golf GTI',
        anio: '2019',
        km: '78500',
        color: 'Rojo',
        problema: 'Ruido al frenar y vibración en el volante.',
        estado: 'reparando',
        presupuesto: 340,
        entregaEstimada: enDias(1),
        actualizado: hace(2),
        historial: [
          { estado: 'pendiente', fecha: hace(72), nota: 'Coche registrado en el taller.' },
          { estado: 'piezas', fecha: hace(50), nota: 'Discos y pastillas delanteras desgastados. Pedidos al proveedor.' },
          { estado: 'reparando', fecha: hace(2), nota: 'Han llegado las piezas. Empezamos el montaje.' },
        ],
      },
      {
        ...base,
        id: 'demo-c2',
        matricula: '7310 LPR',
        marca: 'Toyota',
        modelo: 'Yaris Hybrid',
        anio: '2021',
        km: '32100',
        color: 'Blanco',
        problema: 'Revisión de los 30.000 km.',
        estado: 'terminado',
        presupuesto: 189.9,
        entregaEstimada: enDias(0),
        actualizado: hace(1),
        historial: [
          { estado: 'pendiente', fecha: hace(30), nota: 'Coche registrado en el taller.' },
          { estado: 'reparando', fecha: hace(20), nota: 'Cambio de aceite, filtros y revisión general.' },
          { estado: 'terminado', fecha: hace(1), nota: 'Todo en orden. Puedes recogerlo hasta las 20:00.' },
        ],
      },
      {
        ...base,
        id: 'demo-c3',
        matricula: '1199 KBX',
        marca: 'Seat',
        modelo: 'León',
        anio: '2017',
        km: '121000',
        color: 'Gris',
        problema: 'Testigo de motor encendido.',
        estado: 'pendiente',
        actualizado: hace(3),
        historial: [{ estado: 'pendiente', fecha: hace(3), nota: 'Coche registrado en el taller.' }],
      },
    ];
    const demoAvisos: Aviso[] = [
      {
        id: 'demo-a1',
        userId: cliente.id,
        cocheId: 'demo-c2',
        titulo: '¡Tu coche está listo! 🎉',
        cuerpo: 'Tu Toyota Yaris Hybrid (7310 LPR) ya está listo para recoger.',
        estado: 'terminado',
        fecha: hace(1),
        leido: false,
      },
      {
        id: 'demo-a2',
        userId: cliente.id,
        cocheId: 'demo-c1',
        titulo: 'Tu coche está en reparación 🔧',
        cuerpo: 'Los mecánicos están trabajando en tu Volkswagen Golf GTI.',
        estado: 'reparando',
        fecha: hace(2),
        leido: false,
      },
    ];

    setUsers((prev) => [...prev.filter((u) => !u.id.startsWith('demo-')), taller, cliente]);
    setCoches((prev) => [...prev.filter((c) => !c.id.startsWith('demo-')), ...demoCoches]);
    setAvisos((prev) => [...prev.filter((a) => !a.id.startsWith('demo-')), ...demoAvisos]);
    setSessionId(rol === 'taller' ? taller.id : cliente.id);
  }, [users]);

  const value: Store = {
    listo,
    user,
    users,
    coches,
    avisos,
    registrar,
    entrar,
    salir,
    crearCoche,
    editarCoche,
    borrarCoche,
    actualizarTaller,
    marcarAvisosLeidos,
    cargarDemo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
