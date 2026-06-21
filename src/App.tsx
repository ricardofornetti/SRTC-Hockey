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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Settings
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
  syncCollection,
  saveDocument,
  deleteDocument,
  auth,
  ADMIN_EMAILS
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

import RoleSelector from './components/RoleSelector';
import ClubLogo from './components/ClubLogo';
import SrtcLogo from './components/SrtcLogo';
import HockeyStickBall from './components/HockeyStickBall';

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
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('7ma');
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('srtc_nav_collapsed') === 'true';
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Shared status banners / alerts
  const [toast, setToast] = useState<{ title: string; body: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [customClubLogo, setCustomClubLogo] = useState<string | null>(() => {
    return localStorage.getItem('srtc_custom_club_logo');
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Listen to Auth State dynamically and evaluate admin permissions on the fly
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setUserRole('admin');
        setCurrentUserEmail(user.email);
        
        // Seed Firestore if empty ONLY when active admin is authorized
        try {
          await seedInitialDataIfCollectionIsEmpty();
        } catch (err) {
          console.warn('Initial seeding lookup bypassed.', err);
        }
      } else {
        setUserRole('public');
        setCurrentUserEmail('');
      }
    });

    return () => unsubAuth();
  }, []);

  // Bind real-time Firestore synchronization on load
  useEffect(() => {
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
    
    const unsubSettings = subscribeToCollection<{ id: string; value?: string; name?: string; fotoUrl?: string }>('settings', (data) => {
      const logoSetting = data?.find(item => item.id === 'logo');
      if (logoSetting && logoSetting.value) {
        setCustomClubLogo(logoSetting.value);
        localStorage.setItem('srtc_custom_club_logo', logoSetting.value);
        window.dispatchEvent(new Event('srtc_logo_updated'));
      }

      const teamLogosSetting = data?.find(item => item.id === 'team_logos');
      if (teamLogosSetting && teamLogosSetting.value) {
        localStorage.setItem('srtc_team_logos_db', teamLogosSetting.value);
        window.dispatchEvent(new Event('srtc_logo_updated'));
        window.dispatchEvent(new Event('storage'));
      }

      const baselinesSetting = data?.find(item => item.id === 'standings_baselines');
      if (baselinesSetting && baselinesSetting.value) {
        localStorage.setItem('srtc_standings_baseline_db_v5', baselinesSetting.value);
        window.dispatchEvent(new Event('storage'));
      }

      // Sync DT and AC configurations for all categories
      data?.forEach(item => {
        if (item.id.startsWith('dt_config_')) {
          const category = item.id.replace('dt_config_', '');
          if (item.name) localStorage.setItem(`srtc_dt_name_${category}`, item.name);
          if (item.fotoUrl) localStorage.setItem(`srtc_dt_foto_${category}`, item.fotoUrl);
          window.dispatchEvent(new Event('srtc_dt_updated'));
        } else if (item.id.startsWith('ac_config_')) {
          const category = item.id.replace('ac_config_', '');
          if (item.name) localStorage.setItem(`srtc_ac_name_${category}`, item.name);
          if (item.fotoUrl) localStorage.setItem(`srtc_ac_foto_${category}`, item.fotoUrl);
          window.dispatchEvent(new Event('srtc_ac_updated'));
        }
      });
    });

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubStandings();
      unsubNews();
      unsubGallery();
      unsubConvocations();
      unsubNotifications();
      unsubSettings();
    };
  }, []);

  // Trigger automatic statistics and standings compilation when matches load or are modified
  useEffect(() => {
    if (matches && matches.length > 0 && players && players.length > 0) {
      // Build a signature of matches to avoid redundant runs on player-state updates
      const matchesSignature = matches.map(m => `${m.id}-${m.estado}-${m.golesPropios}-${m.golesRival}`).join('|');
      
      const lastSignature = localStorage.getItem('srtc_last_matches_recalc_sig');
      if (lastSignature !== matchesSignature) {
        localStorage.setItem('srtc_last_matches_recalc_sig', matchesSignature);
        recalculateAndSyncPlayersAndStandings(matches);
      }
    }
  }, [matches, players.length]);

  // Sync state changes
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    showToast('Rol de Acceso Actualizado', `Ahora tienes permisos de: ${role === 'admin' ? 'Administrador' : 'Usuario Público'}`, 'info');
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
      
      const baseGoles = typeof p.baseGoles === 'number' ? p.baseGoles : (basePlayer ? basePlayer.goles : p.goles);
      const baseAsistencias = typeof p.baseAsistencias === 'number' ? p.baseAsistencias : (basePlayer ? basePlayer.asistencias : p.asistencias);
      const basePartidosJugados = typeof p.basePartidosJugados === 'number' ? p.basePartidosJugados : (basePlayer ? basePlayer.partidosJugados : p.partidosJugados);
      const baseVerde = typeof p.baseTarjetaVerde === 'number' ? p.baseTarjetaVerde : (basePlayer ? basePlayer.tarjetaVerde : p.tarjetaVerde);
      const baseAmarilla = typeof p.baseTarjetaAmarilla === 'number' ? p.baseTarjetaAmarilla : (basePlayer ? basePlayer.tarjetaAmarilla : p.tarjetaAmarilla);
      const baseRoja = typeof p.baseTarjetaRoja === 'number' ? p.baseTarjetaRoja : (basePlayer ? basePlayer.tarjetaRoja : p.tarjetaRoja);

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
          const hasAssisted = m.asistidorasIds && m.asistidorasIds.some(as => as.jugadorId === p.id && as.cantidad > 0);
          const hasCards = m.tarjetas && m.tarjetas.some(tc => tc.jugadorId === p.id && ((tc.verde || 0) > 0 || (tc.amarilla || 0) > 0 || (tc.roja || 0) > 0));
          const isMvp = m.mvpId === p.id;

          if (isConvocada || hasScored || hasAssisted || hasCards || isMvp) {
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
      setPlayers(updatedPlayers);
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
    showToast('Galería sincronizada', 'Catálogo de imágenes actualizado.', 'success');
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

  const handleSaveCustomLogo = async (logoData: string) => {
    try {
      setCustomClubLogo(logoData);
      localStorage.setItem('srtc_custom_club_logo', logoData);
      window.dispatchEvent(new Event('srtc_logo_updated'));
      await saveDocument('settings', 'logo', { id: 'logo', value: logoData });
      showToast('Logo del Club Actualizado', 'El logo se guardó correctamente y se sincronizó con el servidor.', 'success');
      setIsLogoModalOpen(false);
    } catch (err) {
      console.error('Error saving custom logo in Firebase setting collection:', err);
      showToast('Actualizado localmente', 'Guardado en tu dispositivo, pero falló la sincronización con la base de datos.', 'info');
      setIsLogoModalOpen(false);
    }
  };

  const handleResetCustomLogo = async () => {
    try {
      setCustomClubLogo(null);
      localStorage.removeItem('srtc_custom_club_logo');
      window.dispatchEvent(new Event('srtc_logo_updated'));
      await deleteDocument('settings', 'logo');
      showToast('Logo Restablecido', 'Se ha vuelto a configurar el escudo oficial predeterminado.', 'success');
      setIsLogoModalOpen(false);
    } catch (err) {
      console.error('Error resetting custom logo in Firebase:', err);
      setCustomClubLogo(null);
      localStorage.removeItem('srtc_custom_club_logo');
      window.dispatchEvent(new Event('srtc_logo_updated'));
      showToast('Logo Restablecido', 'Se quitó de forma local en tu dispositivo.', 'info');
      setIsLogoModalOpen(false);
    }
  };

  const toggleNavCollapse = () => {
    setIsNavCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('srtc_nav_collapsed', String(next));
      return next;
    });
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
            userRole={userRole}
            customClubLogo={customClubLogo}
            onSaveLogo={handleSaveCustomLogo}
            onResetLogo={handleResetCustomLogo}
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
            onTabChange={setActiveTab}
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
            onTabChange={setActiveTab}
          />
        );
      case 'plantel':
        return (
          <Plantel 
            players={players} 
            userRole={userRole} 
            selectedCategory={selectedCategory} 
            onUpdatePlayers={handleUpdatePlayers} 
            onTabChange={setActiveTab}
          />
        );
      case 'estadisticas':
        return (
          <Estadisticas 
            players={players} 
            matches={matches} 
            selectedCategory={selectedCategory} 
            onTabChange={setActiveTab}
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
            onTabChange={setActiveTab}
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
    { id: 'inicio', label: 'Inicio', icon: Home, category: 'Torneo y Equipo' },
    { id: 'fixture', label: 'Fixture', icon: Calendar, category: 'Torneo y Equipo' },
    { id: 'tabla', label: 'Tabla', icon: Trophy, category: 'Torneo y Equipo' },
    { id: 'plantel', label: 'Plantel', icon: Users, category: 'Torneo y Equipo' },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, category: 'Torneo y Equipo' },
    { id: 'galeria', label: 'Galería', icon: ImageIcon, category: 'Torneo y Equipo' },
  ];

  const extraTabsConfig = [
    { id: 'convocatorias', label: 'Convocadas', icon: Award, category: 'Club y Comunidad' },
    { id: 'noticias', label: 'Noticias', icon: Newspaper, category: 'Club y Comunidad' },
    { id: 'mas', label: 'Ajustes', icon: Settings, category: 'Preferencias' }
  ];

  return (
    <div id="app-root-container" className="min-h-screen bg-club-gradient text-neutral-100 flex flex-row font-sans relative overflow-x-hidden">
      
      {/* Drawer Móvil deslizable (desde la izquierda) controlado por AnimatePresence */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop con desenfoque de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Contenedor del Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[#090d22] border-r border-white/10 z-50 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div className="flex flex-col flex-grow py-5 px-4 overflow-y-auto no-scrollbar">
                {/* Header del Drawer Móvil */}
                <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 p-0.5 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      {customClubLogo ? (
                        <img 
                          src={customClubLogo} 
                          alt="Logo SRTC Custom" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <SrtcLogo className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">TENIS CLUB</h3>
                      <span className="text-[9px] text-[#7a9660] font-bold uppercase tracking-widest leading-none mt-1 block">Hockey Césped</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Decoración Temática Ligera de Hockey */}
                <div className="bg-gradient-to-r from-emerald-950/20 to-indigo-950/20 border border-white/5 rounded-xl p-3 mb-5 flex items-center gap-2 relative overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 opacity-15">
                    <HockeyStickBall className="w-16 h-16 animate-pulse" animate={false} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SRTC - HOCKEY</h4>
                    <p className="text-[10px] text-indigo-200/85 font-medium mt-1">Sitio Oficial de Hockey • Mendoza</p>
                  </div>
                </div>

                {/* Listado de Navegación del Drawer Móvil */}
                <div className="space-y-6 flex-grow font-sports-condensed">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-300/40 tracking-widest block mb-1.5 px-3">Principal</span>
                    <nav className="space-y-1">
                      {tabsConfig.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setIsMobileDrawerOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left w-full transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/30 text-white font-extrabold border-l-4 border-emerald-450 pl-3' 
                                : 'text-indigo-200 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-450' : 'text-indigo-350'}`} />
                            <span className="text-xs uppercase font-bold tracking-wider">{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-300/40 tracking-widest block mb-1.5 px-3">Comunidad y Más</span>
                    <nav className="space-y-1">
                      {extraTabsConfig.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setIsMobileDrawerOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left w-full transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/30 text-white font-extrabold border-l-4 border-emerald-450 pl-3' 
                                : 'text-indigo-200 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-450' : 'text-indigo-350'}`} />
                            <span className="text-xs uppercase font-bold tracking-wider">{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Pie del Drawer Móvil */}
              <div className="p-4 border-t border-white/5 shrink-0 bg-[#070b1e] text-center">
                <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold block mb-2">San Rafael Tenis Club</span>
                <div className="flex justify-center">
                  <RoleSelector 
                    currentRole={userRole} 
                    currentUserEmail={currentUserEmail} 
                    showToast={showToast}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
         1. SIDEBAR FIJO LATERAL - DESKTOP & TABLET (≥768px)
         ========================================================================= */}
      <aside 
        id="desktop-sidebar" 
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 bg-[#090d22] border-r border-white/10 z-40 transition-all duration-300 relative shrink-0 overflow-y-auto no-scrollbar ${
          isNavCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Capa de destello superior */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#3e7496] via-[#7a9660] to-[#3e7496]" />

        {/* Bloque Superior: Logo + Header de Club */}
        <div className="p-5 flex flex-col shrink-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3.5 select-none overflow-hidden">
              {/* Logo SRTC */}
              <div 
                onClick={() => setActiveTab('inicio')}
                className="w-11 h-11 shrink-0 p-1 bg-white border border-white/10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {customClubLogo ? (
                  <img 
                    src={customClubLogo} 
                    alt="Logo Club" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <SrtcLogo className="w-8 h-8" />
                )}
              </div>
              
              {/* Título (visible solo si NO está colapsado) */}
              {!isNavCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <h1 className="text-sm font-black text-white leading-none tracking-tight uppercase hover:text-amber-305 cursor-pointer transition font-display" onClick={() => setActiveTab('inicio')}>
                    SRTC HOCKEY
                  </h1>
                  <span className="text-[10px] text-emerald-450 uppercase tracking-widest font-black leading-none mt-1">Sitio Oficial</span>
                </motion.div>
              )}
            </div>

            {/* Botón de alternancia de colapsado (Toggle) */}
            <button 
              onClick={toggleNavCollapse}
              className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition cursor-pointer self-center"
              title={isNavCollapsed ? "Expandir Menú" : "Colapsar Menú"}
            >
              {isNavCollapsed ? (
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Sticker de Hockey Césped en Sidebar (solo si está expandido) */}
          {!isNavCollapsed && (
            <div className="bg-gradient-to-r from-emerald-950/20 to-indigo-950/20 border border-white/5 rounded-xl py-3 px-2 flex items-center justify-between gap-1 mt-4 relative overflow-hidden group">
              <div className="flex items-center gap-2.5">
                <HockeyStickBall className="w-10 h-10" />
                <div>
                  <h4 className="text-[9px] font-black text-emerald-450 tracking-widest uppercase mb-0.5">ESTADO VIVO</h4>
                  <p className="text-[9px] text-indigo-200/80 leading-snug font-bold">Instalaciones Listas</p>
                </div>
              </div>
              {/* Un destello sutil de fondo */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
            </div>
          )}
        </div>

        {/* Bloque Medio: Listado de Ítems de Navegación Vertical */}
        <div className="flex-grow px-3 space-y-6 overflow-y-auto no-scrollbar py-2 font-sports-condensed">
          
          {/* Categoría: Torneo y Equipo */}
          <div>
            {!isNavCollapsed && (
              <span className="text-[9px] font-black uppercase text-indigo-300/30 tracking-widest block mb-2 px-3 animate-pulse">TORNEO Y EQUIPO</span>
            )}
            <nav className="space-y-1">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center rounded-xl text-left transition-all duration-200 cursor-pointer h-11 relative group w-full ${
                      isNavCollapsed ? 'justify-center px-1' : 'px-4 py-2.5'
                    } ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-black border-l-4 border-emerald-450 pl-3' 
                        : 'text-indigo-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-450 font-black' : 'text-indigo-300'}`} />
                    
                    {!isNavCollapsed && (
                      <span className="text-xs uppercase font-extrabold tracking-wider ml-3">{tab.label}</span>
                    )}

                    {/* Transición suave para tab activa utilizando layoutId de motion */}
                    {isActive && !isNavCollapsed && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-450"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Tooltip flotante en hover al estar colapsado */}
                    {isNavCollapsed && (
                      <div className="absolute left-20 z-50 bg-[#0c122c] border border-white/15 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-150 whitespace-nowrap">
                        {tab.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Categoría: Club y Comunidad */}
          <div>
            {!isNavCollapsed && (
              <span className="text-[9px] font-black uppercase text-indigo-300/30 tracking-widest block mb-2 px-3 animate-pulse">CLUB Y COMUNIDAD</span>
            )}
            <nav className="space-y-1">
              {extraTabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center rounded-xl text-left transition-all duration-200 cursor-pointer h-11 relative group w-full ${
                      isNavCollapsed ? 'justify-center px-1' : 'px-4 py-2.5'
                    } ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#3e7496]/20 to-[#7a9660]/20 text-white font-black border-l-4 border-emerald-450 pl-3' 
                        : 'text-indigo-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-450 font-black' : 'text-indigo-300'}`} />
                    
                    {!isNavCollapsed && (
                      <span className="text-xs uppercase font-extrabold tracking-wider ml-3">{tab.label}</span>
                    )}

                    {/* Tooltip flotante en hover al estar colapsado */}
                    {isNavCollapsed && (
                      <div className="absolute left-20 z-50 bg-[#0c122c] border border-white/15 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-150 whitespace-nowrap">
                        {tab.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Bloque Inferior del Sidebar */}
        <div className="p-3 border-t border-white/5 shrink-0 bg-[#070b1e]">
          {/* Info del Rol de Acceso */}
          <div className="flex flex-col items-center justify-center gap-1">
            <RoleSelector 
              currentRole={userRole} 
              currentUserEmail={currentUserEmail} 
              showToast={showToast}
            />
            {!isNavCollapsed && (
              <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider mt-1 text-center select-none block">
                San Rafael Tenis Club © 2026
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
         2. CONTENEDOR DE CONTENIDO PRINCIPAL (Derecha del Sidebar en Desktop)
         ========================================================================= */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#060919] min-h-screen pb-24 md:pb-8 relative">
        
        {/* =====================================================================
           2.1 CABECERA MÓVIL (Visible únicamente en Mobile <768px)
           ===================================================================== */}
        <header id="mobile-navigation-header" className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f24] border-b border-white/15 shadow-xl sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            {/* Botón Hamburguesa que abre el drawer */}
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/12 text-white hover:bg-white/10 transition cursor-pointer"
              title="Abrir Menú"
            >
              <Menu className="w-5.5 h-5.5 text-emerald-400" />
            </button>

            {/* Escudo Oficial en Miniatura */}
            <div 
              onClick={() => setActiveTab('inicio')}
              className="w-8 h-8 p-0.5 bg-white rounded-lg flex items-center justify-center shadow-md cursor-pointer shrink-0"
            >
              {customClubLogo ? (
                <img 
                  src={customClubLogo} 
                  alt="Logo Club" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <SrtcLogo className="w-6 h-6" />
              )}
            </div>

            {/* Título de SRTC */}
            <div onClick={() => setActiveTab('inicio')} className="cursor-pointer select-none">
              <h1 className="text-sm font-black text-white hover:text-amber-350 leading-tight uppercase tracking-wider block font-display">
                SRTC HOCKEY
              </h1>
              <span className="text-[8px] text-[#7a9660] font-black uppercase tracking-widest leading-none block font-sports-condensed">7ma división</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RoleSelector 
              currentRole={userRole} 
              currentUserEmail={currentUserEmail} 
              showToast={showToast}
            />
          </div>
        </header>

        {/* =====================================================================
           2.2 SUB-HEADER / CONTROL CENTRAL SUPERIOR (Común a Desktop, para todas las Tabs)
           Incluye breadcrumbs consistentes y el selector ágil de categorías
           ===================================================================== */}
        <div className="bg-club-gradient-elements/40 border-b border-white/5 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 select-none shrink-0">
          {/* Breadcrumb sutil e indicador de página actual */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-indigo-300/50 uppercase tracking-widest font-mono">
              <span>Club San Rafael Tenis</span>
              <span className="text-emerald-450">/</span>
              <span className="text-indigo-200">Categorías</span>
              <span className="text-emerald-450">/</span>
              <span className="text-white font-extrabold">{selectedCategory.toUpperCase()}</span>
            </div>
            
            {/* Título adaptativo dinámico */}
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider leading-none font-display">
                {activeTab === 'inicio' && 'Panel de Inicio'}
                {activeTab === 'fixture' && 'Calendario y Resultados'}
                {activeTab === 'tabla' && 'Tabla de Posiciones'}
                {activeTab === 'plantel' && 'Plantel de Jugadoras'}
                {activeTab === 'estadisticas' && 'Estadísticas del Torneo'}
                {activeTab === 'galeria' && 'Galería del Torneo'}
                {activeTab === 'convocatorias' && 'Planillas de Convocadas'}
                {activeTab === 'noticias' && 'Noticias e Informaciones'}
                {activeTab === 'mas' && 'Configuraciones Generales'}
              </h2>
            </div>
          </div>

          {/* Selector de Divisiones / Categorías para cambios ágiles */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center bg-black/25 p-1 rounded-xl border border-white/10">
            <span className="text-[9px] font-black text-indigo-300/60 uppercase tracking-widest px-2 font-sports-condensed">División:</span>
            <div className="flex items-center gap-1 font-sports-condensed">
              {(['7ma', '6ta', '5ta', 'Intermedia', 'Primera'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider cursor-pointer transition-all duration-150 shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-tr from-[#3e7496] to-[#7a9660] text-white shadow-md border border-white/10 font-black'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat === 'Intermedia' ? 'Inter' : cat === 'Primera' ? '1ra' : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
           2.3 ÁREA DE CONTENIDO DE LA PÁGINA (Viewport con animación de entrada)
           ===================================================================== */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full flex-1"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* =======================================================================
         3. BOTTOM NAVIGATION BAR - EXCLUSIVO MÓVIL (<768px)
         Diseño compacto, similar a app nativa deportiva premium
         ======================================================================= */}
      <nav id="mobile-bottom-navigation" className="md:hidden fixed bottom-2 left-4 right-4 bg-[#0a0f24]/95 backdrop-blur-md border border-white/15 p-1 rounded-2xl shadow-2xl z-45 flex items-center justify-between h-14">
        {[
          { id: 'inicio', label: 'Inicio', icon: Home },
          { id: 'fixture', label: 'Fixture', icon: Calendar },
          { id: 'tabla', label: 'Posiciones', icon: Trophy },
          { id: 'plantel', label: 'Plantel', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileDrawerOpen(false);
              }}
              className="flex-1 flex flex-col items-center justify-center h-full relative cursor-pointer group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-pill"
                  className="absolute inset-x-2 inset-y-1 bg-gradient-to-tr from-[#3e7496]/25 to-[#7a9660]/25 border border-white/10 rounded-xl z-0"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              
              <div className="z-10 flex flex-col items-center justify-center font-sports-condensed">
                <Icon className={`w-4.5 h-4.5 mb-0.5 shrink-0 transition-transform ${isActive ? 'text-emerald-450 font-extrabold scale-110' : 'text-indigo-300'}`} />
                <span className={`text-[8.5px] font-black uppercase tracking-wider block ${isActive ? 'text-white' : 'text-indigo-200/70'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}

        {/* Botón "Más" (abre el Drawer deslizable lateral) */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center h-full relative cursor-pointer group font-sports-condensed"
        >
          <div className="z-10 flex flex-col items-center justify-center">
            <Menu className="w-4.5 h-4.5 mb-0.5 text-indigo-300 shrink-0 group-hover:text-emerald-450 transition" />
            <span className="text-[8.5px] font-black uppercase tracking-wider text-indigo-200/70 block">
              Menú
            </span>
          </div>
        </button>
      </nav>

      {/* =======================================================================
         4. DIALOG PANEL TO CONFIGURE ALERTS / TOAST
         ======================================================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="toast-notification-panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-18 md:bottom-8 right-4 left-4 md:left-auto md:w-96 bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-2xl flex gap-3 items-start z-50 transform"
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
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
