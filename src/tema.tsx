import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { CLARO, Colores, OSCURO, sombraDe, suaveDe } from './theme';

export type ModoTema = 'sistema' | 'claro' | 'oscuro';
const K_TEMA = 'tp_tema';

type Tema = {
  c: Colores;
  oscuro: boolean;
  modo: ModoTema;
  setModo: (m: ModoTema) => void;
  sombra: ReturnType<typeof sombraDe>;
  suave: (e: { color: string; suave: string }) => string;
};

const Ctx = createContext<Tema | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme();
  const [modo, setModoState] = useState<ModoTema>('sistema');

  useEffect(() => {
    AsyncStorage.getItem(K_TEMA)
      .then((v) => v && setModoState(v as ModoTema))
      .catch(() => {});
  }, []);

  const setModo = (m: ModoTema) => {
    setModoState(m);
    AsyncStorage.setItem(K_TEMA, m).catch(() => {});
  };

  const oscuro = modo === 'oscuro' || (modo === 'sistema' && sistema === 'dark');
  const valor = useMemo<Tema>(() => {
    const c = oscuro ? OSCURO : CLARO;
    return { c, oscuro, modo, setModo, sombra: sombraDe(c), suave: (e) => suaveDe(e, oscuro) };
  }, [oscuro, modo]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useTema() {
  const t = useContext(Ctx);
  if (!t) throw new Error('useTema fuera de TemaProvider');
  return t;
}

// Crea estilos que se recalculan al cambiar de tema
export function crearEstilos<T extends StyleSheet.NamedStyles<T>>(fn: (c: Colores) => T) {
  return () => {
    const { c } = useTema();
    return useMemo(() => StyleSheet.create(fn(c)), [c]);
  };
}
