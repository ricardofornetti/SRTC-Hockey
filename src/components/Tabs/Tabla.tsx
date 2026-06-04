/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, HelpCircle, Share2, Camera, Save, X, Upload, Edit3, ShieldAlert } from 'lucide-react';
import { Match, Standing, Category } from '../../types';
import { INITIAL_MATCH_LIST } from '../../data';
import ClubLogo from '../ClubLogo';

interface TablaProps {
  matches: Match[];
  selectedCategory: Category;
  onShare: (title: string, text: string) => void;
  userRole?: string;
  standings?: Standing[];
  onUpdateStandings?: (standings: Standing[]) => void;
}

// Resilient name normalization resolver to align matches database spellings to spreadsheet standards
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

// All matches in the initial dataset are considered "baseline matches" whose results are already completely factored into our spreadsheet baseline.
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

export default function Tabla({ matches, selectedCategory, onShare, userRole, standings, onUpdateStandings }: TablaProps) {
  // 1. Standings Baseline state initialized from localStorage
  const [baselines, setBaselines] = useState<{ [teamName: string]: Omit<Standing, 'pj' | 'dg' | 'pts' | 'categoria'> }>(() => {
    const saved = localStorage.getItem('srtc_standings_baseline_db_v5');
    if (saved) return JSON.parse(saved);
    
    // Exact starting statistics copied from the association standings spreadsheet
    return {
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
  });

  // Admin Modal state
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Stats edit form fields
  const [editPG, setEditPG] = useState(0);
  const [editPE, setEditPE] = useState(0);
  const [editPP, setEditPP] = useState(0);
  const [editGF, setEditGF] = useState(0);
  const [editGC, setEditGC] = useState(0);

  // 2. Compute dynamic standings on top of baselines
  const activeMatches = matches.filter(m => m.categoria === selectedCategory && m.estado === 'Finalizado');

  // Clone baselines so we compute dynamic results safely
  const workingBaselines = JSON.parse(JSON.stringify(baselines)) as {
    [teamName: string]: Omit<Standing, 'pj' | 'dg' | 'pts' | 'categoria'>;
  };

  // Process and apply game-states dynamically
  activeMatches.forEach(match => {
    // Skip matches that are already included in the initial spreadsheet baseline to prevent double-counting UNLESS they were edited
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
          return; // Skip normal unmodified baseline matches
        }

        // Subtract original contribution
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

        // Add current modified contribution (only if state is Finalizado)
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
        return; // Handled, skip standard flow!
      }
    }

    const rawLocal = match.localNombre || (match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
    const rawVisitor = match.visitanteNombre || (!match.esLocal ? 'SAN RAFAEL TENIS CLUB - A' : match.rival);
    
    // Normalize names to resolve spelling variations of legacy matches properly
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

    // Ensure they both have computed configurations
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

  // Compile calculated list with PJ, PTS and DG
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

  // Sort logically: Priority 1: Points, Priority 2: Goal Difference, Priority 3: Goals Scored (gf)
  const sortedStandings = [...standingsList].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });

  // Synchronize dynamic standings array up to App.tsx when they change
  useEffect(() => {
    if (onUpdateStandings) {
      const isDifferent = JSON.stringify(standings) !== JSON.stringify(sortedStandings);
      if (isDifferent) {
        onUpdateStandings(sortedStandings);
        localStorage.setItem('srtc_standings_db', JSON.stringify(sortedStandings));
      }
    }
  }, [sortedStandings, standings, onUpdateStandings]);

  // Open Edit Dialog
  const handleOpenEditModal = (teamName: string) => {
    const baseRecord = baselines[teamName] || { pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    setEditingTeam(teamName);
    setEditPG(baseRecord.pg);
    setEditPE(baseRecord.pe);
    setEditPP(baseRecord.pp);
    setEditGF(baseRecord.gf);
    setEditGC(baseRecord.gc);

    // Look for any existing custom URL
    try {
      const savedLogosStr = localStorage.getItem('srtc_team_logos_db');
      if (savedLogosStr) {
        const savedLogos = JSON.parse(savedLogosStr);
        if (savedLogos[teamName]) {
          if (savedLogos[teamName].startsWith('data:')) {
            setLogoBase64(savedLogos[teamName]);
            setLogoUrl('');
            setLogoInputType('upload');
          } else {
            setLogoUrl(savedLogos[teamName]);
            setLogoBase64('');
            setLogoInputType('url');
          }
        } else {
          setLogoBase64('');
          setLogoUrl('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Drag Events for file uploads
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor carga un archivo de tipo imagen.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save changes
  const handleSaveEdit = () => {
    if (!editingTeam) return;

    // 1. Save dynamic custom team logo to localStorage
    const savedLogosStr = localStorage.getItem('srtc_team_logos_db') || '{}';
    const savedLogos = JSON.parse(savedLogosStr);

    if (logoInputType === 'upload' && logoBase64) {
      savedLogos[editingTeam] = logoBase64;
    } else if (logoInputType === 'url' && logoUrl.trim()) {
      savedLogos[editingTeam] = logoUrl.trim();
    }
    
    localStorage.setItem('srtc_team_logos_db', JSON.stringify(savedLogos));

    // 2. Save statistic baseline values
    const updatedBaselines = { ...baselines };
    if (!updatedBaselines[editingTeam]) {
      updatedBaselines[editingTeam] = {
        id: 'team_' + Math.random().toString(36).substr(2, 4),
        equipo: editingTeam,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0
      };
    }

    updatedBaselines[editingTeam].pg = editPG;
    updatedBaselines[editingTeam].pe = editPE;
    updatedBaselines[editingTeam].pp = editPP;
    updatedBaselines[editingTeam].gf = editGF;
    updatedBaselines[editingTeam].gc = editGC;

    setBaselines(updatedBaselines);
    localStorage.setItem('srtc_standings_baseline_db_v5', JSON.stringify(updatedBaselines));

    // Force refresh ClubLogo by creating dummy state or triggering storage event
    window.dispatchEvent(new Event('storage'));

    // Reset modals
    setEditingTeam(null);
    setLogoBase64('');
    setLogoUrl('');
  };

  // Delete logo fallback
  const handleDeleteLogo = () => {
    if (!editingTeam) return;
    const savedLogosStr = localStorage.getItem('srtc_team_logos_db') || '{}';
    const savedLogos = JSON.parse(savedLogosStr);
    delete savedLogos[editingTeam];
    localStorage.setItem('srtc_team_logos_db', JSON.stringify(savedLogos));
    
    setLogoBase64('');
    setLogoUrl('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleShareStandings = () => {
    const srtcPos = sortedStandings.findIndex(t => t.esOficialClub) + 1;
    const srtcRecord = sortedStandings.find(t => t.esOficialClub);
    if (!srtcRecord) return;
    
    const textStr = `Tabla de Posiciones 🏑: San Rafael Tenis Club marcha en la posición ${srtcPos}º de la categoría 7ma División del Hockey de San Rafael con ${srtcRecord.pts} puntos. ¡Seguinos de cerca en la App oficial!`;
    onShare('Tabla de Posiciones SRTC', textStr);
  };

  return (
    <div id="standings-tab" className="space-y-6">
      {/* Visual Header Panel */}
      <div className="bg-club-gradient-elements p-5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1 text-left">
          <h2 className="font-extrabold text-white text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            POSICIONES
          </h2>
          <p className="text-xs text-white">
            Asociación Sanrafaelina de Hockey - Torneo Apertura. Categoría {selectedCategory}.
          </p>
        </div>

        <button 
          onClick={handleShareStandings}
          className="text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition cursor-pointer font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-300" />
          Compartir Tabla
        </button>
      </div>

      {/* Main Stats Table - Extra Large Standings Columns */}
      <div className="bg-club-gradient-elements border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/10 text-white font-bold uppercase text-xs sm:text-sm tracking-wider">
                <th className="py-4 px-4 text-center w-14">Pos</th>
                <th className="py-4 px-4 min-w-[200px]">Equipo</th>
                <th className="py-4 px-3 text-center w-12">PJ</th>
                <th className="py-4 px-3 text-center w-12 font-black">PG</th>
                <th className="py-4 px-3 text-center w-12">PE</th>
                <th className="py-4 px-3 text-center w-12">PP</th>
                <th className="py-4 px-3 text-center hidden sm:table-cell w-12">GF</th>
                <th className="py-4 px-3 text-center hidden sm:table-cell w-12">GC</th>
                <th className="py-4 px-3.5 text-center w-14">DG</th>
                <th className="py-4 px-5 text-center font-black w-16">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedStandings.map((row, index) => {
                const isSrtc = row.esOficialClub;
                const pos = index + 1;
                
                return (
                  <tr 
                    key={row.id || row.equipo} 
                    className={`${
                      isSrtc 
                        ? 'bg-emerald-500/10 text-emerald-300 border-l-4 border-l-emerald-500 font-extrabold hover:bg-emerald-500/20' 
                        : 'text-indigo-150 hover:bg-white/5'
                    } transition-colors`}
                  >
                    {/* Position Label Column */}
                    <td className="py-4 px-4 text-center font-bold text-xs sm:text-sm">
                      <div className="flex items-center justify-center">
                        {pos <= 3 ? (
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                            pos === 1 ? 'bg-amber-500 text-neutral-950 font-black scale-105 shadow-md shadow-amber-500/10' :
                            pos === 2 ? 'bg-neutral-300 text-neutral-950 font-bold' :
                            'bg-amber-800 text-white font-bold'
                          }`}>
                            {pos}
                          </span>
                        ) : (
                          <span className="text-white/80 font-semibold">{pos}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Team Name Column - Extra Large Logos & Text */}
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3.5">
                          <ClubLogo teamName={row.equipo} className="w-12 h-12 flex-shrink-0 shadow-md ring-2 ring-white/10 bg-white rounded-full" />
                          <span className="text-white text-xs sm:text-sm font-extrabold tracking-tight">
                            {row.equipo}
                          </span>
                        </div>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleOpenEditModal(row.equipo)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 text-emerald-400 hover:text-emerald-350 p-1.5 rounded-lg transition shrink-0 flex items-center gap-1 text-[10px] uppercase font-bold"
                            title="Editar Escudo o Estadísticas"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Cargar Logo</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center font-bold text-xs sm:text-sm text-white">{row.pj}</td>
                    <td className="py-4 px-3 text-center font-semibold text-xs sm:text-sm text-white">{row.pg}</td>
                    <td className="py-4 px-3 text-center font-semibold text-xs sm:text-sm text-white">{row.pe}</td>
                    <td className="py-4 px-3 text-center font-semibold text-xs sm:text-sm text-white">{row.pp}</td>
                    <td className="py-4 px-3 text-center text-white/90 text-xs sm:text-sm hidden sm:table-cell">{row.gf}</td>
                    <td className="py-4 px-3 text-center text-white/90 text-xs sm:text-sm hidden sm:table-cell">{row.gc}</td>
                    
                    <td className="py-4 px-3.5 text-center font-bold text-xs sm:text-sm text-white">
                      {row.dg > 0 ? `+${row.dg}` : row.dg}
                    </td>

                    <td className="py-4 px-5 text-center font-black text-xs sm:text-sm text-white">
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>



      {/* Admin Panel Modal for Uploading Logos and Customizing Standings values */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <h3 className="font-extrabold text-white text-base">Cargar Logo y Estadísticas</h3>
                <p className="text-xs text-neutral-400 mt-1">Configura el equipo {editingTeam}</p>
              </div>
              <button 
                onClick={() => setEditingTeam(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              
              {/* CURRENT LOGO PREVIEW */}
              <div className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <ClubLogo teamName={editingTeam} className="w-18 h-18 shadow-md ring-2 ring-emerald-500 rounded-full" />
                <div>
                  <h4 className="font-bold text-white text-sm">Vista Previa Actual</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Se actualizará en todas las vistas de partidos y posiciones.</p>
                  {(logoBase64 || logoUrl) && (
                    <button
                      onClick={handleDeleteLogo}
                      className="text-[10px] text-red-400 hover:text-red-300 font-extrabold uppercase mt-2.5 flex items-center gap-1"
                    >
                      Restablecer Logo Original
                    </button>
                  )}
                </div>
              </div>

              {/* LOGO INPUT SWITCH TYPE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Método de Carga de Logo</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLogoInputType('upload')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      logoInputType === 'upload' 
                        ? 'bg-emerald-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Cargar Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoInputType('url')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      logoInputType === 'url' 
                        ? 'bg-emerald-500 text-neutral-950' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Pega una URL
                  </button>
                </div>
              </div>

              {/* INPUT FIELDS ACCORDING TO SWITCH */}
              {logoInputType === 'upload' ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                    dragActive 
                      ? 'border-emerald-400 bg-emerald-950/10' 
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-950'
                  }`}
                >
                  <Upload className="w-8 h-8 text-neutral-400 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-200">Arrastra tu logo aquí o busca un archivo</p>
                    <p className="text-[10px] text-neutral-500">Soporta PNG, JPG, GIF o SVG</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="admin-logo-upload-input" 
                  />
                  <label 
                    htmlFor="admin-logo-upload-input"
                    className="mt-2 bg-neutral-800 hover:bg-neutral-700 text-[10px] text-white font-extrabold uppercase px-3 py-1.5 rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    Buscar Archivo
                  </label>
                  {logoBase64 && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">¡Imagen seleccionada correctamente!</div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-bold block">Enlace de imagen de Internet</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/logo-equipo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* DIRECT MANUAL STANDINGS OVERRIDES */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-450 shrink-0" />
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Estadísticas de la Asociación</h4>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Sobrescribe los valores ganados, empatados, perdidos y diferencia de goles para este equipo en la liga. El total de partidos (PJ), diferencia de goles (DG) y puntos (PTS) se recalculan automáticamente en base a tu entrada.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold block">PG (Ganados)</label>
                    <input
                      type="number"
                      min={0}
                      value={editPG}
                      onChange={(e) => setEditPG(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-xs text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold block">PE (Empatados)</label>
                    <input
                      type="number"
                      min={0}
                      value={editPE}
                      onChange={(e) => setEditPE(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-xs text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold block">PP (Perdidos)</label>
                    <input
                      type="number"
                      min={0}
                      value={editPP}
                      onChange={(e) => setEditPP(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-xs text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold block">GF (Goles Favor)</label>
                    <input
                      type="number"
                      min={0}
                      value={editGF}
                      onChange={(e) => setEditGF(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-xs text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-green-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold block">GC (Goles Contra)</label>
                    <input
                      type="number"
                      min={0}
                      value={editGC}
                      onChange={(e) => setEditGC(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-xs text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-rose-500"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded-lg flex justify-between items-center text-xs border border-neutral-850 font-mono">
                  <span className="text-neutral-450">PJ Calculado: <strong className="text-neutral-200">{editPG + editPE + editPP}</strong></span>
                  <span className="text-neutral-450">DG: <strong className={editGF - editGC >= 0 ? "text-green-400" : "text-rose-400"}>{editGF - editGC}</strong></span>
                  <span className="text-neutral-450">Puntos: <strong className="text-emerald-400 font-black">{(editPG * 3) + editPE}</strong></span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-neutral-800 bg-neutral-950 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="bg-neutral-800 hover:bg-neutral-750 border border-neutral-750 text-neutral-300 text-xs font-bold uppercase py-2.5 px-4 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black uppercase py-2.5 px-4.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
