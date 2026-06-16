/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Edit3, Plus, Trophy, Save, Trash2, Award, CheckCircle2, AlertTriangle, Play, ChevronLeft, ChevronDown, Check, Filter } from 'lucide-react';
import { Match, Player, UserRole, MatchState, Category } from '../../types';
import SrtcLogo from '../SrtcLogo';
import ClubLogo from '../ClubLogo';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_MATCH_LIST } from '../../data';
import HockeyAnim from '../HockeyAnim';

interface FixtureProps {
  matches: Match[];
  players: Player[];
  userRole: UserRole;
  selectedCategory: Category;
  onUpdateMatches: (updatedMatches: Match[]) => void;
  onShare: (title: string, text: string) => void;
  onTabChange: (tab: string) => void;
}

export function getMatchFechaNumber(match: Match): number {
  if (match.fechaNumero !== undefined) return match.fechaNumero;
  
  // Deduce from ID pattern
  const id = match.id;
  if (id === 'm1' || id.startsWith('m_f1_')) return 1;
  if (id === 'm2' || id.startsWith('m_f2_')) return 2;
  if (id === 'm3' || id.startsWith('m_f3_')) return 3;
  if (id === 'm4' || id.startsWith('m_f4_')) return 4;
  if (id === 'm5' || id.startsWith('m_f5_')) return 5;
  if (id === 'm6' || id === 'm6_1' || id === 'm6_2' || id.startsWith('m_f6_')) return 6;
  if (id === 'm7' || id.startsWith('m_f7_')) return 7;
  if (id === 'm8' || id.startsWith('m_f8_')) return 8;
  if (id === 'm9' || id.startsWith('m_f9_')) return 9;
  if (id === 'm10' || id.startsWith('m_f10_')) return 10;
  if (id === 'm11' || id.startsWith('m_f11_')) return 11;
  if (id === 'm12' || id.startsWith('m_f12_')) return 12;
  if (id === 'm13' || id.startsWith('m_f13_')) return 13;
  if (id === 'm14' || id.startsWith('m_f14_')) return 14;
  if (id === 'm15' || id.startsWith('m_f15_')) return 15;

  // Fallback by date values
  const d = match.fecha;
  if (d.includes('2026-03-07')) return 1;
  if (d.includes('2026-03-14')) return 2;
  if (d.includes('2026-03-21')) return 3;
  if (d.includes('2026-03-28')) return 4;
  if (d.includes('2026-04-11')) return 5;
  if (d.includes('2026-04-18') || d.includes('2026-05-16')) return 6;
  if (d.includes('2026-04-25')) return 7;
  if (d.includes('2026-05-02')) return 8;
  if (d.includes('2026-05-09')) return 9;
  if (d.includes('2026-05-23')) return 10;
  if (d.includes('2026-06-20')) return 11;
  if (d.includes('2026-06-06')) return 12;
  if (d.includes('2526-06-13') || d.includes('2026-06-13')) return 13;
  if (d.includes('2026-05-30')) return 14;
  if (d.includes('2026-05-25')) return 15;

  return 1;
}

export function formatFechaDdmmyyyy(fechaStr: string): string {
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length !== 4) {
      return fechaStr;
    }
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return fechaStr;
}

const POPULAR_CLUBS = [
  'San Rafael Tenis Club',
  'Rivadavia',
  'Los Tordos B',
  'Los Tordos C',
  'Mendoza R.C.',
  'Marista B',
  'Marista C',
  'Tacurú',
  'Banco Mendoza B',
  'Banco Mendoza C',
  'Pumai',
  'San Jorge',
  'CABNA',
  'Murialdo B',
  'Alemán B',
  'Teqüe Rugby Club'
];

