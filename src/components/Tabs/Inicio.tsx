/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MapPin, Trophy, Users, BarChart3, Image, ChevronRight, Clock, Share2, Award } from 'lucide-react';
import { Player, Match, Standing, GalleryItem, Category } from '../../types';
import ClubLogo from '../ClubLogo';
import SrtcLogo from '../SrtcLogo';
import { formatFechaDdmmyyyy } from './Fixture';

interface InicioProps {
  players: Player[];
  matches: Match[];
  standings: Standing[];
  gallery: GalleryItem[];
  selectedCategory: Category;
  onTabChange: (tabId: string) => void;
  onShare: (title: string, text: string) => void;
}

export default function Inicio({ players, matches, standings, gallery, selectedCategory, onTabChange, onShare }: InicioProps) {
  // Filter matches involving SRTC
  const srtcMatches = matches.filter(m => {
    const localTeam = m.localNombre || (m.esLocal ? 'San Rafael Tenis Club' : m.rival);
    const visitorTeam = m.visitanteNombre || (!m.esLocal ? 'San Rafael Tenis Club' : m.rival);
    return localTeam === 'San Rafael Tenis Club' || visitorTeam === 'San Rafael Tenis Club';
  });

  // Próximo partido: primer partido programado de SRTC
  const scheduledMatches = srtcMatches
    .filter(m => m.estado === 'Programado')
    .sort((a,b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));
  const nextMatch = scheduledMatches[0];

  // Último resultado: último partido finalizado de SRTC
  const playedMatches = srtcMatches
    .filter(m => m.estado === 'Finalizado')
    .sort((a,b) => `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`));
  const lastResult = playedMatches[0];

  // Próximo partido names
  const nextMatchLocalTeam = nextMatch ? (nextMatch.localNombre || (nextMatch.esLocal ? 'San Rafael Tenis Club' : nextMatch.rival)) : '';
  const nextMatchVisitorTeam = nextMatch ? (nextMatch.visitanteNombre || (!nextMatch.esLocal ? 'San Rafael Tenis Club' : nextMatch.rival)) : '';

  // Último resultado names & goals
  const lastResultLocalTeam = lastResult ? (lastResult.localNombre || (lastResult.esLocal ? 'San Rafael Tenis Club' : lastResult.rival)) : '';
  const lastResultVisitorTeam = lastResult ? (lastResult.visitanteNombre || (!lastResult.esLocal ? 'San Rafael Tenis Club' : lastResult.rival)) : '';

  let lastResultLocalGoles = 0;
  let lastResultVisitorGoles = 0;
  if (lastResult) {
    const isLocalSrtc = lastResultLocalTeam.toLowerCase().includes('san rafael') || lastResultLocalTeam.toLowerCase().includes('srtc');
    const isVisitorSrtc = lastResultVisitorTeam.toLowerCase().includes('san rafael') || lastResultVisitorTeam.toLowerCase().includes('srtc');
    if (isLocalSrtc) {
      lastResultLocalGoles = lastResult.golesPropios;
      lastResultVisitorGoles = lastResult.golesRival;
    } else if (isVisitorSrtc) {
      lastResultLocalGoles = lastResult.golesRival;
      lastResultVisitorGoles = lastResult.golesPropios;
    } else {
      lastResultLocalGoles = lastResult.golesPropios;
      lastResultVisitorGoles = lastResult.golesRival;
    }
  }

  // Goleadoras de la división/equipo
  const activeCategory = selectedCategory || '7ma';
  const categoryPlayers = players.filter(p => p.categoria === activeCategory);
  const playersWithGoals = categoryPlayers.filter(p => (p.goles || 0) > 0);
  const maxGoles = playersWithGoals.length > 0 ? Math.max(...playersWithGoals.map(p => p.goles || 0)) : 0;
  const topScorers = maxGoles > 0 ? categoryPlayers.filter(p => (p.goles || 0) === maxGoles) : [];

  // Posición actual de SRTC en la tabla
  const srtcStanding = standings.find(s => s.equipo.toLowerCase().includes('san rafael'));
  const srtcRank = standings.findIndex(s => s.equipo.toLowerCase().includes('san rafael')) + 1;

  const handleShareResult = (match: Match) => {
    const text = `Séptima División SRTC 🏑: San Rafael Tenis Club ${match.golesPropios} - ${match.golesRival} ${match.rival}. ¡Mirá todas las noticias y estadísticas en nuestra App oficial!`;
    onShare(`Resultado SRTC vs ${match.rival}`, text);
  };

  return (
    <div id="inicio-tab" className="space-y-6">
      {/* Row: Quick Navigation Actions - Re-sized to match other sections beautifully */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-900/95 p-3 sm:p-3.5 rounded-2xl border border-neutral-800/80 shadow-md">
        <button 
          onClick={() => onTabChange('fixture')} 
          className="flex items-center gap-3 p-3 hover:bg-neutral-850 bg-neutral-950/40 rounded-xl border border-neutral-800/65 hover:border-indigo-550 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0 border border-indigo-500/15 group-hover:bg-indigo-500/20 shadow-inner">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate">Fixture</span>
            <span className="text-[9px] text-neutral-450 font-medium block truncate">Partidos</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('tabla')} 
          className="flex items-center gap-3 p-3 hover:bg-neutral-850 bg-neutral-950/40 rounded-xl border border-neutral-800/65 hover:border-amber-555 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0 border border-amber-500/15 group-hover:bg-amber-500/20 shadow-inner">
            <Trophy className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate">Tabla</span>
            <span className="text-[9px] text-neutral-450 font-medium block truncate">Posiciones</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('plantel')} 
          className="flex items-center gap-3 p-3 hover:bg-neutral-850 bg-neutral-950/40 rounded-xl border border-neutral-800/65 hover:border-emerald-555 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0 border border-emerald-500/15 group-hover:bg-emerald-500/20 shadow-inner">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate">Plantel</span>
            <span className="text-[9px] text-neutral-450 font-medium block truncate">Jugadoras</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('convocatorias')} 
          className="flex items-center gap-3 p-3 hover:bg-neutral-850 bg-neutral-950/40 rounded-xl border border-neutral-800/65 hover:border-purple-555 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0 border border-purple-500/15 group-hover:bg-purple-500/20 shadow-inner">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate">Convocatorias</span>
            <span className="text-[9px] text-neutral-450 font-medium block truncate">Delegaciones</span>
          </div>
        </button>
      </div>

      {/* Row de dos tarjetas: Próximo Partido & Último Resultado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Match Card */}
        <div id="next-match-card" className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md bg-rose-500/10 flex items-center gap-1">
                <Clock className="w-3 h-3 animate-pulse" /> PRÓXIMO PARTIDO
              </span>
              {nextMatch && (
                <span className="text-xs font-bold text-neutral-400">
                  {formatFechaDdmmyyyy(nextMatch.fecha)}
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  {/* Local Team */}
                  <div className="flex flex-col items-center w-5/12 text-center p-2">
                    <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                      <ClubLogo teamName={nextMatchLocalTeam} className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200 mt-2 truncate max-w-full">
                      {nextMatchLocalTeam}
                    </span>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center w-2/12">
                    <span className="text-sm font-black text-neutral-500 italic">VS</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full mt-1">
                      {nextMatch.hora}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-5/12 text-center p-2">
                    <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                      <ClubLogo teamName={nextMatchVisitorTeam} className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200 mt-2 truncate max-w-full">
                      {nextMatchVisitorTeam}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Cancha: <strong className="text-neutral-200">{nextMatch.cancha}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Trophy className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Torneo: <strong className="text-neutral-200">Apertura Asociación Mendocina</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-xs text-center py-6">No hay partidos programados pendientes.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
            <button onClick={() => onTabChange('fixture')} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer">
              Ver fixtures completo <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Last Result Card */}
        <div id="last-result-card" className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md bg-emerald-500/10">
                ÚLTIMO RESULTADO
              </span>
              {lastResult && (
                <span className="text-xs font-bold text-neutral-400">
                  {formatFechaDdmmyyyy(lastResult.fecha)}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  {/* Local Team */}
                  <div className="flex flex-col items-center w-5/12 text-center">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-md">
                      <ClubLogo teamName={lastResultLocalTeam} className="w-12 h-12" />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-200 mt-1.5 truncate max-w-full">
                      {lastResultLocalTeam}
                    </span>
                    <span className="text-[9px] text-neutral-550 uppercase mt-0.5">Local</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 w-2/12 justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">{lastResultLocalGoles}</span>
                    <span className="text-neutral-600 font-bold text-xs">-</span>
                    <span className="text-2xl sm:text-3xl font-black text-neutral-400">{lastResultVisitorGoles}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-5/12 text-center">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-md">
                      <ClubLogo teamName={lastResultVisitorTeam} className="w-12 h-12" />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-200 mt-1.5 truncate max-w-full">
                      {lastResultVisitorTeam}
                    </span>
                    <span className="text-[9px] text-neutral-550 uppercase mt-0.5">Visitante</span>
                  </div>
                </div>

                {/* Match Premium Info */}
                <div className="space-y-2 text-xs">
                  {lastResult.mvpId && (
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-lg">
                      <div className="w-6 h-6 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                        MVP
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-neutral-400">Destacada del partido: </span>
                        <strong className="text-neutral-200">
                          {players.find(p => p.id === lastResult.mvpId)?.nombre} {players.find(p => p.id === lastResult.mvpId)?.apellido}
                        </strong>
                      </div>
                    </div>
                  )}

                  {lastResult.goleadorasIds && lastResult.goleadorasIds.length > 0 && (
                    <div className="text-neutral-400">
                      <span>Goles: </span>
                      <span className="font-medium text-neutral-200">
                        {lastResult.goleadorasIds.map((item, idx) => {
                          const p = players.find(p => p.id === item.jugadorId);
                          return p ? `${p.nombre} ${p.apellido}${item.cantidad > 1 ? ` (${item.cantidad})` : ''}${idx < lastResult.goleadorasIds!.length - 1 ? ', ' : ''}` : '';
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-xs text-center py-6">No hay partidos jugados cargados todavía.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
            {lastResult && (
              <button 
                onClick={() => handleShareResult(lastResult)}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-3 py-1 rounded-md cursor-pointer font-medium"
              >
                <Share2 className="w-3 h-3" /> Compartir Resultado
              </button>
            )}
            <button onClick={() => onTabChange('fixture')} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer">
              Ver Partidos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row: Standings Snapshot & Season MVP Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Standings Snippet */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-100 flex items-center gap-1.5 text-sm">
              <Trophy className="w-4 h-4 text-amber-500" /> Posiciones
            </h3>
            {srtcStanding && (
              <span className="text-xs font-extrabold text-neutral-300">
                Puesto {srtcRank}º de {standings.length}
              </span>
            )}
          </div>

          <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900 text-neutral-400 font-bold uppercase text-[9px] border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3"># Equipo</th>
                  <th className="py-2.5 px-2 text-center">PJ</th>
                  <th className="py-2.5 px-2 text-center">PG</th>
                  <th className="py-2.5 px-2 text-center font-bold text-indigo-400">PTS</th>
                  <th className="py-2.5 px-3 text-center">DG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {standings.slice(0, 4).map((row, index) => {
                  const isSrtc = row.equipo.toLowerCase().includes('san rafael');
                  return (
                    <tr key={row.id} className={isSrtc ? 'bg-indigo-500/10 text-indigo-300 font-bold' : 'text-neutral-400 hover:bg-neutral-900/55'}>
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <span className="font-mono text-neutral-500 w-4">{index + 1}</span>
                        <span className="truncate max-w-[120px] sm:max-w-none">{row.equipo}</span>
                        {isSrtc && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </td>
                      <td className="py-2.5 px-2 text-center">{row.pj}</td>
                      <td className="py-2.5 px-2 text-center">{row.pg}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-neutral-200">{row.pts}</td>
                      <td className={`py-2.5 px-3 text-center ${row.dg > 0 ? 'text-green-400' : 'text-neutral-400'}`}>{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 flex justify-end">
            <button onClick={() => onTabChange('tabla')} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer">
              Ver Tabla Completa <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Goleadora del equipo Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-neutral-100 flex items-center gap-1.5 text-sm mb-3">
              <Award className="w-4 h-4 text-emerald-400" /> {topScorers.length > 1 ? 'Goleadoras' : 'Goleadora'}
            </h3>

            {topScorers.length > 0 ? (
              <div className="space-y-4 py-1">
                {topScorers.length === 1 ? (
                  // single top scorer
                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={topScorers[0].fotoUrl}
                        alt={`${topScorers[0].nombre}`}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-emerald-500 p-0.5"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 font-black rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">
                        #{topScorers[0].numeroCamiseta}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-200 text-sm">
                        {topScorers[0].nombre} {topScorers[0].apellido}
                      </h4>
                      <span className="text-[10px] uppercase text-neutral-400">{topScorers[0].posicion}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 text-center flex items-center justify-around rounded-lg text-[10px] border border-neutral-850">
                      <div>
                        <p className="text-neutral-500 font-bold">Goles</p>
                        <p className="font-extrabold text-emerald-400 text-sm mt-0.5">{topScorers[0].goles}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 font-bold">Asistencias</p>
                        <p className="font-extrabold text-neutral-200 text-sm mt-0.5">{topScorers[0].asistencias}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // multiple top scorers in a tie list
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    <p className="text-[10px] text-emerald-405 font-medium text-center bg-emerald-500/5 py-1 px-2 rounded border border-emerald-500/10">
                      ¡Empate con <strong className="font-bold text-emerald-400">{maxGoles} goles</strong> cada una!
                    </p>
                    {topScorers.map((player) => (
                      <div key={player.id} className="flex items-center gap-3 bg-neutral-950 p-2 rounded-lg border border-neutral-850">
                        <div className="relative shrink-0">
                          <img
                            src={player.fotoUrl}
                            alt={`${player.nombre}`}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 font-bold p-0.5 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow">
                            #{player.numeroCamiseta}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-neutral-200 text-xs truncate">
                            {player.nombre} {player.apellido}
                          </h4>
                          <p className="text-[9px] text-neutral-500 uppercase">{player.posicion}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-neutral-500 font-bold block">Goles</span>
                          <span className="text-xs font-black text-emerald-400">{player.goles}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500 text-xs">No hay goles registrados todavía en {activeCategory}.</p>
                <p className="text-[10px] text-neutral-650 mt-1 leading-relaxed">Cargá resultados con goles de jugadoras en la pestaña Fixture para actualizar los rankings.</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-800 text-center">
            <button onClick={() => onTabChange('estadisticas')} className="text-xs text-neutral-400 hover:text-white font-bold inline-flex items-center gap-1 cursor-pointer">
              Ver Rankings Estadísticos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Gallery Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-neutral-100 flex items-center gap-2 text-sm">
          <Image className="w-4 h-4 text-emerald-500" /> Galería
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gallery.slice(0, 3).map((item) => (
            <div 
              key={item.id} 
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between cursor-pointer"
              onClick={() => onTabChange('galeria')}
            >
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.imagenUrl} 
                  alt={item.titulo} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-md text-[9px] text-white font-bold px-2 py-0.5 rounded-full border border-neutral-800">
                  {item.fecha}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  {item.titulo && item.titulo.toLowerCase() !== 'foto' ? (
                    <h4 className="font-bold text-white text-xs line-clamp-1">{item.titulo}</h4>
                  ) : (
                    <h4 className="font-bold text-neutral-400 text-xs italic line-clamp-1">Foto del Club</h4>
                  )}
                  {item.torneo && item.torneo.toLowerCase() !== 'general' && (
                    <p className="text-neutral-400 text-[11px] line-clamp-2 leading-relaxed">{item.torneo}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500 uppercase font-bold">
                  <span>Séptima División</span>
                  <span className="text-indigo-400 hover:text-indigo-300">
                    Ver en Galería →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
