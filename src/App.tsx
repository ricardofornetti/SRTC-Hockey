/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Newspaper, 
  Calendar, 
  Trophy, 
  Users, 
  BarChart3, 
  Award, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Bell, 
  Volume2, 
  Share2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  UserRole, 
  Category, 
  Player, 
  Match, 
  Standing, 
  NewsItem, 
  GalleryItem, 
  Convocation, 
  NotificationLog 
} from './types';
import { 
  INITIAL_PLAYERS, 
  INITIAL_MATCH_LIST, 
  INITIAL_STANDINGS, 
  INITIAL_NEWS, 
  INITIAL_GALLERY, 
  INITIAL_CONVOCATIONS, 
  INITIAL_NOTIFICATIONS 
} from './data';
import { 
  subscribeToCollection, 
  seedInitialDataIfCollectionIsEmpty, 
  syncCollection 
} from './firebase';

import RoleSelector from './components/RoleSelector';
import ClubLogo from './components/ClubLogo';
import SrtcLogo from './components/SrtcLogo';

// Tab components
import Inicio from './components/Tabs/Inicio';
import Noticias from './components/Tabs/Noticias';
import Fixture from './components/Tabs/Fixture';
import Tabla from './components/Tabs/Tabla';
import Plantel from './components/Tabs/Plantel';
import Estadisticas from './components/Tabs/Estadisticas';
import Convocatorias from './components/Tabs/Convocatorias';
import Galeria from './components/Tabs/Galeria';
import Mas from './components/Tabs/Mas';

