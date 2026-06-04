/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { AreaChart, BarChart3, Award, Trophy, Users, ShieldAlert, Star, Shield, ThumbsUp } from 'lucide-react';
import { Player, Match, Category } from '../../types';

interface EstadisticasProps {
  players: Player[];
  matches: Match[];
  selectedCategory: Category;
}

export default function Estadisticas({ players, matches, selectedCategory }: EstadisticasProps) {
  const [activeBoard, setActiveBoard] = useState<'goles' | 'asistencias' | 'presencias' | 'tarjetas'>('goles');

  // Filter players by current category
  const activePlayers = players.filter(p => p.categoria === selectedCategory);

  // 1. Leaderboard: Goleadoras
  const topScorers = [...activePlayers]
    .filter(p => p.goles > 0)
    .sort((a,b) => b.goles - a.goles || a.apellido.localeCompare(b.apellido));

  const maxGoles = topScorers.length > 0 ? topScorers[0].goles : 1;

  // 2. Leaderboard: Asistencias
  const topAssists = [...activePlayers]
    .filter(p => p.asistencias > 0)
    .sort((a,b) => b.asistencias - a.asistencias || a.apellido.localeCompare(b.apellido));

  const maxAsistencias = topAssists.length > 0 ? topAssists[0].asistencias : 1;

  // 3. Leaderboard: Partidos Jugados
  const topPresences = [...activePlayers]
    .filter(p => p.partidosJugados > 0)
    .sort((a,b) => b.partidosJugados - a.partidosJugados || a.apellido.localeCompare(b.apellido));

  const maxPresencias = topPresences.length > 0 ? topPresences[0].partidosJugados : 1;

  // 4. Leaderboard: Tarjetas points (Verde=1pt, Amarilla=3pts, Roja=10pts)
  const topCards = [...activePlayers]
    .map(p => ({
      ...p,
      points: (p.tarjetaVerde * 1) + (p.tarjetaAmarilla * 3) + (p.tarjetaRoja * 10)
    }))
    .filter(p => p.points > 0)
    .sort((a,b) => b.points - a.points);

  const maxCardPoints = topCards.length > 0 ? topCards[0].points : 1;

  // Helper to determine if a match belongs to San Rafael Tenis Club
  const isSrtcMatch = (m: Match) => {
    const localTeam = m.localNombre || (m.esLocal ? 'San Rafael Tenis Club' : m.rival);
    const visitorTeam = m.visitanteNombre || (!m.esLocal ? 'San Rafael Tenis Club' : m.rival);
    const isLocalSrtc = localTeam.toLowerCase().includes('san rafael') || localTeam.toLowerCase().includes('srtc');
    const isVisitorSrtc = visitorTeam.toLowerCase().includes('san rafael') || visitorTeam.toLowerCase().includes('srtc');
    return isLocalSrtc || isVisitorSrtc;
  };

  // Get completed matches in current category played by San Rafael Tenis Club
  const finishedMatchesAll = matches.filter(m => m.categoria === selectedCategory && m.estado === 'Finalizado');
  const srtcFinishedMatches = finishedMatchesAll.filter(isSrtcMatch);

  // Statistics calculations:
  const partidosJugados = srtcFinishedMatches.length;
  const golesConvertidos = srtcFinishedMatches.reduce((acc, curr) => acc + curr.golesPropios, 0);
  
  // SRTC wins if golesPropios > golesRival
  const srtcWonMatches = srtcFinishedMatches.filter(m => m.golesPropios > m.golesRival);
  const partidosGanados = srtcWonMatches.length;
  const winPercentage = partidosJugados > 0 ? Math.round((partidosGanados / partidosJugados) * 100) : 0;
  
  const cantidadJugadoras = activePlayers.length;

  // Find top goalscorer(s) of the team
  const playersWithGoals = activePlayers.filter(p => p.goles > 0);
  const maxTeamGoals = playersWithGoals.length > 0 ? Math.max(...playersWithGoals.map(p => p.goles)) : 0;
  const topScorersList = maxTeamGoals > 0 ? activePlayers.filter(p => p.goles === maxTeamGoals) : [];

  return (
    <div id="statistics-tab" className="space-y-6 text-left">
      {/* Visual Bento Dashboard Header (4 elements grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total stats counters */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-emerald-555 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Partidos Jugados</span>
            <strong className="text-xl font-bold text-white font-mono">{partidosJugados}</strong>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-555 bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Goles Convertidos</span>
            <strong className="text-xl font-bold text-white font-mono">{golesConvertidos}</strong>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-md col-span-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-555 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ganados (Ef.)</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-bold text-white font-mono">{partidosGanados}</strong>
              <span className="text-xs font-bold text-emerald-400 font-mono">({winPercentage}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-md col-span-1">
          <div className="w-10 h-10 rounded-lg bg-indigo-555 bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Jugadoras</span>
            <strong className="text-xl font-bold text-white font-mono">{cantidadJugadoras}</strong>
          </div>
        </div>
      </div>

      {/* Dynamic Team Top Goalscorers List Box */}
      <div className="bg-gradient-to-r from-neutral-900 via-emerald-950/10 to-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-800/40 pb-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            {topScorersList.length > 1 ? 'Máximas Goleadoras del Equipo' : 'Máxima Goleadora del Equipo'}
          </span>
        </div>

        {topScorersList.length > 0 ? (
          <div className={`grid grid-cols-1 ${topScorersList.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
            {topScorersList.map((player) => (
              <div key={player.id} className="flex items-center gap-4 bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3 hover:border-emerald-500/30 transition duration-150">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 overflow-hidden">
                    {player.fotoUrl ? (
                      <img 
                        src={player.fotoUrl} 
                        alt={player.nombre} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono font-black text-sm uppercase">{player.nombre[0]}{player.apellido[0]}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 rounded-full w-4.5 h-4.5 flex items-center justify-center font-black text-[9px] shadow">
                    🏑
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-white text-sm truncate">
                    {player.nombre} {player.apellido}
                  </h4>
                  <p className="text-[10px] text-neutral-400 truncate">
                    Camiseta #{player.numeroCamiseta} • {player.posicion}
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg text-center shrink-0 min-w-[70px]">
                  <span className="text-[8px] text-neutral-400 font-bold uppercase block leading-none mb-0.5">Goles</span>
                  <strong className="text-sm font-black text-emerald-400 font-mono leading-none">{player.goles}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-neutral-400">Aún no se han registrado goles de jugadoras para esta categoría esta temporada.</p>
          </div>
        )}
      </div>

      {/* Tabs Selector for Leaderboards */}
      <div className="flex bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
        <button
          onClick={() => setActiveBoard('goles')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${
            activeBoard === 'goles' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Goleadoras
        </button>
        <button
          onClick={() => setActiveBoard('asistencias')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${
            activeBoard === 'asistencias' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Asistencias
        </button>
        <button
          onClick={() => setActiveBoard('presencias')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${
            activeBoard === 'presencias' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Partidos Jugados
        </button>
        <button
          onClick={() => setActiveBoard('tarjetas')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${
            activeBoard === 'tarjetas' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Tarjetas
        </button>
      </div>

      {/* Core Table / Custom Charts Displays */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Render Goles Bar-Meters */}
        {activeBoard === 'goles' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>⚽ Leaderboard: Goleadoras</span>
            </h4>

            {topScorers.length > 0 ? (
              <div className="space-y-4.5">
                {topScorers.slice(0, 10).map((player, index) => {
                  const widthPct = Math.max(8, (player.goles / maxGoles) * 100);
                  return (
                    <div key={player.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-neutral-500 w-3.5 text-right">{index + 1}º</span>
                          <span className="font-bold text-neutral-200">{player.nombre} {player.apellido}</span>
                          <span className="text-[10px] text-neutral-500">#{player.numeroCamiseta} • {player.posicion}</span>
                        </div>
                        <span className="font-black text-green-400 text-sm font-mono">{player.goles}</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden block">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No hay registros de goles asignados todavía en partidos jugados.</p>
            )}
          </div>
        )}

        {/* Render Asistencias Bar-Meters */}
        {activeBoard === 'asistencias' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Leaderboard: Asistencias</span>
            </h4>

            {topAssists.length > 0 ? (
              <div className="space-y-4.5">
                {topAssists.slice(0, 10).map((player, index) => {
                  const widthPct = Math.max(8, (player.asistencias / maxAsistencias) * 100);
                  return (
                    <div key={player.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-neutral-500 w-3.5 text-right">{index + 1}º</span>
                          <span className="font-bold text-neutral-200">{player.nombre} {player.apellido}</span>
                          <span className="text-[10px] text-neutral-500">#{player.numeroCamiseta} • {player.posicion}</span>
                        </div>
                        <span className="font-black text-indigo-400 text-sm font-mono">{player.asistencias}</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden block">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No hay registros de asistencias de gol registrados en partidos.</p>
            )}
          </div>
        )}

        {/* Render Presenting/Attendance chart */}
        {activeBoard === 'presencias' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              🏟️ Convocación Efectiva a Partidos
            </h4>

            {topPresences.length > 0 ? (
              <div className="space-y-4">
                {topPresences.slice(0, 10).map((player, index) => {
                  const widthPct = Math.max(8, (player.partidosJugados / maxPresencias) * 100);
                  return (
                    <div key={player.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-neutral-500 w-3.5 text-right">{index + 1}º</span>
                          <span className="font-bold text-neutral-200">{player.nombre} {player.apellido}</span>
                          <span className="text-[10px] text-neutral-500">#{player.numeroCamiseta} • {player.posicion}</span>
                        </div>
                        <span className="font-black text-neutral-200 text-sm font-mono">{player.partidosJugados} Part.</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden block">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No hay jugadoras cargadas con historial de partidos.</p>
            )}
          </div>
        )}

        {/* Render Cards/Warnings Table */}
        {activeBoard === 'tarjetas' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-neutral-400" />
              <span>⚠️ Índice de Disciplina y Advertencias</span>
            </h4>

            {topCards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-800">
                  <thead>
                    <tr className="text-neutral-500 font-bold uppercase text-[9px] tracking-wide border-b border-neutral-850">
                      <th className="py-2 px-1">Pos</th>
                      <th className="py-2 px-2">Jugadora</th>
                      <th className="py-2 px-2 text-center text-green-500">Verde</th>
                      <th className="py-2 px-2 text-center text-amber-500">Amarilla</th>
                      <th className="py-2 px-2 text-center text-rose-500">Roja</th>
                      <th className="py-2 px-3 text-center text-neutral-300 font-bold">Faltas Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {topCards.slice(0, 8).map((player, idx) => (
                      <tr key={player.id} className="hover:bg-neutral-850/30">
                        <td className="py-2.5 px-1 font-mono text-neutral-500">{idx + 1}º</td>
                        <td className="py-2.5 px-2 font-bold text-neutral-200">
                          {player.nombre} {player.apellido} <span className="text-[10px] text-neutral-500 font-normal">#{player.numeroCamiseta}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-neutral-300 font-mono font-black">{player.tarjetaVerde}</td>
                        <td className="py-2.5 px-2 text-center text-neutral-300 font-mono font-black">{player.tarjetaAmarilla}</td>
                        <td className="py-2.5 px-2 text-center text-neutral-300 font-mono font-black">{player.tarjetaRoja}</td>
                        <td className="py-2.5 px-3 text-center text-rose-400 font-bold font-mono">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">¡Excelente disciplina! No hay tarjetas registradas en toda la plantilla.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
