/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, User, Clock, Calendar, HelpCircle, Save, CheckCircle, ShieldAlert, Plus, Zap, HeartPulse } from 'lucide-react';
import { Convocation, Match, Player, UserRole, Category } from '../../types';
import { formatFechaDdmmyyyy } from './Fixture';

interface ConvocatoriasProps {
  convocations: Convocation[];
  matches: Match[];
  players: Player[];
  userRole: UserRole;
  selectedCategory: Category;
  onUpdateConvocations: (updated: Convocation[]) => void;
}

export default function Convocatorias({ convocations, matches, players, userRole, selectedCategory, onUpdateConvocations }: ConvocatoriasProps) {
  // Get upcoming fixtures in active category to assemble team lists
  const upcomingMatches = matches.filter(m => m.categoria === selectedCategory && m.estado === 'Programado');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(upcomingMatches[0]?.id || 'generic');

  // Find or create current convocation record for this match-day
  const activeMatch = matches.find(m => m.id === selectedMatchId) || upcomingMatches[0];
  const activeConvocation = convocations.find(c => c.id === selectedMatchId) || {
    id: selectedMatchId,
    fecha: activeMatch?.fecha || new Date().toISOString().split('T')[0],
    rival: activeMatch?.rival || 'Torneo Interno',
    categoria: selectedCategory,
    estadosJugadoras: {}
  };

  // Helper: update state in parent manager
  const handleUpdatePlayerState = (playerId: string, newState: 'Convocada' | 'Ausente' | 'Lesionada') => {
    if (userRole !== 'admin') return; // restriction check

    const updatedConvs = convocations.map(c => {
      if (c.id === selectedMatchId) {
        return {
          ...c,
          estadosJugadoras: {
            ...c.estadosJugadoras,
            [playerId]: newState
          }
        };
      }
      return c;
    });

    // If the record wasn't registered in the DB lists yet, append it!
    const exists = convocations.some(c => c.id === selectedMatchId);
    if (!exists) {
      const newRecord: Convocation = {
        id: selectedMatchId,
        fecha: activeMatch?.fecha || new Date().toISOString().split('T')[0],
        rival: activeMatch?.rival || 'Próximo Rival',
        categoria: selectedCategory,
        estadosJugadoras: {
          ...activeConvocation.estadosJugadoras,
          [playerId]: newState
        }
      };
      onUpdateConvocations([...convocations, newRecord]);
    } else {
      onUpdateConvocations(updatedConvs);
    }
  };

  // Filters roster players by Call-up category
  const activeRoster = players.filter(p => p.categoria === selectedCategory);

  // Group players by current statuses
  const convocadasList = activeRoster.filter(p => {
    const state = activeConvocation.estadosJugadoras[p.id] || 'Convocada'; // default to callup
    return state === 'Convocada';
  });

  const ausentesList = activeRoster.filter(p => {
    return activeConvocation.estadosJugadoras[p.id] === 'Ausente';
  });

  const lesionadasList = activeRoster.filter(p => {
    return activeConvocation.estadosJugadoras[p.id] === 'Lesionada';
  });

  return (
    <div id="convocatorias-tab" className="space-y-6 text-left">
      {/* Banner introduction with match dropdown picker */}
      <div className="bg-gradient-to-r from-neutral-900 to-indigo-950/40 p-5 rounded-2xl border border-neutral-800 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="font-extrabold text-white text-base flex items-center gap-1.5 font-sans">
            <Award className="w-5 h-5 text-indigo-400" />
            Convocatorias de Plantel
          </h2>
          <p className="text-xs text-neutral-400">
            Armado oficial del equipo para el próximo encuentro. Categoría {selectedCategory}.
          </p>
        </div>

        {/* Dropdown match picker */}
        {upcomingMatches.length > 0 ? (
          <div>
            <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-1">Seleccionar Partido de Destino</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
            >
              {upcomingMatches.map(m => (
                <option key={m.id} value={m.id}>vs {m.rival} ({m.fecha})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">No hay próximos partidos en fixture para convocar.</div>
        )}
      </div>

      {activeMatch && (
        <div className="bg-neutral-950/70 border border-neutral-850 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span className="text-neutral-300">Próximo Compromiso: <strong className="text-white">vs {activeMatch.rival}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span className="text-neutral-300">Fecha y Hora: <strong className="text-white">{formatFechaDdmmyyyy(activeMatch.fecha)} a las {activeMatch.hora} Hs</strong></span>
          </div>
        </div>
      )}

      {/* Role-based action banner */}
      {(userRole === 'admin') && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 p-3 rounded-xl flex items-center gap-2">
          <Zap className="w-4.5 h-4.5 text-rose-400 shrink-0" />
          <p>
            <strong>Consola de Administración Activa:</strong> Podés cambiar las convocatorias de cualquier jugadora haciendo clic en las opciones correspondientes de su respectiva ficha abajo.
          </p>
        </div>
      )}
    
      {/* Core Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* GROUP 1: CONVOCADAS (Selected Roster) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-green-500/30 pb-2">
            <span className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> CONVOCADAS ({convocadasList.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {convocadasList.length > 0 ? (
              convocadasList.map((player) => (
                <div key={player.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={player.fotoUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-full border border-neutral-800"
                    />
                    <div>
                      <h4 className="font-bold text-white mb-0.5">{player.nombre} {player.apellido}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>#{player.numeroCamiseta}</span>
                        <span>•</span>
                        <span>{player.posicion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle controls if editor role */}
                  {(userRole === 'admin') && (
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-850 gap-1 mt-1">
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Ausente')}
                        className="flex-1 py-1 text-[9px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 rounded cursor-pointer"
                      >
                        Marcar Ausente
                      </button>
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Lesionada')}
                        className="flex-1 py-1 text-[9px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded cursor-pointer"
                      >
                        Marcar Lesionada
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No hay jugadoras convocadas en este momento.</p>
            )}
          </div>
        </div>

        {/* GROUP 2: AUSENTES (Absent / Excused) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-750 pb-2">
            <span className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-4 h-4 text-neutral-400" /> AUSENTES / LICENCIA ({ausentesList.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {ausentesList.length > 0 ? (
              ausentesList.map((player) => (
                <div key={player.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={player.fotoUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-full border border-neutral-800 opacity-60"
                    />
                    <div>
                      <h4 className="font-bold text-neutral-450 mb-0.5 line-through">{player.nombre} {player.apellido}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                        <span>#{player.numeroCamiseta}</span>
                        <span>•</span>
                        <span>{player.posicion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle controls if editor role */}
                  {(userRole === 'admin') && (
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-850 gap-1 mt-1">
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Convocada')}
                        className="flex-1 py-1 text-[9px] font-bold text-green-400 hover:text-green-300 hover:bg-green-950/20 rounded cursor-pointer"
                      >
                        Convocar
                      </button>
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Lesionada')}
                        className="flex-1 py-1 text-[9px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded cursor-pointer"
                      >
                        Marcar Lesionada
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No hay jugadoras reportadas como ausentes.</p>
            )}
          </div>
        </div>

        {/* GROUP 3: LESIONADAS (Injured) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" /> LESIONADAS / PARTE MÉDICO ({lesionadasList.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {lesionadasList.length > 0 ? (
              lesionadasList.map((player) => (
                <div key={player.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={player.fotoUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-full border border-neutral-800"
                    />
                    <div>
                      <h4 className="font-bold text-rose-400 mb-0.5">{player.nombre} {player.apellido}</h4>
                      <p className="text-[10px] text-rose-500/80 font-black animate-pulse flex items-center gap-0.5">⚠️ PARTE MÉDICO</p>
                    </div>
                  </div>

                  {/* Toggle controls if editor role */}
                  {(userRole === 'admin') && (
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-850 gap-1 mt-1">
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Convocada')}
                        className="flex-1 py-1 text-[9px] font-bold text-green-400 hover:text-green-300 hover:bg-green-950/20 rounded cursor-pointer"
                      >
                        Dar de Alta / Convocar
                      </button>
                      <button 
                        onClick={() => handleUpdatePlayerState(player.id, 'Ausente')}
                        className="flex-1 py-1 text-[9px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 rounded cursor-pointer"
                      >
                        Marcar Ausente
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">¡Excepcional! No hay jugadoras registradas en el parte médico.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