export function getPlayoffStandings(matches: Match[], category: Category) {
  const baselines: { [key: string]: { pg: number; pe: number; pp: number; gf: number; gc: number } } = {
    'RIVADAVIA - A': { pg: 12, pe: 0, pp: 0, gf: 103, gc: 1 },
    'SAN RAFAEL TENIS CLUB - A': { pg: 8, pe: 4, pp: 0, gf: 29, gc: 7 },
    'LOS TORDOS - C': { pg: 8, pe: 3, pp: 1, gf: 26, gc: 6 },
    'LOS TORDOS - B': { pg: 8, pe: 2, pp: 2, gf: 28, gc: 11 },
    'MENDOZA R. C. - A': { pg: 7, pe: 4, pp: 1, gf: 36, gc: 8 },
    'MARISTA - B': { pg: 7, pe: 2, pp: 3, gf: 21, gc: 15 },
    'TACURU - A': { pg: 7, pe: 1, pp: 4, gf: 18, gc: 24 },
    'BANCO MENDOZA - B': { pg: 5, pe: 4, pp: 3, gf: 16, gc: 12 },
    'MARISTA - C': { pg: 4, pe: 2, pp: 6, gf: 8, gc: 19 },
    'PUMAI RUGBY CLUB - A': { pg: 3, pe: 4, pp: 5, gf: 11, gc: 15 },
    'SAN JORGE S.R. - A': { pg: 2, pe: 3, pp: 7, gf: 6, gc: 23 },
    'CABNA - A': { pg: 2, pe: 3, pp: 7, gf: 5, gc: 32 },
    'MURIALDO - B': { pg: 2, pe: 2, pp: 8, gf: 2, gc: 27 },
    'ALEMAN - B': { pg: 2, pe: 0, pp: 10, gf: 5, gc: 43 },
    'TEQÜE RUGBY CLUB - B': { pg: 0, pe: 3, pp: 9, gf: 1, gc: 33 },
    'BANCO MENDOZA - C': { pg: 0, pe: 1, pp: 11, gf: 1, gc: 40 }
  };

  const BASELINE_MATCH_IDS = new Set<string>([
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm14', 'm15',
    'm_f1_g1', 'm_f1_g2', 'm_f1_g3', 'm_f2_g1', 'm_f2_g2', 'm_f3_g1', 'm_f3_g2', 'm_f4_g1', 'm_f4_g2',
    'm_f5_g1', 'm_f5_g2', 'm_f6_g1', 'm6_1', 'm6_2', 'm_f7_g1', 'm_f7_g2', 'm_f8_g1', 'm_f8_g2',
    'm_f9_g1', 'm_f9_g2', 'm_f10_g1', 'm_f10_g2', 'm_f14_g1', 'm_f15_g1',
    'm_f1_g_riva', 'm_f2_g_riva', 'm_f4_g_riva', 'm_f6_g_riva', 'm_f8_g_riva', 'm_f9_g_riva', 'm_f10_g_riva', 'm_f14_g_riva', 'm_f15_g_riva',
    'm_f1_g_ltod', 'm_f2_g_ltod', 'm_f3_g_ltod', 'm_f4_g_ltod', 'm_f7_g_ltod', 'm_f9_g_ltod', 'm_f10_g_ltod', 'm_f14_g_ltod',
    'm_f2_g_ltob', 'm_f3_g_ltob', 'm_f4_g_ltob', 'm_f5_g_ltob', 'm_f6_g_ltob', 'm_f7_g_ltob', 'm_f9_g_ltob', 'm_f10_g_ltob', 'm_f14_g_ltob', 'm_f15_g_ltob',
    'm_f1_g_mendo', 'm_f5_g_mendo', 'm_f7_g_mendo', 'm_f8_g_mendo', 'm_f15_g_mendo',
    'm_f2_g_marb', 'm_f4_g_marb', 'm_f7_g_marb', 'm_f8_g_marb', 'm_f9_g_marb', 'm_f15_g_marb', 'm_f14_g_marb',
    'm_f2_g_teq_marb_c', 'm_f5_g_bmz_b_teq', 'm_f10_g_teq_cabna', 'm_f15_g_teq_tacuru',
    'm_f3_g_mar_c_tacu_a', 'm_f6_g_tacu_bco_mza_b', 'm_f7_g_mur_b_tacu_a', 'm_f8_g_tacu_sjor_a', 'm_f14_g_tacu_pumai_a',
    'm_f3_g_sjor_cabna_a', 'm_f5_g_sjor_alem_b', 'm_f6_g_pumai_sjor_a', 'm_f10_g_mar_c_sjor_a', 'm_f14_g_mur_b_sjor_a',
    'm_f4_g_pumai_bmz_b', 'm_f5_g_mur_b_pumai_a', 'm_f9_g_cabna_pumai_a',
    'm_f1_g_bmz_b_cabna', 'm_f3_g_bmz_b_alem_b', 'm_f8_g_marc_bmz_b'
  ]);

  function normalizeName(n: string) {
    if (!n) return '';
    const name = n.toLowerCase().trim();
    if (name.includes('san rafael') || name.includes('srtc')) return 'SAN RAFAEL TENIS CLUB - A';
    if (name.includes('rivadavia')) return 'RIVADAVIA - A';
    if (name.includes('los tordos - c') || name === 'los tordos c' || name.includes('los tordos c')) return 'LOS TORDOS - C';
    if (name.includes('los tordos - b') || name === 'los tordos b' || name.includes('los tordos b')) return 'LOS TORDOS - B';
    if (name.includes('mendoza r.c.') || name.includes('mendoza r. c.') || name.includes('mendoza rc') || name === 'mendoza') return 'MENDOZA R. C. - A';
    if (name.includes('marista b') || name.includes('maristas b') || name.includes('marista - b')) return 'MARISTA - B';
    if (name.includes('marista c') || name.includes('maristas c') || name.includes('marista - c')) return 'MARISTA - C';
    if (name.includes('tacuru') || name === 'tacurú' || name.includes('tacurú')) return 'TACURU - A';
    if (name.includes('bco mza - b') || name.includes('bco mza b') || name.includes('banco mendoza b') || name.includes('banco mendoza - b')) return 'BANCO MENDOZA - B';
    if (name.includes('bco mza - c') || name.includes('bco mza c') || name.includes('banco mendoza c') || name.includes('banco mendoza - c')) return 'BANCO MENDOZA - C';
    if (name.includes('pumai') || name.includes('peumayen') || name.includes('peumayén')) return 'PUMAI RUGBY CLUB - A';
    if (name.includes('san jorge s.r.') || name.includes('san jorge')) return 'SAN JORGE S.R. - A';
    if (name.includes('cabna')) return 'CABNA - A';
    if (name.includes('murialdo')) return 'MURIALDO - B';
    if (name.includes('aleman') || name.includes('alemán') || name.includes('alemán b')) return 'ALEMAN - B';
    if (name.includes('teqüe') || name.includes('teque')) return 'TEQÜE RUGBY CLUB - B';
    return n.toUpperCase().trim();
  }

  const activeMatches = matches.filter(m => m.categoria === category && m.estado === 'Finalizado');
  const working = JSON.parse(JSON.stringify(baselines));

  const savedBaselines = localStorage.getItem('srtc_standings_baseline_db_v5');
  let finalWorking = working;
  if (savedBaselines) {
    try {
      finalWorking = JSON.parse(savedBaselines);
    } catch (e) {}
  }

  activeMatches.forEach(match => {
    if (BASELINE_MATCH_IDS.has(match.id)) {
      const originalMatch = INITIAL_MATCH_LIST.find(o => o.id === match.id);
      if (originalMatch) {
         const isModified = 
           match.golesPropios !== originalMatch.golesPropios || 
           match.golesRival !== originalMatch.golesRival || 
           match.estado !== originalMatch.estado ||
           (match.localNombre || '') !== (originalMatch.localNombre || '') ||
           (match.visitanteNombre || '') !== (originalMatch.visitanteNombre || '');

         if (!isModified) return;

         const rawLocalOrig = originalMatch.localNombre || (originalMatch.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : originalMatch.rival);
         const rawVisitorOrig = originalMatch.visitanteNombre || (!originalMatch.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : originalMatch.rival);
         const localOrig = normalizeName(rawLocalOrig);
         const visitorOrig = normalizeName(rawVisitorOrig);

         let localGOrig = 0;
         let visitorGOrig = 0;
         if (localOrig === 'SAN RAFAEL TENIS CLUB - A') {
           localGOrig = originalMatch.golesPropios;
           visitorGOrig = originalMatch.golesRival;
         } else if (visitorOrig === 'SAN RAFAEL TENIS CLUB - A') {
           localGOrig = originalMatch.golesRival;
           visitorGOrig = originalMatch.golesPropios;
         } else {
           localGOrig = originalMatch.golesPropios;
           visitorGOrig = originalMatch.golesRival;
         }

         const lE = finalWorking[localOrig];
         const vE = finalWorking[visitorOrig];
         if (lE) {
           lE.gf = Math.max(0, lE.gf - localGOrig);
           lE.gc = Math.max(0, lE.gc - visitorGOrig);
           if (localGOrig > visitorGOrig) lE.pg = Math.max(0, lE.pg - 1);
           else if (localGOrig < visitorGOrig) lE.pp = Math.max(0, lE.pp - 1);
           else lE.pe = Math.max(0, lE.pe - 1);
         }
         if (vE) {
           vE.gf = Math.max(0, vE.gf - visitorGOrig);
           vE.gc = Math.max(0, vE.gc - localGOrig);
           if (visitorGOrig > localGOrig) vE.pg = Math.max(0, vE.pg - 1);
           else if (visitorGOrig < localGOrig) vE.pp = Math.max(0, vE.pp - 1);
           else vE.pe = Math.max(0, vE.pe - 1);
         }
      }
    }

    const localTeam = normalizeName(match.localNombre || (match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival));
    const visitorTeam = normalizeName(match.visitanteNombre || (!match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival));

    let localGoles = 0;
    let visitorGoles = 0;
    if (localTeam === 'SAN RAFAEL TENIS CLUB - A') {
      localGoles = match.golesPropios;
      visitorGoles = match.golesRival;
    } else if (visitorTeam === 'SAN RAFAEL TENIS CLUB - A') {
      localGoles = match.golesRival;
      visitorGoles = match.golesPropios;
    } else {
      localGoles = match.golesPropios;
      visitorGoles = match.golesRival;
    }

    if (!finalWorking[localTeam]) {
      finalWorking[localTeam] = { pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    }
    if (!finalWorking[visitorTeam]) {
      finalWorking[visitorTeam] = { pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    }

    const lEntry = finalWorking[localTeam];
    const vEntry = finalWorking[visitorTeam];
    lEntry.gf += localGoles;
    lEntry.gc += visitorGoles;
    vEntry.gf += visitorGoles;
    vEntry.gc += localGoles;

    if (localGoles > visitorGoles) {
      lEntry.pg += 1;
      vEntry.pp += 1;
    } else if (localGoles < visitorGoles) {
      lEntry.pp += 1;
      vEntry.pg += 1;
    } else {
      lEntry.pe += 1;
      vEntry.pe += 1;
    }
  });

  const list = Object.keys(finalWorking).map(key => {
    const base = finalWorking[key];
    const pts = (base.pg * 3) + (base.pe * 1);
    const dg = base.gf - base.gc;
    return { equipo: key, pts, pg: base.pg, dg, gf: base.gf };
  });

  return list.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.pg !== a.pg) return b.pg - a.pg;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
}

export function getPlayoffMatchTeams(match: Match, allMatches: Match[]): { localTeam: string; visitorTeam: string } {
  const standings = getPlayoffStandings(allMatches, match.categoria);
  
  let localTeam = match.localNombre || (match.esLocal ? 'San Rafael Tenis Club' : match.rival);
  let visitorTeam = match.visitanteNombre || (!match.esLocal ? 'San Rafael Tenis Club' : match.rival);

  if (match.fase === 'cuartos') {
    const isGenericL = ['1er clasificado', '1er CLASIFICADO', '1CO CLASIFICADO'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV = ['8vo clasificado', '8vo CLASIFICADO', '8CO CLASIFICADO'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericL2 = ['2do clasificado', '2do CLASIFICADO'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV2 = ['7mo clasificado', '7mo CLASIFICADO'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericL3 = ['3er clasificado', '3er CLASIFICADO'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV3 = ['6to clasificado', '6to CLASIFICADO'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericL4 = ['4to clasificado', '4to CLASIFICADO'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV4 = ['5to clasificado', '5to CLASIFICADO'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));

    if (match.id === 'match_cuartos_1' || isGenericL || isGenericV) {
      const t1 = standings[0]?.equipo || '1er CLASIFICADO';
      const t8 = standings[7]?.equipo || '8vo CLASIFICADO';
      if (isGenericL) localTeam = t1;
      if (isGenericV) visitorTeam = t8;
    }
    if (match.id === 'match_cuartos_2' || isGenericL2 || isGenericV2) {
      const t2 = standings[1]?.equipo || '2do CLASIFICADO';
      const t7 = standings[6]?.equipo || '7mo CLASIFICADO';
      if (isGenericL2) localTeam = t2;
      if (isGenericV2) visitorTeam = t7;
    }
    if (match.id === 'match_cuartos_3' || isGenericL3 || isGenericV3) {
      const t3 = standings[2]?.equipo || '3er CLASIFICADO';
      const t6 = standings[5]?.equipo || '6to CLASIFICADO';
      if (isGenericL3) localTeam = t3;
      if (isGenericV3) visitorTeam = t6;
    }
    if (match.id === 'match_cuartos_4' || isGenericL4 || isGenericV4) {
      const t4 = standings[3]?.equipo || '4to CLASIFICADO';
      const t5 = standings[4]?.equipo || '5to CLASIFICADO';
      if (isGenericL4) localTeam = t4;
      if (isGenericV4) visitorTeam = t5;
    }
  }

  const getWinnerOfMatch = (matchId: string): string | null => {
    const target = allMatches.find(m => m.id === matchId);
    if (!target) return null;
    if (target.estado !== 'Finalizado') return null;
    
    const resolved = getPlayoffMatchTeams(target, allMatches);
    const lTeam = resolved.localTeam;
    const vTeam = resolved.visitorTeam;
    
    const isVisitorSrtc = vTeam.toLowerCase().includes('san rafael') || vTeam.toLowerCase().includes('srtc');

    let lG = target.golesPropios;
    let vG = target.golesRival;
    if (isVisitorSrtc) {
      lG = target.golesRival;
      vG = target.golesPropios;
    }

    if (lG > vG) return lTeam;
    if (vG > lG) return vTeam;
    return lTeam;
  };

  if (match.fase === 'semifinal') {
    const isGenericL = ['ganador 1', 'GANADOR 1'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV = ['ganador 2', 'GANADOR 2'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericL2 = ['ganador 3', 'GANADOR 3'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV2 = ['ganador 4', 'GANADOR 4'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));

    if (match.id === 'match_semi_1' || isGenericL || isGenericV) {
      const w1 = getWinnerOfMatch('match_cuartos_1');
      const w2 = getWinnerOfMatch('match_cuartos_2');
      if (isGenericL) localTeam = w1 || 'Ganador Cuartos 1';
      if (isGenericV) visitorTeam = w2 || 'Ganador Cuartos 2';
    }
    if (match.id === 'match_semi_2' || isGenericL2 || isGenericV2) {
      const w3 = getWinnerOfMatch('match_cuartos_3');
      const w4 = getWinnerOfMatch('match_cuartos_4');
      if (isGenericL2) localTeam = w3 || 'Ganador Cuartos 3';
      if (isGenericV2) visitorTeam = w4 || 'Ganador Cuartos 4';
    }
  }

  if (match.fase === 'final') {
    const isGenericL = ['ganador semi 1', 'GANADOR SEMI 1', 'ganador de semis 1'].some(val => localTeam.toLowerCase().includes(val.toLowerCase()));
    const isGenericV = ['ganador semi 2', 'GANADOR SEMI 2', 'ganador de semis 2'].some(val => visitorTeam.toLowerCase().includes(val.toLowerCase()));

    if (match.id === 'match_final_1' || isGenericL || isGenericV) {
      const ws1 = getWinnerOfMatch('match_semi_1');
      const ws2 = getWinnerOfMatch('match_semi_2');
      if (isGenericL) localTeam = ws1 || 'Ganador Semifinal 1';
      if (isGenericV) visitorTeam = ws2 || 'Ganador Semifinal 2';
    }
  }

  return { localTeam, visitorTeam };
}

export default function Fixture({ matches, players, userRole, selectedCategory, onUpdateMatches, onShare, onTabChange }: FixtureProps) {
  const [filter, setFilter] = useState<'todos' | 'proximos' | 'jugados'>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [faseFilter, setFaseFilter] = useState<'regular' | 'cuartos' | 'semifinal' | 'final'>('regular');
  const [fechaTorneoFilter, setFechaTorneoFilter] = useState<number | 'todas'>('todas');
  
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [isFaseOpen, setIsFaseOpen] = useState(false);
  const [isFechaOpen, setIsFechaOpen] = useState(false);
  
  // Dynamic unique fixture round numbers for the active category
  const uniqueFechas = Array.from(
    new Set(
      matches
        .filter(m => m.categoria === selectedCategory && (m.fase === 'regular' || !m.fase))
        .map(getMatchFechaNumber)
    )
  ).sort((a, b) => a - b);

  const fechasToRender = uniqueFechas.length > 0 ? uniqueFechas : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  
  // State for Editing
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form Fields for match
  const [localClub, setLocalClub] = useState('San Rafael Tenis Club');
  const [visitorClub, setVisitorClub] = useState('Rivadavia');
  const [customLocalName, setCustomLocalName] = useState('');
  const [customVisitorName, setCustomVisitorName] = useState('');
  const [rivalName, setRivalName] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('11:00');
  const [isLocal, setIsLocal] = useState(true);
  const [cancha, setCancha] = useState('');
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [golesPropios, setGolesPropios] = useState(0);
  const [golesRival, setGolesRival] = useState(0);
  const [estado, setEstado] = useState<MatchState>('Programado');
  const [mvpId, setMvpId] = useState('');
  const [fechaNumeroInput, setFechaNumeroInput] = useState<number>(1);
  const [fase, setFase] = useState<'regular' | 'cuartos' | 'semifinal' | 'final'>('regular');
  
  // Live lists of scorers and card bookings while editing
  const [selectedScorers, setSelectedScorers] = useState<{ jugadorId: string; cantidad: number }[]>([]);
  const [selectedAssisters, setSelectedAssisters] = useState<{ jugadorId: string; cantidad: number }[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ jugadorId: string; verde: boolean; amarilla: boolean; roja: boolean }[]>([]);

  // Filter & Sort matches
  const filteredMatches = matches
    .filter(m => m.categoria === selectedCategory)
    .filter(m => {
      // Phase filtering: fallback to 'regular' if not specified
      const matchFase = m.fase || 'regular';
      return matchFase === faseFilter;
    })
    .filter(m => {
      if (faseFilter !== 'regular' || fechaTorneoFilter === 'todas') return true;
      return getMatchFechaNumber(m) === fechaTorneoFilter;
    })
    .filter(m => {
      if (filter === 'proximos') return m.estado === 'Programado' || m.estado === 'En juego';
      if (filter === 'jugados') return m.estado === 'Finalizado' || m.estado === 'Suspendido';
      return true;
    })
    .filter(m => {
      // For playoff brackets, show all matchups so users can follow the tournament tree.
      // For regular season, apply the custom request filter if it is public.
      if (faseFilter !== 'regular') return true;
      
      // public users only see matches starring San Rafael Tenis Club
      if (userRole === 'public') {
        const localTeam = m.localNombre || (m.esLocal ? 'San Rafael Tenis Club' : m.rival);
        const visitorTeam = m.visitanteNombre || (!m.esLocal ? 'San Rafael Tenis Club' : m.rival);
        return localTeam === 'San Rafael Tenis Club' || visitorTeam === 'San Rafael Tenis Club';
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = `${a.fecha}T${a.hora}`;
      const dateB = `${b.fecha}T${b.hora}`;
      return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    });

  // Action: Open Edit Match Form
  const handleStartEdit = (match: Match) => {
    setEditingMatch(match);
    setIsCreating(false);
    
    const calculatedLocal = match.localNombre || (match.esLocal ? 'San Rafael Tenis Club' : match.rival);
    const calculatedVisitor = match.visitanteNombre || (!match.esLocal ? 'San Rafael Tenis Club' : match.rival);
    
    const localMatchInPopular = POPULAR_CLUBS.find(c => c.toLowerCase() === calculatedLocal.toLowerCase()) || calculatedLocal;
    const visitorMatchInPopular = POPULAR_CLUBS.find(c => c.toLowerCase() === calculatedVisitor.toLowerCase()) || calculatedVisitor;
    
    const isLocalPopular = POPULAR_CLUBS.some(c => c.toLowerCase() === calculatedLocal.toLowerCase());
    const isVisitorPopular = POPULAR_CLUBS.some(c => c.toLowerCase() === calculatedVisitor.toLowerCase());

    if (isLocalPopular) {
      setLocalClub(localMatchInPopular);
      setCustomLocalName('');
    } else {
      setLocalClub('Otro');
      setCustomLocalName(calculatedLocal);
    }

    if (isVisitorPopular) {
      setVisitorClub(visitorMatchInPopular);
      setCustomVisitorName('');
    } else {
      setVisitorClub('Otro');
      setCustomVisitorName(calculatedVisitor);
    }
    
    setRivalName(match.rival);
    setMatchDate(match.fecha);
    setMatchTime(match.hora);
    setIsLocal(match.esLocal);
    setCancha(match.cancha);
    
    // Determine goals local & visitor
    const isLocalSrtc = calculatedLocal.toLowerCase().includes('san rafael') || calculatedLocal.toLowerCase().includes('srtc');
    const isVisitorSrtc = calculatedVisitor.toLowerCase().includes('san rafael') || calculatedVisitor.toLowerCase().includes('srtc');
    if (isLocalSrtc) {
      setGolesLocal(match.golesPropios);
      setGolesVisitante(match.golesRival);
    } else if (isVisitorSrtc) {
      setGolesLocal(match.golesRival);
      setGolesVisitante(match.golesPropios);
    } else {
      setGolesLocal(match.golesPropios);
      setGolesVisitante(match.golesRival);
    }
    
    setEstado(match.estado);
    setMvpId(match.mvpId || '');
    setFechaNumeroInput(match.fechaNumero || getMatchFechaNumber(match));
    setFase(match.fase || 'regular');
    
    // Scorers map back
    setSelectedScorers(match.goleadorasIds || []);
    
    // Assists map back
    setSelectedAssisters(match.asistidorasIds || []);
    
    // Cards map back
    const cardsInitial = (match.tarjetas || []).map(t => ({
      jugadorId: t.jugadorId,
      verde: (t.verde || 0) > 0,
      amarilla: (t.amarilla || 0) > 0,
      roja: (t.roja || 0) > 0
    }));
    setSelectedCards(cardsInitial);
  };

  // Action: Open Create Match Form
  const handleStartCreate = () => {
    setEditingMatch(null);
    setIsCreating(true);
    setLocalClub('San Rafael Tenis Club');
    setVisitorClub('Rivadavia');
    setCustomLocalName('');
    setCustomVisitorName('');
    setRivalName('');
    const today = new Date().toISOString().split('T')[0];
    setMatchDate(today);
    setMatchTime('11:00');
    setIsLocal(true);
    setCancha('Sede San Jorge');
    setGolesLocal(0);
    setGolesVisitante(0);
    setEstado('Programado');
    setMvpId('');
    setSelectedScorers([]);
    setSelectedAssisters([]);
    setSelectedCards([]);
    setFase(faseFilter);
    
    // Find highest current fecha and default to next
    let maxFecha = 1;
    if (matches.length > 0) {
      maxFecha = Math.max(...matches.map(getMatchFechaNumber));
    }
    setFechaNumeroInput(maxFecha);
  };

  // Action: Save Form Data (both updates and newly created records)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLocal = localClub === 'Otro' ? customLocalName : localClub;
    const finalVisitor = visitorClub === 'Otro' ? customVisitorName : visitorClub;
    
    if (!finalLocal.trim() || !finalVisitor.trim() || !matchDate || !matchTime || !cancha.trim()) return;

    const isLocalSrtc = finalLocal.toLowerCase().includes('san rafael') || finalLocal.toLowerCase().includes('srtc');
    const isVisitorSrtc = finalVisitor.toLowerCase().includes('san rafael') || finalVisitor.toLowerCase().includes('srtc');
    
    let resolvedEsLocal = true;
    let resolvedRival = '';
    let resolvedGolesPropios = Number(golesLocal);
    let resolvedGolesRival = Number(golesVisitante);
    
    if (isLocalSrtc) {
      resolvedEsLocal = true;
      resolvedRival = finalVisitor;
      resolvedGolesPropios = Number(golesLocal);
      resolvedGolesRival = Number(golesVisitante);
    } else if (isVisitorSrtc) {
      resolvedEsLocal = false;
      resolvedRival = finalLocal;
      resolvedGolesPropios = Number(golesVisitante);
      resolvedGolesRival = Number(golesLocal);
    } else {
      // Neither is SRTC, assume local is primary/propios? Or just let standard behavior
      resolvedEsLocal = true;
      resolvedRival = finalVisitor;
      resolvedGolesPropios = Number(golesLocal);
      resolvedGolesRival = Number(golesVisitante);
    }

    let updatedList: Match[];

    const processedScorers = selectedScorers.filter(s => s.cantidad > 0);
    const processedAssisters = selectedAssisters.filter(a => a.cantidad > 0);
    const processedCards = selectedCards
      .filter(c => c.verde || c.amarilla || c.roja)
      .map(c => ({
        jugadorId: c.jugadorId,
        verde: c.verde ? 1 : 0,
        amarilla: c.amarilla ? 1 : 0,
        roja: c.roja ? 1 : 0
      }));

    if (isCreating) {
      const newMatch: Match = {
        id: 'match_' + Date.now(),
        fecha: matchDate,
        hora: matchTime,
        rival: resolvedRival,
        localNombre: finalLocal,
        visitanteNombre: finalVisitor,
        categoria: selectedCategory,
        esLocal: resolvedEsLocal,
        cancha: cancha,
        golesPropios: resolvedGolesPropios,
        golesRival: resolvedGolesRival,
        estado: estado,
        mvpId: estado === 'Finalizado' && mvpId ? mvpId : undefined,
        goleadorasIds: processedScorers,
        asistidorasIds: processedAssisters,
        tarjetas: processedCards,
        fechaNumero: Number(fechaNumeroInput),
        fase: fase
      };
      updatedList = [...matches, newMatch];
    } else if (editingMatch) {
      updatedList = matches.map(m => {
        if (m.id === editingMatch.id) {
          return {
            ...m,
            fecha: matchDate,
            hora: matchTime,
            rival: resolvedRival,
            localNombre: finalLocal,
            visitanteNombre: finalVisitor,
            esLocal: resolvedEsLocal,
            cancha: cancha,
            golesPropios: resolvedGolesPropios,
            golesRival: resolvedGolesRival,
            estado: estado,
            mvpId: estado === 'Finalizado' && mvpId ? mvpId : undefined,
            goleadorasIds: processedScorers,
            asistidorasIds: processedAssisters,
            tarjetas: processedCards,
            fechaNumero: Number(fechaNumeroInput),
            fase: fase
          };
        }
        return m;
      });
    } else {
      return;
    }

    onUpdateMatches(updatedList);
    setEditingMatch(null);
    setIsCreating(false);
  };

  const handleDelete = (matchId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      const updatedList = matches.filter(m => m.id !== matchId);
      onUpdateMatches(updatedList);
    }
  };

  // Scorers list helpers
  const handleAddScorerGoal = (playerId: string) => {
    setSelectedScorers(prev => {
      const exists = prev.find(s => s.jugadorId === playerId);
      if (exists) {
        return prev.map(s => s.jugadorId === playerId ? { ...s, cantidad: s.cantidad + 1 } : s);
      }
      return [...prev, { jugadorId: playerId, cantidad: 1 }];
    });
  };

  const handleSubScorerGoal = (playerId: string) => {
    setSelectedScorers(prev => {
      return prev.map(s => {
        if (s.jugadorId === playerId) {
          return { ...s, cantidad: Math.max(0, s.cantidad - 1) };
        }
        return s;
      }).filter(s => s.cantidad > 0);
    });
  };

  // Assisters list helpers
  const handleAddAssisterGoal = (playerId: string) => {
    setSelectedAssisters(prev => {
      const exists = prev.find(s => s.jugadorId === playerId);
      if (exists) {
        return prev.map(s => s.jugadorId === playerId ? { ...s, cantidad: s.cantidad + 1 } : s);
      }
      return [...prev, { jugadorId: playerId, cantidad: 1 }];
    });
  };

  const handleSubAssisterGoal = (playerId: string) => {
    setSelectedAssisters(prev => {
      return prev.map(s => {
        if (s.jugadorId === playerId) {
          return { ...s, cantidad: Math.max(0, s.cantidad - 1) };
        }
        return s;
      }).filter(s => s.cantidad > 0);
    });
  };

  const handleToggleCard = (playerId: string, cardType: 'verde' | 'amarilla' | 'roja') => {
    setSelectedCards(prev => {
      const exists = prev.find(c => c.jugadorId === playerId);
      if (exists) {
        return prev.map(c => c.jugadorId === playerId ? { ...c, [cardType]: !c[cardType] } : c);
      }
      return [...prev, {
        jugadorId: playerId,
        verde: cardType === 'verde',
        amarilla: cardType === 'amarilla',
        roja: cardType === 'roja'
      }];
    });
  };

  const getStatusBadge = (state: MatchState) => {
    switch (state) {
      case 'Finalizado':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalizado</span>
          </span>
        );
      case 'En juego':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-emerald-950/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping mr-0.5" />
            <span>En Vivo</span>
          </span>
        );
      case 'Suspendido':
        return (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Suspendido</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-lighter flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Programado</span>
          </span>
        );
    }
  };

  const handleShareResultDirect = (match: Match) => {
    const isPlayed = match.estado === 'Finalizado';
    const textStr = isPlayed 
      ? `Partido de 7ma División - SRTC: San Rafael Tenis Club ${match.golesPropios} - ${match.golesRival} ${match.rival} (${match.estado}). Cancha: ${match.cancha}.`
      : `Próximo Partido de 7ma División - SRTC: San Rafael Tenis Club contra ${match.rival} el ${formatFechaDdmmyyyy(match.fecha)} a las ${match.hora} Hs. Cancha: ${match.cancha}. ¡Vení a alentar!`;
    onShare(`Fixture San Rafael Tenis Club Hockey`, textStr);
  };

  return (
    <div id="fixture-tab" className="space-y-4">
      {/* 3 Dropdowns Unificados Modernos */}
      <div className="bg-club-gradient-elements p-4 rounded-2xl border border-white/10 shadow-xl space-y-4">
        
        {/* Encabezado y Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 select-none">
            <Filter className="w-4 h-4 text-emerald-450 shrink-0" />
            <h3 className="text-xs font-black text-indigo-100 uppercase tracking-wider font-sans">
              Filtros Avanzados de Competencia
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <button
                id="create-match-button"
                onClick={handleStartCreate}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 shadow-md cursor-pointer shrink-0 font-sports-condensed uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Partido
              </button>
            )}

            <button
              onClick={() => onTabChange('inicio')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 hover:text-white transition rounded-xl text-xs font-sports-condensed uppercase tracking-wider font-extrabold cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
              Volver
            </button>
          </div>
        </div>

        {/* Grilla de Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative">
          
          {/* Dropdown 1 — Estado de Partido */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-indigo-300/50 block mb-1.5 tracking-wider font-sans">
              Estado de Partido
            </label>
            <button
              onClick={() => {
                setIsEstadoOpen(!isEstadoOpen);
                setIsFaseOpen(false);
                setIsFechaOpen(false);
              }}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-100 font-bold transition cursor-pointer"
            >
              <span className="capitalize">{filter === 'todos' ? 'Todos los Partidos' : filter === 'proximos' ? 'Partidos Próximos' : 'Partidos Jugados'}</span>
              <motion.div
                animate={{ rotate: isEstadoOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-4 h-4 text-emerald-450 shrink-0" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isEstadoOpen && (
                <>
                  {/* Backdrop de clic invisible para cerrar dropdown */}
                  <div className="fixed inset-0 z-30" onClick={() => setIsEstadoOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-1.5 bg-[#0e142d] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-40"
                  >
                    {[
                      { val: 'todos', label: 'Todos los Partidos' },
                      { val: 'proximos', label: 'Partidos Próximos' },
                      { val: 'jugados', label: 'Partidos Jugados' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setFilter(opt.val as any);
                          setIsEstadoOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition ${
                          filter === opt.val
                            ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-extrabold border-l-3 border-[#7a9660]'
                            : 'text-indigo-200 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {filter === opt.val && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown 2 — Fase del Torneo */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-indigo-300/50 block mb-1.5 tracking-wider font-sans">
              Fase del Torneo
            </label>
            <button
              onClick={() => {
                setIsFaseOpen(!isFaseOpen);
                setIsEstadoOpen(false);
                setIsFechaOpen(false);
              }}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-100 font-bold transition cursor-pointer"
            >
              <span>
                {faseFilter === 'regular' ? 'Fase Regular' : faseFilter === 'cuartos' ? 'Cuartos de Final' : faseFilter === 'semifinal' ? 'Semifinal' : 'Final'}
              </span>
              <motion.div
                animate={{ rotate: isFaseOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-4 h-4 text-emerald-450 shrink-0" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isFaseOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFaseOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-1.5 bg-[#0e142d] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-40"
                  >
                    {[
                      { val: 'regular', label: 'Fase Regular' },
                      { val: 'cuartos', label: 'Cuartos de Final' },
                      { val: 'semifinal', label: 'Semifinal' },
                      { val: 'final', label: 'Final de Torneo' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setFaseFilter(opt.val as any);
                          // Reset round trigger if transition away from regular
                          if (opt.val !== 'regular') {
                            setFechaTorneoFilter('todas');
                          }
                          setIsFaseOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition ${
                          faseFilter === opt.val
                            ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-extrabold border-l-3 border-[#7a9660]'
                            : 'text-indigo-200 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {faseFilter === opt.val && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown 3 — Fecha de Torneo (Condicionado a Regular) */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-indigo-300/50 block mb-1.5 tracking-wider font-sans">
              Jornada / Fecha
            </label>
            <button
              disabled={faseFilter !== 'regular'}
              onClick={() => {
                setIsFechaOpen(!isFechaOpen);
                setIsEstadoOpen(false);
                setIsFaseOpen(false);
              }}
              className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                faseFilter === 'regular'
                  ? 'bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 cursor-pointer'
                  : 'bg-white/5 border-white/5 text-indigo-200/40 opacity-55 cursor-not-allowed'
              }`}
            >
              <span>
                {faseFilter !== 'regular' 
                  ? 'No Aplica en Playoffs' 
                  : fechaTorneoFilter === 'todas' 
                    ? 'Todas las Fechas' 
                    : `Fecha ${fechaTorneoFilter}`}
              </span>
              <motion.div
                animate={{ rotate: isFechaOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-4 h-4 text-emerald-450 shrink-0" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isFechaOpen && faseFilter === 'regular' && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFechaOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-1.5 bg-[#0e142d] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-40 max-h-60 overflow-y-auto no-scrollbar font-sans"
                  >
                    {/* Opción todas */}
                    <button
                      onClick={() => {
                        setFechaTorneoFilter('todas');
                        setIsFechaOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition ${
                        fechaTorneoFilter === 'todas'
                          ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-extrabold border-l-3 border-[#7a9660]'
                          : 'text-indigo-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="font-extrabold uppercase text-[10px] tracking-widest text-[#7a9660]">Todas las Fechas</span>
                      {fechaTorneoFilter === 'todas' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    {/* Cada número de fecha */}
                    {fechasToRender.map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setFechaTorneoFilter(num);
                          setIsFechaOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition ${
                          fechaTorneoFilter === num
                            ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-extrabold border-l-3 border-[#7a9660]'
                            : 'text-indigo-200 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>Fecha {num}</span>
                        {fechaTorneoFilter === num && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Editor Modal Overlay */}
      {(isCreating || editingMatch) && (
        <div id="match-edit-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-club-gradient border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-300 transform scale-100">
            {/* Header */}
            <div className="bg-black/30 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-450 animate-pulse" />
                {isCreating ? 'Agregar Nuevo Partido' : `Editar Partido vs ${editingMatch?.rival}`}
              </h3>
              <button
                onClick={() => {
                  setEditingMatch(null);
                  setIsCreating(false);
                }}
                className="text-white hover:bg-white/20 bg-white/10 hover:text-white text-xs cursor-pointer font-bold px-3 py-1.5 rounded transition"
              >
                Cerrar
              </button>
            </div>

            {/* Form Scroll Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-left bg-transparent text-white">
              {/* Club selection with Realtime logo loader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                {/* Local Club Block */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase font-extrabold tracking-wider text-emerald-300">Club Local</label>
                  </div>
                  <select
                    value={localClub}
                    onChange={(e) => {
                      setLocalClub(e.target.value);
                      if (e.target.value !== 'Otro') {
                        setCustomLocalName('');
                      }
                    }}
                    className="w-full bg-[#0d4f32]/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                  >
                    {POPULAR_CLUBS.map((club) => (
                      <option key={club} value={club} className="bg-[#0f1c3f] text-white">{club}</option>
                    ))}
                    <option value="Otro" className="bg-[#0f1c3f] text-white">Otro club (escribir)...</option>
                  </select>
                  {localClub === 'Otro' && (
                    <input
                      type="text"
                      value={customLocalName}
                      onChange={(e) => setCustomLocalName(e.target.value)}
                      placeholder="Nombre del club local"
                      className="w-full bg-[#0d4f32]/40 border border-emerald-500 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                      required
                    />
                  )}
                </div>

                {/* Visiting Club Block */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase font-extrabold tracking-wider text-emerald-300">Club Visitante</label>
                  </div>
                  <select
                    value={visitorClub}
                    onChange={(e) => {
                      setVisitorClub(e.target.value);
                      if (e.target.value !== 'Otro') {
                        setCustomVisitorName('');
                      }
                    }}
                    className="w-full bg-[#0d4f32]/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                  >
                    {POPULAR_CLUBS.map((club) => (
                      <option key={club} value={club} className="bg-[#0f1c3f] text-white">{club}</option>
                    ))}
                    <option value="Otro" className="bg-[#0f1c3f] text-white">Otro club (escribir)...</option>
                  </select>
                  {visitorClub === 'Otro' && (
                    <input
                      type="text"
                      value={customVisitorName}
                      onChange={(e) => setCustomVisitorName(e.target.value)}
                      placeholder="Nombre del club visitante"
                      className="w-full bg-[#0d4f32]/40 border border-emerald-500 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-white">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/80 mb-1.5">Cancha</label>
                  <input
                    type="text"
                    value={cancha}
                    onChange={(e) => setCancha(e.target.value)}
                    placeholder="Ej. Cancha Principal SRTC"
                    className="w-full bg-[#0d4f32]/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/80 mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-[#0d4f32]/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/80 mb-1.5">Hora</label>
                  <input
                    type="text"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    placeholder="Ej. 14:30"
                    className="w-full bg-[#0d4f32]/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Match Status, Date Number & Realtime Result Scoreboard */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-black/45 p-4 rounded-xl border border-white/10">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1.5 font-display">Nº de Fecha</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={fechaNumeroInput}
                    onChange={(e) => setFechaNumeroInput(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-550 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Fase del Torneo</label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value as 'regular' | 'cuartos' | 'semifinal' | 'final')}
                    className="w-full bg-black/30 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                  >
                    <option value="regular" className="bg-[#0f1c3f] text-white">Fase Regular</option>
                    <option value="cuartos" className="bg-[#0f1c3f] text-white">Cuartos de Final</option>
                    <option value="semifinal" className="bg-[#0f1c3f] text-white">Semifinal</option>
                    <option value="final" className="bg-[#0f1c3f] text-white">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/85 mb-1.5">Estado Partido</label>
                  <select
                     value={estado}
                     onChange={(e) => setEstado(e.target.value as MatchState)}
                     className="w-full bg-black/30 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                  >
                    <option value="Programado" className="bg-[#0f1c3f] text-white">Programado</option>
                    <option value="En juego" className="bg-[#0f1c3f] text-white">En juego</option>
                    <option value="Finalizado" className="bg-[#0f1c3f] text-white">Finalizado</option>
                    <option value="Suspendido" className="bg-[#0f1c3f] text-white">Suspendido</option>
                  </select>
                </div>

                {(estado === 'Finalizado' || estado === 'En juego') && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-emerald-450 mb-1.5">Goles Local</label>
                      <input
                        type="number"
                        min="0"
                        value={golesLocal}
                        onChange={(e) => setGolesLocal(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1.5 animate-pulse">Goles Visitante</label>
                      <input
                        type="number"
                        min="0"
                        value={golesVisitante}
                        onChange={(e) => setGolesVisitante(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Sub-form: Advanced Player performance details if Match is Finalizado */}
              {estado === 'Finalizado' && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-display">
                    <Award className="w-4 h-4 text-emerald-400 animate-bounce" /> Desempeño y Goles de Jugadoras (SRTC)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quick Scorers tally list */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/85 mb-1.5 font-display tracking-wide">Goleadoras</label>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5 divide-y divide-white/5">
                        {players.map(p => {
                          const scorer = selectedScorers.find(s => s.jugadorId === p.id);
                          const quantity = scorer?.cantidad || 0;
                          return (
                            <div key={p.id} className="flex items-center justify-between text-xs py-1.5">
                              <span className="text-white font-medium">#{p.numeroCamiseta} {p.nombre} {p.apellido}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSubScorerGoal(p.id)}
                                  className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded font-mono font-black text-center cursor-pointer transition flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className={`w-4 text-center font-bold font-mono ${quantity > 0 ? 'text-emerald-400 font-extrabold' : 'text-white/40'}`}>{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddScorerGoal(p.id)}
                                  className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded font-mono font-black text-center cursor-pointer transition flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Assisters tally list */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/85 mb-1.5 font-display tracking-wide">Asistidoras</label>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5 divide-y divide-white/5">
                        {players.map(p => {
                          const assister = selectedAssisters.find(a => a.jugadorId === p.id);
                          const quantity = assister?.cantidad || 0;
                          return (
                            <div key={p.id} className="flex items-center justify-between text-xs py-1.5">
                              <span className="text-white font-medium">#{p.numeroCamiseta} {p.nombre} {p.apellido}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSubAssisterGoal(p.id)}
                                  className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded font-mono font-black text-center cursor-pointer transition flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className={`w-4 text-center font-bold font-mono ${quantity > 0 ? 'text-emerald-400 font-extrabold' : 'text-white/40'}`}>{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddAssisterGoal(p.id)}
                                  className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded font-mono font-black text-center cursor-pointer transition flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Cards logs toggler */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-white/80 mb-1.5 font-display tracking-wide">Tarjetas en el Encuentro</label>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto divide-y divide-white/5">
                      {players.map(p => {
                        const cardState = selectedCards.find(c => c.jugadorId === p.id) || { verde: false, amarilla: false, roja: false };
                        return (
                          <div key={p.id} className="flex items-center justify-between py-2 text-xs">
                            <span className="text-white font-medium">{p.nombre} {p.apellido}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleCard(p.id, 'verde')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                  cardState.verde ? 'bg-green-600 text-white shadow-sm' : 'bg-white/10 text-white/40'
                                }`}
                              >
                                Verde
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCard(p.id, 'amarilla')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                  cardState.amarilla ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'bg-white/10 text-white/40'
                                }`}
                              >
                                Amarilla
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCard(p.id, 'roja')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                  cardState.roja ? 'bg-rose-600 text-white shadow-sm' : 'bg-white/10 text-white/40'
                                }`}
                              >
                                Roja
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Box actions */}
              <div className="border-t border-white/10 pt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMatch(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-colors duration-250 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Fixtures Cards Stack */}
      <div id="fixtures-stack" className="space-y-8 font-sans">
        {(() => {
          // If a playoff phase is selected, we render as a beautiful unified tournament tree branch
          if (faseFilter !== 'regular') {
            if (filteredMatches.length === 0) {
              return (
                <div className="text-center py-10 bg-[#0c142c] border border-white/5 rounded-2xl w-full">
                  <Trophy className="w-10 h-10 text-indigo-200/20 mx-auto mb-2" />
                  <p className="text-indigo-200/60 font-medium text-xs">No se encontraron partidos para esta categoría con los filtros aplicados.</p>
                </div>
              );
            }

            const headerTitles = {
              cuartos: 'Cuartos de Final (27-Jun)',
              semifinal: 'Semifinales (04-Jul)',
              final: 'La Gran Final (05-Jul)'
            };

            const headerTitle = headerTitles[faseFilter] || 'Playoffs';

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3 py-1 bg-club-gradient-elements/60 rounded-r-lg pr-4 w-fit shadow-md border border-white/5">
                  <h3 className="font-extrabold text-sm tracking-wider text-emerald-300 uppercase">
                    {headerTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {filteredMatches.map((match) => {
                    const isPlayed = match.estado === 'Finalizado';
                    const isLive = match.estado === 'En juego';
                    const { localTeam, visitorTeam } = getPlayoffMatchTeams(match, matches);
                    const isLocalSrtc = localTeam.toLowerCase().includes('san rafael') || localTeam.toLowerCase().includes('srtc');
                    const isVisitorSrtc = visitorTeam.toLowerCase().includes('san rafael') || visitorTeam.toLowerCase().includes('srtc');

                    let localGoles = 0;
                    let visitorGoles = 0;

                    if (isLocalSrtc) {
                      localGoles = match.golesPropios;
                      visitorGoles = match.golesRival;
                    } else if (isVisitorSrtc) {
                      localGoles = match.golesRival;
                      visitorGoles = match.golesPropios;
                    } else {
                      localGoles = match.golesPropios;
                      visitorGoles = match.golesRival;
                    }

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`bg-club-gradient-elements border ${
                          isLive 
                            ? 'border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/20' 
                            : 'border-white/10 hover:border-emerald-500/30'
                        } rounded-2xl p-4 sm:p-5 shadow-xl relative flex flex-col w-full`}
                      >
                        {/* Upper row: Date & status */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2 flex-wrap gap-2 text-left">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-semibold text-white/90">{formatFechaDdmmyyyy(match.fecha)}</span>
                            <span className="text-white/40">•</span>
                            <Clock className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-semibold text-white/90">{match.hora} Hs</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(match.estado)}
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 uppercase font-sans">
                              {match.categoria}ª Div
                            </span>
                          </div>
                        </div>

                        {/* Scoreboard Board */}
                        <div className="flex items-center justify-between py-2 gap-2 w-full overflow-hidden">
                          {/* Left Logo and name */}
                          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 bg-[#0a0f24] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg p-1 transition-transform hover:scale-105 shrink-0 overflow-hidden">
                              <ClubLogo teamName={localTeam} className="w-11 h-11 sm:w-14 sm:h-14" />
                            </div>
                            <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-black text-white mt-3 block leading-none tracking-tight w-full truncate whitespace-nowrap overflow-hidden text-ellipsis px-1">
                              {localTeam.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white/50 uppercase mt-1 font-bold tracking-wider font-sans">Local</span>
                          </div>

                          {/* Mid stats/scores (Highlighted Scoreboard) */}
                          <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-2.5 bg-black/25 border border-white/10 rounded-xl min-w-[76px] sm:min-w-[110px] shadow-2xl relative overflow-hidden group shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 pointer-events-none" />
                            {isPlayed ? (
                              <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-2xl sm:text-4xl font-extrabold font-mono tracking-tighter leading-none z-10">
                                <span className={isLocalSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{localGoles}</span>
                                <span className="text-indigo-200/30 font-normal text-lg sm:text-xl">-</span>
                                <span className={isVisitorSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{visitorGoles}</span>
                              </div>
                            ) : isLive ? (
                              <div className="flex flex-col items-center gap-1 z-10">
                                <div className="flex items-center gap-1.5 text-xl sm:text-3xl font-black text-amber-500 animate-pulse font-mono leading-none">
                                  <span>{localGoles}</span>
                                  <span className="text-indigo-200/30 text-xs">-</span>
                                  <span>{visitorGoles}</span>
                                </div>
                                <span className="text-[8px] font-black text-amber-500 animate-pulse uppercase tracking-widest leading-none">VIVO</span>
                              </div>
                            ) : (
                              <div className="text-indigo-200/50 font-mono font-black text-xs sm:text-sm tracking-widest z-10">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Right Logo and name */}
                          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 bg-[#0a0f24] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg p-1 transition-transform hover:scale-105 shrink-0 overflow-hidden">
                              <ClubLogo teamName={visitorTeam} className="w-11 h-11 sm:w-14 sm:h-14" />
                            </div>
                            <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-black text-white mt-3 block leading-none tracking-tight w-full truncate whitespace-nowrap overflow-hidden text-ellipsis px-1">
                              {visitorTeam.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white/50 uppercase mt-1 font-bold tracking-wider font-sans">Visitante</span>
                          </div>
                        </div>

                        {/* Beautiful list of scorers listed vertically */}
                        {isPlayed && match.goleadorasIds && match.goleadorasIds.length > 0 && (
                          <div className="mt-4 bg-black/20 rounded-xl p-3 border border-white/10 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1.5 font-sans">
                              {/* Hockey ball SVG */}
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white shrink-0 inline-block filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)]">
                                <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" stroke="#b9d3ed" strokeWidth="1" />
                                <circle cx="9" cy="9" r="0.9" fill="#94a3b8" />
                                <circle cx="15" cy="9" r="0.9" fill="#94a3b8" />
                                <circle cx="12" cy="12" r="0.9" fill="#94a3b8" />
                                <circle cx="9" cy="15" r="0.9" fill="#94a3b8" />
                                <circle cx="15" cy="15" r="0.9" fill="#94a3b8" />
                                <circle cx="12" cy="7.5" r="0.8" fill="#94a3b8" />
                                <circle cx="12" cy="16.5" r="0.8" fill="#94a3b8" />
                              </svg>
                              <span className="text-indigo-100 font-semibold uppercase font-display select-none text-[10px]">Goles del Club (SRTC)</span>
                            </div>
                            <div className="flex flex-col gap-2 pl-0.5">
                              {match.goleadorasIds.map((val) => {
                                const p = players.find(x => x.id === val.jugadorId);
                                if (!p) return null;
                                return (
                                  <div key={val.jugadorId} className="flex items-center justify-between text-xs font-semibold py-1 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="text-white select-all font-sans text-xs">{p.nombre} {p.apellido}</span>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-black shrink-0 tracking-wider">
                                      {val.cantidad === 1 ? '1 GOL' : `${val.cantidad} GOLES`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Foot indicators */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-indigo-200">
                          <div className="flex items-center gap-1.5 justify-start text-left">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Cancha: <strong className="text-white">{match.cancha}</strong></span>
                          </div>

                          {/* Operational actions */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px]"
                              onClick={() => handleShareResultDirect(match)}
                            >
                              Compartir
                            </Button>
                            {userRole === 'admin' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="text-[10px] flex items-center gap-1"
                                  onClick={() => handleStartEdit(match)}
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Cargar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="text-[10px] p-2"
                                  onClick={() => handleDelete(match.id)}
                                  title="Eliminar Partido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Group matches by tournament date number
          const grouped: { [key: number]: Match[] } = {};
          filteredMatches.forEach((m) => {
            const fNum = getMatchFechaNumber(m);
            if (!grouped[fNum]) {
              grouped[fNum] = [];
            }
            grouped[fNum].push(m);
          });

          const sortedKeys = Object.keys(grouped)
            .map(Number)
            .sort((a, b) => sortOrder === 'asc' ? a - b : b - a);

          if (sortedKeys.length === 0) {
            return (
              <div className="text-center py-12 bg-club-gradient-elements border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 shadow-inner">
                <HockeyAnim size="lg" className="mb-4" />
                <p className="text-indigo-200 font-semibold text-sm max-w-sm">No se encontraron partidos para esta categoría.</p>
                <p className="text-indigo-400/80 text-xs mt-1 max-w-xs">Probá cambiando los filtros o la fecha seleccionada.</p>
              </div>
            );
          }

          return sortedKeys.map((fechaNum) => {
            const matchesInFecha = grouped[fechaNum];
            return (
              <div key={fechaNum} className="space-y-4">
                {/* Fecha Group Header Banner */}
                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3 py-1 bg-club-gradient-elements/60 rounded-r-lg pr-4 w-fit shadow-md border border-white/5">
                  <h3 className="font-extrabold text-sm tracking-wider text-emerald-300 uppercase">
                    Fecha {fechaNum}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {matchesInFecha.map((match) => {
                    const isPlayed = match.estado === 'Finalizado';
                    const isLive = match.estado === 'En juego';
                    const { localTeam, visitorTeam } = getPlayoffMatchTeams(match, matches);
                    const isLocalSrtc = localTeam.toLowerCase().includes('san rafael') || localTeam.toLowerCase().includes('srtc');
                    const isVisitorSrtc = visitorTeam.toLowerCase().includes('san rafael') || visitorTeam.toLowerCase().includes('srtc');

                    let localGoles = 0;
                    let visitorGoles = 0;

                    if (isLocalSrtc) {
                      localGoles = match.golesPropios;
                      visitorGoles = match.golesRival;
                    } else if (isVisitorSrtc) {
                      localGoles = match.golesRival;
                      visitorGoles = match.golesPropios;
                    } else {
                      // Neutral or other teams' match
                      localGoles = match.golesPropios;
                      visitorGoles = match.golesRival;
                    }
                    
                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`bg-club-gradient-elements border ${
                          isLive 
                            ? 'border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/20' 
                            : 'border-white/10 hover:border-emerald-500/30'
                        } rounded-2xl p-4 sm:p-5 shadow-xl relative flex flex-col w-full`}
                      >
                        {/* Upper row: Date & status */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2 flex-wrap gap-2 text-left">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-semibold text-white">{formatFechaDdmmyyyy(match.fecha)}</span>
                            <span className="text-white/40">•</span>
                            <Clock className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-semibold text-white">{match.hora} Hs</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(match.estado)}
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 uppercase font-sans">
                              {match.categoria}ª Div
                            </span>
                          </div>
                        </div>

                        {/* Scoreboard Board */}
                        <div className="flex items-center justify-between py-2 gap-2 w-full overflow-hidden">
                          {/* Left Logo and name */}
                          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 bg-[#0a0f24] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg p-1 transition-transform hover:scale-105 shrink-0 overflow-hidden">
                              <ClubLogo teamName={localTeam} className="w-11 h-11 sm:w-14 sm:h-14" />
                            </div>
                            <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-black text-white mt-3 block leading-none tracking-tight w-full truncate whitespace-nowrap overflow-hidden text-ellipsis px-1">
                              {localTeam.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white uppercase mt-1 font-bold tracking-wider">Local</span>
                          </div>

                          {/* Mid stats/scores (Highlighted Scoreboard) */}
                          <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-2.5 bg-black/25 border border-white/10 rounded-xl min-w-[76px] sm:min-w-[110px] shadow-2xl relative overflow-hidden group shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 pointer-events-none" />
                            {isPlayed ? (
                              <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-2xl sm:text-4xl font-extrabold font-mono tracking-tighter leading-none z-10">
                                <span className={isLocalSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{localGoles}</span>
                                <span className="text-indigo-200/30 font-normal text-lg sm:text-xl">-</span>
                                <span className={isVisitorSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{visitorGoles}</span>
                              </div>
                            ) : isLive ? (
                              <div className="flex flex-col items-center gap-1 z-10">
                                <div className="flex items-center gap-1.5 text-xl sm:text-3xl font-black text-amber-500 animate-pulse font-mono leading-none">
                                  <span>{localGoles}</span>
                                  <span className="text-indigo-200/30 text-xs">-</span>
                                  <span>{visitorGoles}</span>
                                </div>
                                <span className="text-[8px] font-black text-amber-500 animate-pulse uppercase tracking-widest leading-none">VIVO</span>
                              </div>
                            ) : (
                              <div className="text-indigo-200/50 font-mono font-black text-xs sm:text-sm tracking-widest z-10">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Right Logo and name */}
                          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 bg-[#0a0f24] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg p-1 transition-transform hover:scale-105 shrink-0 overflow-hidden">
                              <ClubLogo teamName={visitorTeam} className="w-11 h-11 sm:w-14 sm:h-14" />
                            </div>
                            <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-black text-white mt-3 block leading-none tracking-tight w-full truncate whitespace-nowrap overflow-hidden text-ellipsis px-1">
                              {visitorTeam.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white uppercase mt-1 font-bold tracking-wider">Visitante</span>
                          </div>
                        </div>

                        {/* Beautiful list of scorers listed vertically (uno debajo del otro) */}
                        {isPlayed && match.goleadorasIds && match.goleadorasIds.length > 0 && (
                          <div className="mt-4 bg-black/20 rounded-xl p-3 border border-white/10 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                              {/* Hockey ball SVG representing a real white dimpled hockey puck/ball */}
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white shrink-0 inline-block filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)]">
                                <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" stroke="#b9d3ed" strokeWidth="1" />
                                <circle cx="9" cy="9" r="0.9" fill="#94a3b8" />
                                <circle cx="15" cy="9" r="0.9" fill="#94a3b8" />
                                <circle cx="12" cy="12" r="0.9" fill="#94a3b8" />
                                <circle cx="9" cy="15" r="0.9" fill="#94a3b8" />
                                <circle cx="15" cy="15" r="0.9" fill="#94a3b8" />
                                <circle cx="12" cy="7.5" r="0.8" fill="#94a3b8" />
                                <circle cx="12" cy="16.5" r="0.8" fill="#94a3b8" />
                              </svg>
                              <span className="text-indigo-100 font-semibold uppercase font-display select-none">Goles del Club (SRTC)</span>
                            </div>
                            <div className="flex flex-col gap-2 pl-0.5">
                              {match.goleadorasIds.map((val) => {
                                const p = players.find(x => x.id === val.jugadorId);
                                if (!p) return null;
                                return (
                                  <div key={val.jugadorId} className="flex items-center justify-between text-xs font-semibold py-1 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="text-white select-all font-sans text-xs">{p.nombre} {p.apellido}</span>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-black shrink-0 tracking-wider">
                                      {val.cantidad === 1 ? '1 GOL' : `${val.cantidad} GOLES`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Foot indicators */}
                        <div className="mt-auto pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-indigo-200">
                          <div className="flex items-center gap-1.5 justify-start text-left">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Cancha: <strong className="text-white">{match.cancha}</strong></span>
                          </div>

                          {/* Operational actions */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px]"
                              onClick={() => handleShareResultDirect(match)}
                            >
                              Compartir
                            </Button>
                            {userRole === 'admin' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="text-[10px] flex items-center gap-1"
                                  onClick={() => handleStartEdit(match)}
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Cargar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="text-[10px] p-2"
                                  onClick={() => handleDelete(match.id)}
                                  title="Eliminar Partido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
