import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonTema, Btn, exito, Field, Icon, Tappable, Txt } from '../components/ui';
import { useStore } from '../store';
import { crearEstilos, useTema } from '../tema';
import { TALLER } from '../theme';

export default function AuthScreen() {
  const { registrar, entrar, cargarDemo } = useStore();
  const { c, sombra } = useTema();
  const s = useS();
  const insets = useSafeAreaInsets();
  const [modo, setModo] = useState<'entrar' | 'registro'>('entrar');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [esTaller, setEsTaller] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError(null);
    if (modo === 'registro' && esTaller && !codigo) return setError('Introduce el código del taller.');
    setCargando(true);
    const err =
      modo === 'entrar'
        ? await entrar(email, password)
        : await registrar({ nombre, email, telefono, password, codigo: esTaller ? codigo : '' });
    setCargando(false);
    if (err) setError(err);
    else exito();
  };

  const demo = () =>
    Alert.alert(
      'Probar la demo',
      'Cliente: cliente@demo.com\nTaller: taller@demo.com\nContraseña: demo1234\n\nLos cambios que hagas en la demo se conservan.',
      [
        { text: 'Entrar como taller', onPress: () => cargarDemo('taller') },
        { text: 'Entrar como cliente', onPress: () => cargarDemo('cliente') },
        {
          text: 'Restablecer demo',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Restablecer demo', 'Los coches de ejemplo volverán a su estado inicial.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Restablecer', style: 'destructive', onPress: () => cargarDemo('cliente', true) },
            ]),
        },
      ],
      { cancelable: true }
    );

  const cambiarModo = (m: typeof modo) => {
    setModo(m);
    setError(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style="light" />
      <LinearGradient colors={[c.headerFrom, c.headerTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { paddingTop: insets.top + 36 }]}>
        <View style={[s.burbuja, { width: 300, height: 300, top: -120, right: -100 }]} />
        <View style={[s.burbuja, { width: 180, height: 180, bottom: -60, left: -50 }]} />
        <View style={[s.temaBtn, { top: insets.top + 10 }]}>
          <BotonTema light />
        </View>
        <View style={s.logo}>
          <Icon name="car-wrench" size={40} color="#fff" />
        </View>
        <Txt w="black" size={30} color="#fff" style={{ marginTop: 16 }}>
          {TALLER.nombre}
        </Txt>
        <Txt color="rgba(255,255,255,0.75)" size={15} style={{ marginTop: 4 }}>
          Sigue la reparación de tu coche en tiempo real
        </Txt>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          style={{ marginTop: -36 }}
        >
          <View style={[s.panel, sombra]}>
            <View style={s.segmento}>
              {(['entrar', 'registro'] as const).map((m) => (
                <Tappable key={m} onPress={() => cambiarModo(m)} style={[s.segBtn, modo === m && [s.segActivo, sombra]]}>
                  <Txt w="semibold" color={modo === m ? c.text : c.textMuted}>
                    {m === 'entrar' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </Txt>
                </Tappable>
              ))}
            </View>

            {modo === 'registro' && (
              <Field icon="account-outline" placeholder="Nombre y apellidos" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
            )}
            <Field
              icon="email-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {modo === 'registro' && (
              <Field icon="phone-outline" placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
            )}
            <Field
              icon="lock-outline"
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!verPass}
              right={
                <Tappable onPress={() => setVerPass(!verPass)} hitSlop={10}>
                  <Icon name={verPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
                </Tappable>
              }
            />

            {modo === 'registro' && (
              <>
                <Tappable onPress={() => setEsTaller(!esTaller)} style={s.check}>
                  <View style={[s.checkBox, esTaller && { backgroundColor: c.primary, borderColor: c.primary }]}>
                    {esTaller && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  <Txt color={c.textSoft}>Soy personal del taller</Txt>
                </Tappable>
                {esTaller && (
                  <Field icon="shield-key-outline" placeholder="Código del taller" value={codigo} onChangeText={setCodigo} secureTextEntry keyboardType="number-pad" />
                )}
              </>
            )}

            {error && (
              <View style={s.error}>
                <Icon name="alert-circle-outline" size={18} color={c.danger} />
                <Txt size={13} color={c.danger} style={{ flex: 1 }}>
                  {error}
                </Txt>
              </View>
            )}

            <Btn
              title={modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
              icon={modo === 'entrar' ? 'login' : 'account-plus-outline'}
              onPress={enviar}
              loading={cargando}
              style={{ marginTop: 6 }}
            />
          </View>

          <Tappable onPress={demo} style={s.demo}>
            <Icon name="play-circle-outline" size={20} color={c.primary} />
            <Txt w="semibold" color={c.primary}>
              Probar con datos de demo
            </Txt>
          </Tappable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useS = crearEstilos((c) => ({
  hero: { paddingHorizontal: 24, paddingBottom: 64, alignItems: 'center', overflow: 'hidden' },
  burbuja: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  temaBtn: { position: 'absolute', right: 16 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: { backgroundColor: c.card, borderRadius: 26, padding: 20, borderWidth: 1, borderColor: c.cardBorder },
  segmento: { flexDirection: 'row', backgroundColor: c.bg, borderRadius: 14, padding: 4, marginBottom: 20 },
  segBtn: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segActivo: { backgroundColor: c.card },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginLeft: 2 },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.dangerSuave, padding: 12, borderRadius: 12, marginBottom: 10 },
  demo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 12 },
}));
