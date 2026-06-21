/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, History, Search, Save, Send, 
  Trash2, Layers, Compass, HelpCircle, Share2, Star, Trophy
} from 'lucide-react';
import { Match, Player, NewsItem, GalleryItem, NotificationLog, UserRole, Category } from '../../types';
import { HISTORICAL_SEASONS } from '../../data';
import DataMigrationTool from '../DataMigrationTool';

interface MasProps {
  notifications: NotificationLog[];
  players: Player[];
  matches: Match[];
  gallery: GalleryItem[];
  userRole: UserRole;
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  onUpdateNotifications: (updated: NotificationLog[]) => void;
  onShowNotificationBanner: (title: string, body: string) => void;
  onShare: (title: string, text: string) => void;
  onTabChange: (tabId: string) => void;
}

export default function Mas({
  notifications,
  players,
  matches,
  gallery,
  userRole,
  selectedCategory,
  onCategoryChange,
  onUpdateNotifications,
  onShowNotificationBanner,
  onShare,
  onTabChange
}: MasProps) {
  const [activeSubTab, setActiveSubTab] = useState<'buscador' | 'notificaciones' | 'historial'>('buscador');
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  
  // FCM notification builder parameters
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'noticia' | 'resultado' | 'horario' | 'convocatoria'>('noticia');

  // Unified global search indexing
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { players: [], matches: [], gallery: [] };
    const query = searchQuery.toLowerCase();

    const matchedPlayers = players.filter(p => 
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(query) ||
      p.numeroCamiseta.toString() === query ||
      p.posicion.toLowerCase().includes(query)
    );

    const matchedMatches = matches.filter(m => 
      m.rival.toLowerCase().includes(query) ||
      m.cancha.toLowerCase().includes(query) ||
      m.fecha.includes(query)
    );

    const matchedGallery = gallery.filter(g => 
      g.titulo.toLowerCase().includes(query) ||
      g.torneo.toLowerCase().includes(query)
    );

    return { players: matchedPlayers, matches: matchedMatches, gallery: matchedGallery };
  };

  const results = getSearchResults();

  // Action: Broadcast FCM notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return;

    const newLog: NotificationLog = {
      id: 'notif_' + Date.now(),
      titulo: notifTitle.trim(),
      cuerpo: notifBody.trim(),
      fecha: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' Hs',
      tipo: notifType
    };

    onUpdateNotifications([newLog, ...notifications]);
    
    // Trigger in-app dynamic banner alert
    onShowNotificationBanner(notifTitle, notifBody);

    // clear fields
    setNotifTitle('');
    setNotifBody('');
  };

  const handleDeleteNotification = (id: string) => {
    onUpdateNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div id="mas-tab" className="space-y-6 text-left">
      {/* Upper Navigation Row: Categories Scalability Switcher */}
      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            Control Multidisciplinario de Categorías
          </h3>
          <p className="text-[11px] text-neutral-400 max-w-xl">
            La arquitectura de base de datos de la App permite cambiar de división al instante. Toda la información (plantel, fixtures, posiciones y convocatorias) se filtra por el valor seleccionado.
          </p>
        </div>

        {/* Division Picker */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 w-full md:w-auto">
          {(['7ma', '6ta', '5ta', 'Intermedia', 'Primera'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[11px] font-black tracking-wide uppercase transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub menu selectors */}
      <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
        <button
          onClick={() => setActiveSubTab('buscador')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
            activeSubTab === 'buscador' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" /> Buscador
        </button>
        <button
          onClick={() => setActiveSubTab('notificaciones')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
            activeSubTab === 'notificaciones' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-1" /> FCM Push ({notifications.length})
        </button>
        <button
          onClick={() => setActiveSubTab('historial')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
            activeSubTab === 'historial' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 inline mr-1" /> Historial
        </button>
      </div>

      {/* CORE ACTIVE CONTAINER CARDS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        {/* SUBTAB 1: GLOBAL UNIFIED SEARCH */}
        {activeSubTab === 'buscador' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Buscador Oficial SRTC</h4>
              <p className="text-[11px] text-neutral-400">Consulte al instante fichas, resultados pasados o comunicados.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escriba nombre de jugadora, rival, cancha, etc..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            {searchQuery.trim().length > 0 ? (
              <div className="space-y-4 pt-2">
                {/* Players Results */}
                {results.players.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Jugadoras del Roster</span>
                    <div className="divide-y divide-neutral-800 bg-neutral-950 rounded-xl p-2 border border-neutral-850">
                      {results.players.map(p => (
                        <div key={p.id} className="p-2 flex items-center justify-between text-xs cursor-pointer hover:bg-neutral-900" onClick={() => onTabChange('plantel')}>
                          <span>#{p.numeroCamiseta} <strong>{p.nombre} {p.apellido}</strong> ({p.posicion})</span>
                          <span className="text-[10px] text-neutral-500">Goles: {p.goles} →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matches Results */}
                {results.matches.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-rose-450 uppercase tracking-widest block text-rose-400">Partidos / Fixture</span>
                    <div className="divide-y divide-neutral-800 bg-neutral-950 rounded-xl p-2 border border-neutral-850">
                      {results.matches.map(m => (
                        <div key={m.id} className="p-2 flex items-center justify-between text-xs cursor-pointer hover:bg-neutral-900" onClick={() => onTabChange('fixture')}>
                          <span>vs <strong>{m.rival}</strong> - Cancha: {m.cancha}</span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 rounded">{m.fecha}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Results */}
                {results.gallery.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Galería / Fotos</span>
                    <div className="divide-y divide-neutral-800 bg-neutral-950 rounded-xl p-2 border border-neutral-850">
                      {results.gallery.map(g => (
                        <div key={g.id} className="p-2 text-xs flex flex-col gap-0.5 cursor-pointer hover:bg-neutral-900" onClick={() => onTabChange('galeria')}>
                          <span className="font-bold text-neutral-200">
                            {g.titulo && g.titulo.toLowerCase() !== 'foto' ? g.titulo : 'Foto del Club'}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {g.fecha}
                            {g.torneo && g.torneo.toLowerCase() !== 'general' && ` • ${g.torneo}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.players.length === 0 && results.matches.length === 0 && results.gallery.length === 0 && (
                  <p className="text-center py-6 text-neutral-500 text-xs">No se encontraron registros que coincidan con la búsqueda.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 space-y-1">
                <Compass className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs">Escriba una consulta arriba para buscar registros integrados.</p>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: FCM PUSH NOTIFICATION SIMULATOR */}
        {activeSubTab === 'notificaciones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1 text-left">
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">FCM Cloud Messaging Logs</h4>
                <p className="text-[11px] text-neutral-400">Historial de alertas enviadas en tiempo real directas a celulares.</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>Simulador de Envío Listo</span>
              </div>
            </div>

            {/* Admin broadcaster block */}
            {(userRole === 'admin') ? (
              <form onSubmit={handleSendNotification} className="bg-neutral-950 p-4 border border-neutral-800 rounded-xl space-y-4.5 text-xs text-left">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">📢 Emitir Notificación Push global</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Título de la Alerta</label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="Ej. ¡Resultado del Clásico!"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Categoría / Tipo</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-2 text-white"
                    >
                      <option value="noticia">Nueva Noticia Institucional</option>
                      <option value="resultado">Carga de Resultado</option>
                      <option value="horario">Reprogramación de Horario</option>
                      <option value="convocatoria">Publicación de Convocatoria</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-bold mb-1 font-sans">Cuerpo de la Ventana Emergente</label>
                  <input
                    type="text"
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    placeholder="Ej. El plantel femenino de 7ma venció 2-1 a Maristas de local..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-2 text-white placeholder-neutral-600"
                    required
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-4 rounded shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar Broadcast
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-neutral-400 text-xs">
                🔒 Para emitir transmisiones de notificaciones ingrese con rol de <strong>Entrenador</strong> o <strong>Administrador</strong> en la sección superior.
              </div>
            )}

            {/* Notification logs scroll stack */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Registro Reciente</span>
              
              {notifications.length > 0 ? (
                <div className="divide-y divide-neutral-800 bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden">
                  {notifications.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-start gap-3 text-xs hover:bg-neutral-900/50">
                      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-indigo-400 shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-neutral-100">{item.titulo}</strong>
                          <span className="text-[9px] font-mono text-neutral-500 font-bold">{item.fecha}</span>
                        </div>
                        <p className="text-neutral-400 text-[11px] leading-normal">{item.cuerpo}</p>
                      </div>
                      
                      {/* Delete actions */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="text-neutral-600 hover:text-rose-500 shrink-0 p-1 cursor-pointer"
                          title="Eliminar Alerta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-xs py-4 text-center">No hay registros de notificaciones emitidas.</p>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: HISTORICAL PAST SEASONS RECORD */}
        {activeSubTab === 'historial' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Archivo Histórico de Temporadas</h4>
              <p className="text-[11px] text-neutral-400">Récord y palmarés del hockey infantil y juvenil de SRTC.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pct-full font-sans">
              {HISTORICAL_SEASONS.map((season, idx) => (
                <div key={idx} className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                  <span className="font-black text-rose-500 text-xs block">{season.año}</span>
                  <h5 className="font-extrabold text-neutral-100 text-xs mt-1">{season.division}</h5>
                  <p className="text-amber-400 text-[11px] font-black mt-2 flex items-center gap-1">
                    🏆 {season.posicion}
                  </p>
                  
                  {season.puntos > 0 && (
                    <div className="flex items-center justify-between border-t border-neutral-900 mt-3 pt-2 text-[10px] text-neutral-500 font-mono">
                      <span>Puntos: {season.puntos}</span>
                      <span>Partidos: {season.partidos}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-neutral-950 p-4 border border-rose-500/10 rounded-xl text-[11px] text-neutral-400 leading-relaxed text-center">
              🏑 <strong>Club San Rafael Tenis Club</strong> es una de las instituciones fundadoras de la Asociación de Hockey del Sur Mendocino, consagrándose en múltiples divisiones.
            </div>
          </div>
        )}
      </div>

      {userRole === 'admin' && (
        <DataMigrationTool />
      )}
    </div>
  );
}