export default function App() {
  // State for loaded data, initialized with high-quality local mock data
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCH_LIST);
  const [standings, setStandings] = useState<Standing[]>(INITIAL_STANDINGS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [convocations, setConvocations] = useState<Convocation[]>(INITIAL_CONVOCATIONS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  // App settings
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('srtc_user_role');
    return (saved as UserRole) || 'public';
  });
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('7ma');
  const [activeTab, setActiveTab] = useState<string>('inicio');

  // Shared status banners / alerts
  const [toast, setToast] = useState<{ title: string; body: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Trigger seeding and bind real-time Firestore synchronization on load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Seeding initial data if empty...');
        await seedInitialDataIfCollectionIsEmpty();
      } catch (err) {
        console.warn('Unable to seed/connect on startup. Operating with local data fallback.', err);
      }
    };
    initializeApp();

    // Attach real-time subscriptions with a fallback to local changes
    const unsubPlayers = subscribeToCollection<Player>('players', (data) => {
      if (data && data.length > 0) setPlayers(data);
    });
    const unsubMatches = subscribeToCollection<Match>('matches', (data) => {
      if (data && data.length > 0) setMatches(data);
    });
    const unsubStandings = subscribeToCollection<Standing>('standings', (data) => {
      if (data && data.length > 0) {
        setStandings(data);
      } else {
        setStandings(INITIAL_STANDINGS);
      }
    });
    const unsubNews = subscribeToCollection<NewsItem>('news', (data) => {
      if (data && data.length > 0) setNews(data);
    });
    const unsubGallery = subscribeToCollection<GalleryItem>('gallery', (data) => {
      if (data && data.length > 0) setGallery(data);
    });
    const unsubConvocations = subscribeToCollection<Convocation>('convocations', (data) => {
      if (data && data.length > 0) setConvocations(data);
    });
    const unsubNotifications = subscribeToCollection<NotificationLog>('notifications', (data) => {
      if (data && data.length > 0) setNotifications(data);
    });

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubStandings();
      unsubNews();
      unsubGallery();
      unsubConvocations();
      unsubNotifications();
    };
  }, []);

  // Sync state changes to local storage role preference
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('srtc_user_role', role);
    showToast('Rol de Acceso Actualizado', `Ahora tienes permisos de: ${role === 'admin' ? 'Administrador' : role === 'coach' ? 'Entrenador' : 'Usuario Público'}`, 'info');
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    showToast('Categoría Seleccionada', `Has cambiado a la división de ${category}`, 'success');
  };

  // Safe synchronization wrappers
  const recalculateAndSyncPlayersAndStandings = async (updatedMatches: Match[]) => {
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

    // 1. Recalculate and update Players
    const updatedPlayers = players.map(p => {
      const basePlayer = INITIAL_PLAYERS.find(bp => bp.id === p.id);
      const baseGoles = basePlayer ? basePlayer.goles : 0;
      const baseAsistencias = basePlayer ? basePlayer.asistencias : 0;
      const basePartidosJugados = basePlayer ? basePlayer.partidosJugados : 0;
      const baseVerde = basePlayer ? basePlayer.tarjetaVerde : 0;
      const baseAmarilla = basePlayer ? basePlayer.tarjetaAmarilla : 0;
      const baseRoja = basePlayer ? basePlayer.tarjetaRoja : 0;

      let additionalGoles = 0;
      let additionalAsistencias = 0;
      let additionalVerde = 0;
      let additionalAmarilla = 0;
      let additionalRoja = 0;
      let additionalPartidos = 0;

      updatedMatches.forEach(m => {
        if (m.estado === 'Finalizado' && !BASELINE_MATCH_IDS.has(m.id)) {
          if (m.goleadorasIds) {
            const matchScorer = m.goleadorasIds.find(gs => gs.jugadorId === p.id);
            if (matchScorer) {
              additionalGoles += matchScorer.cantidad;
            }
          }
          if (m.asistidorasIds) {
            const matchAssister = m.asistidorasIds.find(as => as.jugadorId === p.id);
            if (matchAssister) {
              additionalAsistencias += matchAssister.cantidad;
            }
          }
          if (m.tarjetas) {
            const matchCard = m.tarjetas.find(tc => tc.jugadorId === p.id);
            if (matchCard) {
              additionalVerde += matchCard.verde || 0;
              additionalAmarilla += matchCard.amarilla || 0;
              additionalRoja += matchCard.roja || 0;
            }
          }
          const conv = convocations.find(c => c.id === m.id);
          const isConvocada = conv && conv.estadosJugadoras && conv.estadosJugadoras[p.id] === 'Convocada';
          const hasScored = m.goleadorasIds && m.goleadorasIds.some(gs => gs.jugadorId === p.id && gs.cantidad > 0);
          const hasCards = m.tarjetas && m.tarjetas.some(tc => tc.jugadorId === p.id && ((tc.verde || 0) > 0 || (tc.amarilla || 0) > 0 || (tc.roja || 0) > 0));
          const isMvp = m.mvpId === p.id;

          if (isConvocada || hasScored || hasCards || isMvp) {
            additionalPartidos += 1;
          }
        }
      });

      return {
        ...p,
        goles: baseGoles + additionalGoles,
        asistencias: baseAsistencias + additionalAsistencias,
        partidosJugados: basePartidosJugados + additionalPartidos,
        tarjetaVerde: baseVerde + additionalVerde,
        tarjetaAmarilla: baseAmarilla + additionalAmarilla,
        tarjetaRoja: baseRoja + additionalRoja
      };
    });

    try {
      await syncCollection('players', players, updatedPlayers);
      console.log('Player statistics recalculated and synchronized with Firestore.');
    } catch (err) {
      console.error('Error syncing recalculated players:', err);
    }

    // 2. Recalculate and update Standings
    const savedBaselines = localStorage.getItem('srtc_standings_baseline_db_v5');
    const baselinesMap = savedBaselines ? JSON.parse(savedBaselines) : {
      'RIVADAVIA - A': { id: 'riva_a', equipo: 'RIVADAVIA - A', pg: 12, pe: 0, pp: 0, gf: 103, gc: 1 },
      'SAN RAFAEL TENIS CLUB - A': { id: 'srtc', equipo: 'SAN RAFAEL TENIS CLUB - A', pg: 8, pe: 4, pp: 0, gf: 29, gc: 7, esOficialClub: true },
      'LOS TORDOS - C': { id: 'ltod_c', equipo: 'LOS TORDOS - C', pg: 8, pe: 3, pp: 1, gf: 26, gc: 6 },
      'LOS TORDOS - B': { id: 'ltod_b', equipo: 'LOS TORDOS - B', pg: 8, pe: 2, pp: 2, gf: 28, gc: 11 },
      'MENDOZA R. C. - A': { id: 'mndz_a', equipo: 'MENDOZA R. C. - A', pg: 7, pe: 4, pp: 1, gf: 36, gc: 8 },
      'MARISTA - B': { id: 'marb_b', equipo: 'MARISTA - B', pg: 7, pe: 2, pp: 3, gf: 21, gc: 15 },
      'TACURU - A': { id: 'tacu_a', equipo: 'TACURU - A', pg: 7, pe: 1, pp: 4, gf: 18, gc: 24 },
      'BANCO MENDOZA - B': { id: 'bmzb_b', equipo: 'BANCO MENDOZA - B', pg: 5, pe: 4, pp: 3, gf: 16, gc: 12 },
      'MARISTA - C': { id: 'marb_c', equipo: 'MARISTA - C', pg: 4, pe: 2, pp: 6, gf: 8, gc: 19 },
      'PUMAI RUGBY CLUB - A': { id: 'pumai_a', equipo: 'PUMAI RUGBY CLUB - A', pg: 3, pe: 4, pp: 5, gf: 11, gc: 15 },
      'SAN JORGE S.R. - A': { id: 'sjor_a', equipo: 'SAN JORGE S.R. - A', pg: 2, pe: 3, pp: 7, gf: 6, gc: 23 },
      'CABNA - A': { id: 'cabn_a', equipo: 'CABNA - A', pg: 2, pe: 3, pp: 7, gf: 5, gc: 32 },
      'MURIALDO - B': { id: 'mur_b', equipo: 'MURIALDO - B', pg: 2, pe: 2, pp: 8, gf: 2, gc: 27 },
      'ALEMAN - B': { id: 'alem_b', equipo: 'ALEMAN - B', pg: 2, pe: 0, pp: 10, gf: 5, gc: 43 },
      'TEQÜE RUGBY CLUB - B': { id: 'teq_b', equipo: 'TEQÜE RUGBY CLUB - B', pg: 0, pe: 3, pp: 9, gf: 1, gc: 33 },
      'BANCO MENDOZA - C': { id: 'bmzc_c', equipo: 'BANCO MENDOZA - C', pg: 0, pe: 1, pp: 11, gf: 1, gc: 40 }
    };

    function normalizeTeamName(teamName: string): string {
      if (!teamName) return '';
      const name = teamName.toLowerCase().trim();
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
      return teamName.toUpperCase().trim();
    }

    const activeMatches = updatedMatches.filter(m => m.categoria === selectedCategory && m.estado === 'Finalizado');
    const workingBaselines = JSON.parse(JSON.stringify(baselinesMap));

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

          if (!isModified) {
            return;
          }

          if (originalMatch.estado === 'Finalizado') {
            const rawLocalOrig = originalMatch.localNombre || (originalMatch.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : originalMatch.rival);
            const rawVisitorOrig = originalMatch.visitanteNombre || (!originalMatch.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : originalMatch.rival);
            const localTeamOrig = normalizeTeamName(rawLocalOrig);
            const visitorTeamOrig = normalizeTeamName(rawVisitorOrig);

            let localGolesOrig = 0;
            let visitorGolesOrig = 0;

            if (localTeamOrig === 'SAN RAFAEL TENIS CLUB - A') {
              localGolesOrig = originalMatch.golesPropios;
              visitorGolesOrig = originalMatch.golesRival;
            } else if (visitorTeamOrig === 'SAN RAFAEL TENIS CLUB - A') {
              localGolesOrig = originalMatch.golesRival;
              visitorGolesOrig = originalMatch.golesPropios;
            } else {
              localGolesOrig = originalMatch.golesPropios;
              visitorGolesOrig = originalMatch.golesRival;
            }

            const lEntry = workingBaselines[localTeamOrig];
            const vEntry = workingBaselines[visitorTeamOrig];

            if (lEntry) {
              lEntry.gf = Math.max(0, lEntry.gf - localGolesOrig);
              lEntry.gc = Math.max(0, lEntry.gc - visitorGolesOrig);
              if (localGolesOrig > visitorGolesOrig) {
                lEntry.pg = Math.max(0, lEntry.pg - 1);
              } else if (localGolesOrig < visitorGolesOrig) {
                lEntry.pp = Math.max(0, lEntry.pp - 1);
              } else {
                lEntry.pe = Math.max(0, lEntry.pe - 1);
              }
            }

            if (vEntry) {
              vEntry.gf = Math.max(0, vEntry.gf - visitorGolesOrig);
              vEntry.gc = Math.max(0, vEntry.gc - localGolesOrig);
              if (visitorGolesOrig > localGolesOrig) {
                vEntry.pg = Math.max(0, vEntry.pg - 1);
              } else if (visitorGolesOrig < localGolesOrig) {
                vEntry.pp = Math.max(0, vEntry.pp - 1);
              } else {
                vEntry.pe = Math.max(0, vEntry.pe - 1);
              }
            }
          }

          if (match.estado === 'Finalizado') {
            const rawLocal = match.localNombre || (match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
            const rawVisitor = match.visitanteNombre || (!match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
            const localTeam = normalizeTeamName(rawLocal);
            const visitorTeam = normalizeTeamName(rawVisitor);

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

            if (!workingBaselines[localTeam]) {
              workingBaselines[localTeam] = { id: 'dyn_' + Math.random().toString(36).substr(2, 4), equipo: localTeam, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
            }
            if (!workingBaselines[visitorTeam]) {
              workingBaselines[visitorTeam] = { id: 'dyn_' + Math.random().toString(36).substr(2, 4), equipo: visitorTeam, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
            }

            const lEntry = workingBaselines[localTeam];
            const vEntry = workingBaselines[visitorTeam];

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
          }
          return;
        }
      }

      const rawLocal = match.localNombre || (match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
      const rawVisitor = match.visitanteNombre || (!match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
      
      const localTeam = normalizeTeamName(rawLocal);
      const visitorTeam = normalizeTeamName(rawVisitor);

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

      if (!workingBaselines[localTeam]) {
        workingBaselines[localTeam] = { id: 'dyn_' + Math.random().toString(36).substr(2, 4), equipo: localTeam, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
      }
      if (!workingBaselines[visitorTeam]) {
        workingBaselines[visitorTeam] = { id: 'dyn_' + Math.random().toString(36).substr(2, 4), equipo: visitorTeam, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
      }

      const localEntry = workingBaselines[localTeam];
      const visitorEntry = workingBaselines[visitorTeam];

      localEntry.gf += localGoles;
      localEntry.gc += visitorGoles;
      visitorEntry.gf += visitorGoles;
      visitorEntry.gc += localGoles;

      if (localGoles > visitorGoles) {
        localEntry.pg += 1;
        visitorEntry.pp += 1;
      } else if (localGoles < visitorGoles) {
        localEntry.pp += 1;
        visitorEntry.pg += 1;
      } else {
        localEntry.pe += 1;
        visitorEntry.pe += 1;
      }
    });

    const standingsList: Standing[] = Object.keys(workingBaselines).map(key => {
      const base = workingBaselines[key];
      const pj = base.pg + base.pe + base.pp;
      const dg = base.gf - base.gc;
      const pts = (base.pg * 3) + (base.pe * 1);
      
      return {
        id: base.id,
        equipo: base.equipo,
        pj,
        pg: base.pg,
        pe: base.pe,
        pp: base.pp,
        gf: base.gf,
        gc: base.gc,
        dg,
        pts,
        categoria: selectedCategory,
        esOficialClub: base.esOficialClub
      };
    });

    const sortedStandings = [...standingsList].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });

    try {
      setStandings(sortedStandings);
      await syncCollection('standings', standings, sortedStandings);
      console.log('Standings calculated and synchronized with Firestore.');
    } catch (err) {
      console.error('Error syncing recalculated standings:', err);
    }
  };

  const handleUpdatePlayers = async (updated: Player[]) => {
    setPlayers(updated);
    try {
      await syncCollection('players', players, updated);
      showToast('Plantel actualizado', 'Se han sincronizado los cambios del plantel con Firestore en tiempo real.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error de guardado', 'Sus cambios se guardaron localmente pero falló la sincronización con el servidor.', 'error');
    }
  };

  const handleUpdateMatches = async (updated: Match[]) => {
    setMatches(updated);
    try {
      await syncCollection('matches', matches, updated);
      showToast('Partidos actualizados', 'Se han sincronizado los resultados del torneo en tiempo real.', 'success');
      await recalculateAndSyncPlayersAndStandings(updated);
    } catch (e) {
      console.error(e);
      showToast('Error de guardado', 'Resultados guardados localmente.', 'error');
    }
  };

  const handleUpdateStandings = async (updated: Standing[]) => {
    setStandings(updated);
    try {
      await syncCollection('standings', standings, updated);
      showToast('Tabla armada', 'Historial y puntos recalculados correctamente en la nube.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNews = async (updated: NewsItem[]) => {
    setNews(updated);
    try {
      await syncCollection('news', news, updated);
      showToast('Publicación agregada', 'La noticia fue publicada de forma exitosa.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGallery = async (updated: GalleryItem[]) => {
    setGallery(updated);
    try {
      await syncCollection('gallery', gallery, updated);
      showToast('Galería sincronizada', 'Imagen subida al catálogo exitosamente.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateConvocations = async (updated: Convocation[]) => {
    setConvocations(updated);
    try {
      if (updated.length > 0) {
        await syncCollection('convocations', convocations, updated);
        showToast('Lista de convocadas', 'La nómina del próximo partido fue sincronizada.', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNotifications = async (updated: NotificationLog[]) => {
    setNotifications(updated);
    try {
      await syncCollection('notifications', notifications, updated);
    } catch (e) {
      console.error(e);
    }
  };

  // Interactive share action
  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      }).catch((err) => {
        console.warn('Share sheets triggered cancellation/failure:', err);
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Publicación Copiada', 'Texto de difusión copiado al portapapeles para difundir en WhatsApp/Instagram.', 'success');
  };

  const showToast = (title: string, body: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ title, body, type });
  };

  // Clear toast after timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Tab switching renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <Inicio 
            players={players} 
            matches={matches} 
            standings={standings} 
            gallery={gallery} 
            selectedCategory={selectedCategory} 
            onTabChange={setActiveTab} 
            onShare={handleShare} 
          />
        );
      case 'noticias':
        return (
          <Noticias 
            news={news} 
            userRole={userRole} 
            onUpdateNews={handleUpdateNews} 
            onShare={handleShare} 
          />
        );
      case 'fixture':
        return (
          <Fixture 
            matches={matches} 
            players={players} 
            userRole={userRole} 
            selectedCategory={selectedCategory} 
            onUpdateMatches={handleUpdateMatches} 
            onShare={handleShare} 
          />
        );
      case 'tabla':
        return (
          <Tabla 
            matches={matches} 
            selectedCategory={selectedCategory} 
            onShare={handleShare} 
            userRole={userRole} 
            standings={standings} 
            onUpdateStandings={handleUpdateStandings} 
          />
        );
      case 'plantel':
        return (
          <Plantel 
            players={players} 
            userRole={userRole} 
            selectedCategory={selectedCategory} 
            onUpdatePlayers={handleUpdatePlayers} 
          />
        );
      case 'estadisticas':
        return (
          <Estadisticas 
            players={players} 
            matches={matches} 
            selectedCategory={selectedCategory} 
          />
        );
      case 'convocatorias':
        return (
          <Convocatorias 
            convocations={convocations} 
            matches={matches} 
            players={players} 
            userRole={userRole} 
            selectedCategory={selectedCategory} 
            onUpdateConvocations={handleUpdateConvocations} 
          />
        );
      case 'galeria':
        return (
          <Galeria 
            gallery={gallery} 
            matches={matches} 
            userRole={userRole} 
            onUpdateGallery={handleUpdateGallery} 
          />
        );
      case 'mas':
        return (
          <Mas 
            notifications={notifications} 
            players={players} 
            matches={matches} 
            gallery={gallery} 
            userRole={userRole} 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
            onUpdateNotifications={handleUpdateNotifications} 
            onShowNotificationBanner={(t, b) => showToast(t, b, 'info')} 
            onShare={handleShare} 
            onTabChange={setActiveTab} 
          />
        );
      default:
        return <div className="text-center py-10 text-neutral-400">Pestaña no encontrada.</div>;
    }
  };

  // Beautiful Tab Definitions
  const tabsConfig = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'fixture', label: 'Fixture', icon: Calendar },
    { id: 'tabla', label: 'Tabla', icon: Trophy },
    { id: 'plantel', label: 'Plantel', icon: Users },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'galeria', label: 'Galería', icon: ImageIcon },
  ];

  return (
    <div id="app-root-container" className="min-h-screen bg-club-gradient text-neutral-100 flex flex-col font-sans pb-10">
      {/* 1. Control de Rol / Simulación de Entorno */}
      <RoleSelector 
        currentRole={userRole} 
        onChangeRole={handleRoleChange} 
        currentUserEmail="fornettiricardo@gmail.com" 
      />

      {/* 2. Header de la Aplicación */}
      <header id="main-header" className="bg-club-gradient-elements border-b border-white/10 px-5 py-5 md:py-6 shadow-xl relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Logo y Nombre del Club */}
          <div className="flex items-center gap-4.5 select-none cursor-pointer group" onClick={() => setActiveTab('inicio')}>
            {/* Highly prominent and glowing official club logo card */}
            <div className="w-16 h-16 shrink-0 p-1.5 bg-white border-2 border-white/20 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
              <SrtcLogo className="w-13 h-13" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-sports-condensed font-black text-white tracking-widest uppercase group-hover:text-amber-300 transition-colors duration-300">
                  SAN RAFAEL TENIS CLUB
                </h1>
                <span className="self-start sm:self-auto text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-sports-condensed shadow-inner">
                  HOCKEY CLUB
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 font-bold leading-normal mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-450 rounded-full animate-pulse shadow-glow shadow-emerald-400/55"></span>
                <span className="font-sports-condensed uppercase tracking-wider text-[11px] text-indigo-100">Sitio Oficial de Hockey • Mendoza</span>
              </p>
            </div>
          </div>

          {/* Persistent Category Switcher in Header for High Visibility */}
          <div className="flex flex-col items-center md:items-end gap-1 px-3 py-1.5 bg-black/20 rounded-xl border border-white/10">
            <span className="text-[9px] uppercase font-black text-indigo-200 tracking-wider font-sports-condensed">
              Categoría / División Activa
            </span>
            <div className="flex flex-wrap items-center gap-0.5 bg-black/10 p-0.5 rounded-lg border border-black/15">
              {(['7ma', '6ta', '5ta', 'Intermedia', 'Primera'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer font-sports-condensed ${
                    selectedCategory === cat
                      ? 'bg-club-gradient text-white font-extrabold shadow-md border border-white/10 scale-102 shadow-emerald-500/20'
                      : 'text-indigo-200/80 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* 3. Main Tab View Area */}
      <main id="app-viewport" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {renderTabContent()}
      </main>

      {/* 6. Dynamic Toast Banner Panel */}
      {toast && (
        <div 
          id="toast-notification-panel" 
          className="fixed bottom-4 md:bottom-8 right-4 left-4 md:left-auto md:w-96 bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-2xl flex gap-3 items-start animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 transform"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className={`w-5 h-5 ${toast.type === 'error' ? 'text-rose-500' : 'text-indigo-400'}`} />
            )}
          </div>
          <div>
            <p className="text-xs font-black text-white">{toast.title}</p>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{toast.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
