import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from './src/components/ui';
import AuthScreen from './src/screens/AuthScreen';
import ClientHome from './src/screens/ClientHome';
import WorkshopHome from './src/screens/WorkshopHome';
import { StoreProvider, useStore } from './src/store';
import { TemaProvider, useTema } from './src/tema';

export default function App() {
  const [fuentes] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });

  return (
    <SafeAreaProvider>
      <TemaProvider>
        <StoreProvider>
          <StatusBar style="light" />
          {fuentes ? <Raiz /> : <Carga />}
        </StoreProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}

function Raiz() {
  const { listo, user } = useStore();
  if (!listo) return <Carga />;
  if (!user) return <AuthScreen />;
  return user.rol === 'taller' ? <WorkshopHome /> : <ClientHome />;
}

function Carga() {
  const { c } = useTema();
  return (
    <LinearGradient colors={[c.headerFrom, c.headerTo]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Icon name="car-wrench" size={64} color="#fff" />
      <ActivityIndicator color="#fff" />
    </LinearGradient>
  );
}
