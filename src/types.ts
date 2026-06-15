/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'public';

export type Category = '7ma' | '6ta' | '5ta' | 'Intermedia' | 'Primera';

export type MatchState = 'Programado' | 'En juego' | 'Finalizado' | 'Suspendido';

export interface Player {
  id: string;
  nombre: string;
  apellido: string;
  numeroCamiseta: number;
  posicion: 'Arquera' | 'Defensora' | 'Volante' | 'Delantera';
  fechaNacimiento: string;
  fotoUrl: string;
  partidosJugados: number;
  goles: number;
  asistencias: number;
  tarjetaVerde: number;
  tarjetaAmarilla: number;
  tarjetaRoja: number;
  categoria: Category;
  destacada?: boolean; // Premium: Destacada del plantel
  baseGoles?: number;
  baseAsistencias?: number;
  basePartidosJugados?: number;
  baseTarjetaVerde?: number;
  baseTarjetaAmarilla?: number;
  baseTarjetaRoja?: number;
}

export interface Match {
  id: string;
  fecha: string; // ISO Date YYYY-MM-DD
  hora: string;  // HH:MM
  rival: string;
  rivalLogo?: string;
  categoria: Category;
  esLocal: boolean;
  cancha: string;
  golesPropios: number;
  golesRival: number;
  estado: MatchState;
  localNombre?: string;
  visitanteNombre?: string;
  mvpId?: string; // Player ID (Premium MVP del partido)
  goleadorasIds?: { jugadorId: string; cantidad: number }[];
  asistidorasIds?: { jugadorId: string; cantidad: number }[];
  tarjetas?: { jugadorId: string; verde?: number; amarilla?: number; roja?: number }[];
  fechaNumero?: number;
  fase?: 'regular' | 'cuartos' | 'semifinal' | 'final';
}

export interface Standing {
  id: string; // usually team name
  equipo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  categoria: Category;
  esOficialClub?: boolean; // to highlight San Rafael Tenis Club
}

export interface NewsItem {
  id: string;
  titulo: string;
  contenido: string;
  imagenUrl: string;
  fecha: string;
  autor: string;
  esConvocatoria?: boolean;
}

export interface GalleryItem {
  id: string;
  titulo: string;
  imagenUrl: string;
  fecha: string;
  partidoRelacionado?: string;
  torneo: string;
}

export interface Convocation {
  id: string; // matches matchId or a generic event
  fecha: string;
  rival: string;
  categoria: Category;
  estadosJugadoras: {
    [playerID: string]: 'Convocada' | 'Ausente' | 'Lesionada';
  };
}

export interface NotificationLog {
  id: string;
  titulo: string;
  cuerpo: string;
  fecha: string;
  tipo: 'noticia' | 'resultado' | 'horario' | 'convocatoria';
}
