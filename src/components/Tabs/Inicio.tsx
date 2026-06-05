/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MapPin, Trophy, Users, BarChart3, Image, ChevronRight, Clock, Share2, Award, Home } from 'lucide-react';
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

  // Posición actual de SRTC en la tabla (ordenada exactamente como en la pestaña Tabla)
  const categoryStandings = [...standings]
    .filter(s => s.categoria === activeCategory)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });
  const srtcStanding = categoryStandings.find(s => s.equipo.toLowerCase().includes('san rafael') || s.equipo.toLowerCase().includes('srtc'));
  const srtcRank = categoryStandings.findIndex(s => s.equipo.toLowerCase().includes('san rafael') || s.equipo.toLowerCase().includes('srtc')) + 1;

  const handleShareResult = (match: Match) => {
    const text = `Séptima División SRTC 🏑: San Rafael Tenis Club ${match.golesPropios} - ${match.golesRival} ${match.rival}. ¡Mirá todas las noticias y estadísticas en nuestra App oficial!`;
    onShare(`Resultado SRTC vs ${match.rival}`, text);
  };

  return (
    <div id="inicio-tab" className="space-y-6">
      {/* Row: Quick Navigation Actions - Re-sized to match other sections beautifully */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-club-gradient-elements p-3 sm:p-3.5 rounded-2xl border border-white/10 shadow-lg">
        <button 
          onClick={() => onTabChange('inicio')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <Home className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Inicio</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Principal</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('fixture')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <Calendar className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Fixture</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Partidos</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('tabla')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <Trophy className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Tabla</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Posiciones</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('plantel')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <Users className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Plantel</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Jugadoras</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('estadisticas')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <BarChart3 className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Estadísticas</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Rendimiento</span>
          </div>
        </button>

        <button 
          onClick={() => onTabChange('galeria')} 
          className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 border border-white/10 shadow-inner">
            <Image className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase block truncate font-sports-condensed">Galería</span>
            <span className="text-[9px] text-indigo-200 font-semibold block truncate">Fotos</span>
          </div>
        </button>
      </div>


      {/* Row de dos tarjetas: Próximo Partido & Último Resultado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Match Card */}
        <div id="next-match-card" className="bg-club-gradient-elements border border-white/10 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-md bg-emerald-500/15 flex items-center gap-1 shadow-inner">
                <Clock className="w-3 h-3 animate-pulse text-emerald-400" /> PRÓXIMO PARTIDO
              </span>
              {nextMatch && (
                <span className="text-xs font-black text-white">
                  {formatFechaDdmmyyyy(nextMatch.fecha)}
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  {/* Local Team */}
                  <div className="flex flex-col items-center w-5/12 text-center p-2">
                    <div className="w-20 h-20 bg-white border border-white/10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                      <ClubLogo teamName={nextMatchLocalTeam} className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-black text-white mt-2 truncate max-w-full">
                      {nextMatchLocalTeam.toUpperCase()}
                    </span>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center w-2/12">
                    <span className="text-sm font-black text-indigo-200/50 italic">VS</span>
                    <span className="text-[10px] bg-white/15 text-white font-bold px-2 py-0.5 rounded-full mt-1 border border-white/10">
                      {nextMatch.hora}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-5/12 text-center p-2">
                    <div className="w-20 h-20 bg-white border border-white/10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                      <ClubLogo teamName={nextMatchVisitorTeam} className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-black text-white mt-2 truncate max-w-full">
                      {nextMatchVisitorTeam.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-indigo-200">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cancha: <strong className="text-white">{nextMatch.cancha}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Torneo: <strong className="text-white">Apertura Asociación Mendocina</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-indigo-200/60 text-xs text-center py-6">No hay partidos programados pendientes.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <button onClick={() => onTabChange('fixture')} className="text-xs text-indigo-300 hover:text-white hover:underline font-black flex items-center gap-1 cursor-pointer">
              Ver fixtures completo <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Last Result Card */}
        <div id="last-result-card" className="bg-club-gradient-elements border border-white/10 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-md bg-amber-500/15">
                ÚLTIMO RESULTADO
              </span>
              {lastResult && (
                <span className="text-xs font-black text-white">
                  {formatFechaDdmmyyyy(lastResult.fecha)}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/10">
                  {/* Local Team */}
                  <div className="flex flex-col items-center w-5/12 text-center">
                    <div className="w-16 h-16 bg-white border border-white/10 rounded-full flex items-center justify-center shadow-md">
                      <ClubLogo teamName={lastResultLocalTeam} className="w-12 h-12" />
                    </div>
                    <span className="text-[11px] font-black text-white mt-1.5 truncate max-w-full">
                      {lastResultLocalTeam.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-indigo-200/75 uppercase mt-0.5 font-bold">Local</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 w-2/12 justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">{lastResultLocalGoles}</span>
                    <span className="text-indigo-200/40 font-bold text-xs">-</span>
                    <span className="text-2xl sm:text-3xl font-black text-white/90">{lastResultVisitorGoles}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-5/12 text-center">
                    <div className="w-16 h-16 bg-white border border-white/10 rounded-full flex items-center justify-center shadow-md">
                      <ClubLogo teamName={lastResultVisitorTeam} className="w-12 h-12" />
                    </div>
                    <span className="text-[11px] font-black text-white mt-1.5 truncate max-w-full">
                      {lastResultVisitorTeam.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-indigo-200/75 uppercase mt-0.5 font-bold">Visitante</span>
                  </div>
                </div>

                {/* Match Premium Info */}
                <div className="space-y-2 text-xs">
                  {lastResult.mvpId && (
                    <div className="flex items-center gap-2 bg-black/20 border border-white/10 p-2 rounded-lg">
                      <div className="w-6 h-6 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10">
                        MVP
                      </div>
                      <div className="flex-1 text-left text-indigo-100">
                        <span className="text-indigo-200/80">Destacada del partido: </span>
                        <strong className="text-amber-300">
                          {players.find(p => p.id === lastResult.mvpId)?.nombre} {players.find(p => p.id === lastResult.mvpId)?.apellido}
                        </strong>
                      </div>
                    </div>
                  )}

                  {lastResult.goleadorasIds && lastResult.goleadorasIds.length > 0 && (
                    <div className="text-indigo-200">
                      <span>Goles: </span>
                      <strong className="font-extrabold text-white">
                        {lastResult.goleadorasIds.map((item, idx) => {
                          const p = players.find(p => p.id === item.jugadorId);
                          return p ? `${p.nombre} ${p.apellido}${item.cantidad > 1 ? ` (${item.cantidad})` : ''}${idx < lastResult.goleadorasIds!.length - 1 ? ', ' : ''}` : '';
                        })}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-indigo-200/60 text-xs text-center py-6">No hay partidos jugados cargados todavía.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            {lastResult && (
              <button 
                onClick={() => handleShareResult(lastResult)}
                className="text-xs text-indigo-100 flex items-center gap-1 bg-white/10 border border-white/10 hover:bg-white/20 px-3 py-1 rounded-md cursor-pointer font-extrabold shadow-sm transition animate-hover"
              >
                <Share2 className="w-3 h-3 text-emerald-400" /> Compartir Resultado
              </button>
            )}
            <button onClick={() => onTabChange('fixture')} className="text-xs text-indigo-300 hover:text-white hover:underline font-black flex items-center gap-1 cursor-pointer">
              Ver Partidos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row: Standings Snapshot & Season MVP Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Standings Snippet */}
        <div className="bg-club-gradient-elements border border-white/10 rounded-xl p-5 shadow-lg md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white flex items-center gap-1.5 text-sm font-sports-condensed tracking-wider">
              <Trophy className="w-4 h-4 text-emerald-400" /> POSICIONES
            </h3>
            {srtcStanding && (
              <span className="text-xs font-black text-emerald-300">
                Puesto {srtcRank}º de {categoryStandings.length}
              </span>
            )}
          </div>

          <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/10 text-indigo-100 font-extrabold uppercase text-[9px] border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3"># Equipo</th>
                  <th className="py-2.5 px-2 text-center">PJ</th>
                  <th className="py-2.5 px-2 text-center">PG</th>
                  <th className="py-2.5 px-2 text-center font-black text-emerald-300">PTS</th>
                  <th className="py-2.5 px-3 text-center">DG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categoryStandings.slice(0, 4).map((row, index) => {
                  const isSrtc = row.equipo.toLowerCase().includes('san rafael');
                  return (
                    <tr key={row.id} className={isSrtc ? 'bg-emerald-500/10 text-white font-extrabold shadow-sm' : 'text-indigo-100 hover:bg-white/5'}>
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <span className={`font-mono w-4 font-bold ${isSrtc ? 'text-emerald-300' : 'text-indigo-200/55'}`}>{index + 1}</span>
                        <span className="truncate max-w-[120px] sm:max-w-none">{row.equipo.toUpperCase()}</span>
                        {isSrtc && <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">{row.pj}</td>
                      <td className="py-2.5 px-2 text-center font-bold">{row.pg}</td>
                      <td className={`py-2.5 px-2 text-center font-extrabold ${isSrtc ? 'text-emerald-300' : 'text-white'}`}>{row.pts}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 flex justify-end">
            <button onClick={() => onTabChange('tabla')} className="text-xs text-indigo-300 hover:text-white hover:underline font-black flex items-center gap-1 cursor-pointer">
              Ver Tabla Completa <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Goleadora del equipo Card */}
        <div className="bg-club-gradient-elements border border-white/10 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-white flex items-center gap-1.5 text-sm mb-3 font-sports-condensed tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" /> {topScorers.length > 1 ? 'GOLEADORAS' : 'GOLEADORA'}
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
                        className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-emerald-500 p-0.5 bg-slate-900"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-black rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md border border-white/20">
                        #{topScorers[0].numeroCamiseta}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-sm">
                        {topScorers[0].nombre} {topScorers[0].apellido}
                      </h4>
                      <span className="text-[10px] uppercase text-white font-extrabold">{topScorers[0].posicion}</span>
                    </div>

                    <div className="bg-black/20 p-2 text-center flex items-center justify-around rounded-lg text-[10px] border border-white/10">
                      <div>
                        <p className="text-indigo-200/70 font-black uppercase tracking-wider text-[9px]">Goles</p>
                        <p className="font-extrabold text-emerald-400 text-sm mt-0.5">{topScorers[0].goles}</p>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div>
                        <p className="text-indigo-200/70 font-black uppercase tracking-wider text-[9px]">Asistencias</p>
                        <p className="font-extrabold text-white text-sm mt-0.5">{topScorers[0].asistencias}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // multiple top scorers in a tie list
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    <p className="text-[10px] text-emerald-300 font-extrabold text-center bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20 shadow-inner">
                      ¡Empate con <strong className="font-black text-white">{maxGoles} goles</strong> cada una!
                    </p>
                    {topScorers.map((player) => (
                      <div key={player.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5 transition hover:bg-white/5">
                        <div className="relative shrink-0">
                          <img
                            src={player.fotoUrl}
                            alt={`${player.nombre}`}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-bold p-0.5 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow">
                            #{player.numeroCamiseta}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-extrabold text-white text-xs truncate">
                            {player.nombre} {player.apellido}
                          </h4>
                          <p className="text-[9px] text-white uppercase font-bold">{player.posicion}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-indigo-200/60 font-black block">Goles</span>
                          <span className="text-xs font-black text-emerald-400">{player.goles}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-indigo-200/60 text-xs">No hay goles registrados todavía en {activeCategory}.</p>
                <p className="text-[10px] text-indigo-200/80 mt-1 leading-relaxed font-bold">Cargá resultados con goles de jugadoras en la pestaña Fixture para actualizar los rankings.</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 text-center">
            <button onClick={() => onTabChange('estadisticas')} className="text-xs text-indigo-300 hover:text-white hover:underline font-black inline-flex items-center gap-1 cursor-pointer">
              Ver Rankings Estadísticos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Gallery Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-white flex items-center gap-2 text-sm font-sports-condensed tracking-wider">
          <Image className="w-4 h-4 text-emerald-400" /> GALERÍA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gallery.slice(0, 3).map((item) => (
            <div 
              key={item.id} 
              className="bg-club-gradient-elements border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/40 hover:shadow-lg transition flex flex-col justify-between cursor-pointer"
              onClick={() => onTabChange('galeria')}
            >
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.imagenUrl} 
                  alt={item.titulo} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-white/10">
                  {item.fecha}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1 block text-left">
                  {item.titulo && item.titulo.toLowerCase() !== 'foto' ? (
                    <h4 className="font-black text-white text-xs line-clamp-1">{item.titulo}</h4>
                  ) : (
                    <h4 className="font-black text-indigo-200/70 text-xs italic line-clamp-1">Foto del Club</h4>
                  )}
                  {item.torneo && item.torneo.toLowerCase() !== 'general' && (
                    <p className="text-indigo-200 text-[11px] line-clamp-2 leading-relaxed font-semibold">{item.torneo}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-indigo-200/60 uppercase font-black">
                  <span>Séptima División</span>
                  <span className="text-emerald-400 font-extrabold hover:text-white transition">
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
