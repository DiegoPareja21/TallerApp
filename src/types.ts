export type Estado = 'pendiente' | 'piezas' | 'reparando' | 'terminado' | 'entregado';
export type Rol = 'cliente' | 'taller';

export type User = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  passwordHash: string;
  rol: Rol;
  creado: string;
};

export type EventoHistorial = {
  estado: Estado;
  fecha: string;
  nota?: string;
};

export type Coche = {
  id: string;
  userId: string;
  matricula: string;
  marca: string;
  modelo: string;
  anio?: string;
  km?: string;
  color?: string;
  foto?: string;
  problema?: string;
  estado: Estado;
  historial: EventoHistorial[];
  presupuesto?: number;
  entregaEstimada?: string;
  creado: string;
  actualizado: string;
};

export type Aviso = {
  id: string;
  userId: string;
  cocheId: string;
  titulo: string;
  cuerpo: string;
  estado: Estado;
  fecha: string;
  leido: boolean;
};
