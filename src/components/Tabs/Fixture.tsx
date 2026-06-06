/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Edit3, Plus, Trophy, Save, Trash2, Award, CheckCircle2, AlertTriangle, Play, ChevronLeft } from 'lucide-react';
import { Match, Player, UserRole, MatchState, Category } from '../../types';
import SrtcLogo from '../SrtcLogo';
import ClubLogo from '../ClubLogo';

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

export default function Fixture({ matches, players, userRole, selectedCategory, onUpdateMatches, onShare, onTabChange }: FixtureProps) {
  const [filter, setFilter] = useState<'todos' | 'proximos' | 'jugados'>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
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
  
  // Live lists of scorers and card bookings while editing
  const [selectedScorers, setSelectedScorers] = useState<{ jugadorId: string; cantidad: number }[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ jugadorId: string; verde: boolean; amarilla: boolean; roja: boolean }[]>([]);

  // Filter & Sort matches
  const filteredMatches = matches
    .filter(m => m.categoria === selectedCategory)
    .filter(m => {
      if (filter === 'proximos') return m.estado === 'Programado' || m.estado === 'En juego';
      if (filter === 'jugados') return m.estado === 'Finalizado' || m.estado === 'Suspendido';
      return true;
    })
    .filter(m => {
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
    
    // Scorers map back
    setSelectedScorers(match.goleadorasIds || []);
    
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
    setSelectedCards([]);
    
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
        tarjetas: processedCards,
        fechaNumero: Number(fechaNumeroInput)
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
            tarjetas: processedCards,
            fechaNumero: Number(fechaNumeroInput)
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
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Finalizado</span>;
      case 'En juego':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 animate-pulse"><Play className="w-3 h-3" /> En juego</span>;
      case 'Suspendido':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Suspendido</span>;
      default:
        return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Programado</span>;
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
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-club-gradient-elements p-3 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
              filter === 'todos' ? 'bg-club-gradient text-white shadow border border-white/10' : 'bg-white/5 text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('proximos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
              filter === 'proximos' ? 'bg-club-gradient text-white shadow border border-white/10' : 'bg-white/5 text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('jugados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
              filter === 'jugados' ? 'bg-club-gradient text-white shadow border border-white/10' : 'bg-white/5 text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            Jugados
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {userRole === 'admin' && (
            <button
              id="create-match-button"
              onClick={handleStartCreate}
              className="flex items-center justify-center gap-1.5 bg-emerald-650 hover:bg-emerald-550 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Partido
            </button>
          )}

          <button
            onClick={() => onTabChange('inicio')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 hover:text-white transition rounded-xl text-xs font-sports-condensed uppercase tracking-wider font-extrabold cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
            Volver
          </button>
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

                  <div className="grid grid-cols-1 gap-4">
                    {/* Quick Scorers tally list */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/80 mb-1.5 font-display tracking-wide">Goleadoras</label>
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
              <div className="text-center py-10 bg-club-gradient-elements border border-white/10 rounded-2xl">
                <Trophy className="w-10 h-10 text-indigo-200/40 mx-auto mb-2" />
                <p className="text-indigo-200 font-medium text-xs">No se encontraron partidos para esta categoría con los filtros aplicados.</p>
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

                <div className={`grid gap-5 ${
                  userRole === 'admin' || userRole === 'coach'
                    ? 'grid-cols-1 lg:grid-cols-2 lg:gap-4'
                    : 'grid-cols-1 max-w-4xl mx-auto w-full'
                }`}>
                  {matchesInFecha.map((match) => {
                    const isPlayed = match.estado === 'Finalizado';
                    const isLive = match.estado === 'En juego';
                    const localTeam = match.localNombre || (match.esLocal ? 'San Rafael Tenis Club' : match.rival);
                    const visitorTeam = match.visitanteNombre || (!match.esLocal ? 'San Rafael Tenis Club' : match.rival);
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
                      <div
                        key={match.id}
                        className={`bg-club-gradient-elements border ${
                          isLive ? 'border-emerald-500 shadow-emerald-500/15 scale-[1.01]' : 'border-white/10'
                        } rounded-2xl p-5 shadow-xl relative flex flex-col justify-between transition duration-350 hover:border-emerald-500/30 w-full hover:-translate-y-0.5`}
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
                        <div className="flex items-center justify-between py-2 gap-2">
                          {/* Left Logo and name */}
                          <div className="flex flex-col items-center w-5/12 text-center">
                            <div className="w-19 h-19 sm:w-22 sm:h-22 bg-[#0f1c3f] border border-white/10 rounded-full flex items-center justify-center shadow-lg pb-0.5 transition-transform hover:scale-105">
                              <ClubLogo teamName={localTeam} className="w-15 h-15 sm:w-18 sm:h-18" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-white mt-3 block leading-tight tracking-tight w-full break-words">
                              {localTeam.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white uppercase mt-1 font-bold tracking-wider">Local</span>
                          </div>

                          {/* Mid stats/scores (Highlighted Scoreboard) */}
                          <div className="flex flex-col items-center justify-center px-4 py-2.5 bg-black/25 border border-white/10 rounded-xl min-w-[90px] sm:min-w-[120px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 pointer-events-none" />
                            {isPlayed ? (
                              <div className="flex items-center justify-center gap-2 sm:gap-3.5 text-3xl sm:text-5xl font-extrabold font-mono tracking-tighter leading-none z-10">
                                <span className={isLocalSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{localGoles}</span>
                                <span className="text-indigo-200/30 font-normal text-xl sm:text-2xl">-</span>
                                <span className={isVisitorSrtc ? "text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}>{visitorGoles}</span>
                              </div>
                            ) : isLive ? (
                              <div className="flex flex-col items-center gap-1 z-10">
                                <div className="flex items-center gap-2 text-2xl sm:text-4xl font-black text-amber-500 animate-pulse font-mono leading-none">
                                  <span>{localGoles}</span>
                                  <span className="text-indigo-200/30 text-sm">-</span>
                                  <span>{visitorGoles}</span>
                                </div>
                                <span className="text-[8px] font-black text-amber-500 animate-pulse uppercase tracking-widest leading-none">VIVO</span>
                              </div>
                            ) : (
                              <div className="text-indigo-200/50 font-mono font-black text-sm sm:text-base tracking-widest z-10">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Right Logo and name */}
                          <div className="flex flex-col items-center w-5/12 text-center">
                            <div className="w-19 h-19 sm:w-22 sm:h-22 bg-[#0f1c3f] border border-white/10 rounded-full flex items-center justify-center shadow-lg pb-0.5 transition-transform hover:scale-105">
                              <ClubLogo teamName={visitorTeam} className="w-15 h-15 sm:w-18 sm:h-18" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-white mt-3 block leading-tight tracking-tight w-full break-words">
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
                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-indigo-200">
                          <div className="flex items-center gap-1.5 justify-start text-left">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Cancha: <strong className="text-white">{match.cancha}</strong></span>
                          </div>

                          {/* Operational actions */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                            <button
                               onClick={() => handleShareResultDirect(match)}
                               className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-extrabold transition text-[11px] font-bold cursor-pointer"
                            >
                              Compartir
                            </button>
                            {(userRole === 'admin' || userRole === 'coach') && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(match)}
                                  className="px-2.5 py-1.5 rounded bg-emerald-600/35 text-white hover:bg-emerald-500 hover:text-white transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-white" /> Cargar
                                </button>
                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => handleDelete(match.id)}
                                    className="px-2.5 py-1.5 rounded bg-rose-600/15 text-rose-400 hover:bg-rose-600 hover:text-white transition text-[11px] font-bold cursor-pointer"
                                    title="Eliminar Partido"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
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
