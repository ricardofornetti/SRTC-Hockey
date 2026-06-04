/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, ShieldAlert, Save, Upload } from 'lucide-react';
import { Player, UserRole, Category } from '../../types';

interface PlantelProps {
  players: Player[];
  userRole: UserRole;
  selectedCategory: Category;
  onUpdatePlayers: (updatedPlayers: Player[]) => void;
}

export default function Plantel({ players, userRole, selectedCategory, onUpdatePlayers }: PlantelProps) {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'Todos' | 'Arquera' | 'Defensora' | 'Volante' | 'Delantera'>('Todos');
  
  // Edit/Create Player States
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // DT Editable Information States (Persisted in localStorage per Category)
  const [dtName, setDtName] = useState(() => {
    return localStorage.getItem(`srtc_dt_name_${selectedCategory}`) || 'Sebastian';
  });
  const [dtFotoUrl, setDtFotoUrl] = useState(() => {
    return localStorage.getItem(`srtc_dt_foto_${selectedCategory}`) || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150';
  });
  const [isEditingDt, setIsEditingDt] = useState(false);
  const [dtFormName, setDtFormName] = useState('');
  const [dtFormFotoUrl, setDtFormFotoUrl] = useState('');

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [numeroCamiseta, setNumeroCamiseta] = useState(0);
  const [posicion, setPosicion] = useState<'Arquera' | 'Defensora' | 'Volante' | 'Delantera'>('Volante');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [partidosJugados, setPartidosJugados] = useState(0);
  const [goles, setGoles] = useState(0);
  const [asistencias, setAsistencias] = useState(0);
  const [tarjetaVerde, setTarjetaVerde] = useState(0);
  const [tarjetaAmarilla, setTarjetaAmarilla] = useState(0);
  const [tarjetaRoja, setTarjetaRoja] = useState(0);

  // Read local file as Base64 helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter and search
  const baseFilteredPlayers = players
    .filter(p => p.categoria === selectedCategory)
    .filter(p => {
      const fullname = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchSearch = fullname.includes(search.toLowerCase()) || 
        (p.numeroCamiseta && p.numeroCamiseta.toString() === search) ||
        (!p.numeroCamiseta && search.toLowerCase() === 's/n');
      return matchSearch;
    });

  const handleStartEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsCreating(false);
    setNombre(player.nombre);
    setApellido(player.apellido);
    setNumeroCamiseta(player.numeroCamiseta || 0);
    setPosicion(player.posicion);
    setFechaNacimiento(player.fechaNacimiento);
    setFotoUrl(player.fotoUrl);
    setPartidosJugados(player.partidosJugados);
    setGoles(player.goles);
    setAsistencias(player.asistencias);
    setTarjetaVerde(player.tarjetaVerde);
    setTarjetaAmarilla(player.tarjetaAmarilla);
    setTarjetaRoja(player.tarjetaRoja);
  };

  const handleStartCreate = () => {
    setEditingPlayer(null);
    setIsCreating(true);
    setNombre('');
    setApellido('');
    setNumeroCamiseta(players.length > 0 ? Math.max(...players.map(p => p.numeroCamiseta || 0)) + 1 : 1);
    setPosicion('Volante');
    setFechaNacimiento('2012-06-01');
    setFotoUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');
    setPartidosJugados(0);
    setGoles(0);
    setAsistencias(0);
    setTarjetaVerde(0);
    setTarjetaAmarilla(0);
    setTarjetaRoja(0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;

    let updatedList: Player[];
    const finalFoto = fotoUrl.trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';

    if (isCreating) {
      const newPlayer: Player = {
        id: 'player_' + Date.now(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        numeroCamiseta: Number(numeroCamiseta),
        posicion: posicion,
        fechaNacimiento: fechaNacimiento || '2013-01-01',
        fotoUrl: finalFoto,
        partidosJugados: Number(partidosJugados),
        goles: Number(goles),
        asistencias: Number(asistencias),
        tarjetaVerde: Number(tarjetaVerde),
        tarjetaAmarilla: Number(tarjetaAmarilla),
        tarjetaRoja: Number(tarjetaRoja),
        categoria: selectedCategory,
        destacada: false
      };
      updatedList = [...players, newPlayer];
    } else if (editingPlayer) {
      updatedList = players.map(p => {
        if (p.id === editingPlayer.id) {
          return {
            ...p,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            numeroCamiseta: Number(numeroCamiseta),
            posicion: posicion,
            fechaNacimiento: fechaNacimiento || '2013-01-01',
            fotoUrl: finalFoto,
            partidosJugados: Number(partidosJugados),
            goles: Number(goles),
            asistencias: Number(asistencias),
            tarjetaVerde: Number(tarjetaVerde),
            tarjetaAmarilla: Number(tarjetaAmarilla),
            tarjetaRoja: Number(tarjetaRoja)
          };
        }
        return p;
      });
    } else {
      return;
    }

    onUpdatePlayers(updatedList);
    setEditingPlayer(null);
    setIsCreating(false);
  };

  const handleDelete = (playerId: string) => {
    if (confirm('¿Desea dar de baja a esta jugadora del plantel?')) {
      const updatedList = players.filter(p => p.id !== playerId);
      onUpdatePlayers(updatedList);
    }
  };

  const handleStartEditDt = () => {
    setDtFormName(dtName);
    setDtFormFotoUrl(dtFotoUrl);
    setIsEditingDt(true);
  };

  const handleSaveDt = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = dtFormName.trim() || 'Sebastian';
    const finalFoto = dtFormFotoUrl.trim() || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150';
    setDtName(finalName);
    setDtFotoUrl(finalFoto);
    localStorage.setItem(`srtc_dt_name_${selectedCategory}`, finalName);
    localStorage.setItem(`srtc_dt_foto_${selectedCategory}`, finalFoto);
    setIsEditingDt(false);
  };

  const positionsOrdered: ('Arquera' | 'Defensora' | 'Volante' | 'Delantera')[] = [
    'Arquera',
    'Defensora',
    'Volante',
    'Delantera'
  ];

  const positionLabels: Record<'Arquera' | 'Defensora' | 'Volante' | 'Delantera', string> = {
    'Arquera': 'Arquera (Portera)',
    'Defensora': 'Defensoras',
    'Volante': 'Volantes / Mediocampistas',
    'Delantera': 'Delanteras'
  };

  // Filter which positions we display based on current filter state
  const activePositions = positionFilter === 'Todos' 
    ? positionsOrdered 
    : [positionFilter];

  return (
    <div id="roster-tab" className="space-y-8">
      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-club-gradient-elements p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o nº..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/25 text-xs text-white pl-9 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500 transition font-sans"
          />
        </div>

        {/* Position pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar py-1 font-sports-condensed">
          {(['Todos', 'Arquera', 'Defensora', 'Volante', 'Delantera'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3.5 py-1 text-xs font-black rounded-lg border uppercase tracking-wider cursor-pointer shrink-0 transition-all duration-200 ${
                positionFilter === pos
                  ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-md scale-105'
                  : 'bg-white/5 border-white/15 text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {pos === 'Todos' ? 'Todas' : pos + 's'}
            </button>
          ))}
        </div>

        {/* Action Button */}
        {(userRole === 'admin' || userRole === 'coach') && (
          <button
            onClick={handleStartCreate}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 px-4.5 py-2 rounded-lg text-xs font-black font-sports-condensed uppercase tracking-wider cursor-pointer transition shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Agregar Jugadora
          </button>
        )}
      </div>

      {/* Profile Form Modal Overlay */}
      {(isCreating || editingPlayer) && (
        <div id="player-edit-modal" className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full h-full">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-sports-condensed uppercase tracking-wider">
                <Users className="w-4 h-4 text-indigo-400" />
                {isCreating ? 'Agregar Nueva Jugadora' : `Ficha de ${editingPlayer?.nombre} ${editingPlayer?.apellido}`}
              </h3>
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setIsCreating(false);
                }}
                className="text-neutral-400 hover:text-white bg-neutral-850 px-3 py-1 text-xs rounded transition font-black font-sports-condensed uppercase tracking-wide"
              >
                Cerrar
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider mb-1.5 font-sports-condensed">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Guillermina"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider mb-1.5 font-sports-condensed">Apellido</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Alvarez Luppo"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider mb-1.5 font-sports-condensed">Nº de Camiseta (0 para S/N)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={numeroCamiseta}
                    onChange={(e) => setNumeroCamiseta(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider mb-1.5 font-sports-condensed">Posición</label>
                  <select
                    value={posicion}
                    onChange={(e) => setPosicion(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Arquera" className="bg-neutral-950">Arquera</option>
                    <option value="Defensora" className="bg-neutral-950">Defensora</option>
                    <option value="Volante" className="bg-neutral-950">Volante (Mediocampista)</option>
                    <option value="Delantera" className="bg-neutral-950">Delantera</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Image Uploader */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-3 font-sans">
                <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider font-sports-condensed">Foto de Jugadora</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {fotoUrl && (
                    <img
                      src={fotoUrl}
                      alt="Vista previa"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow shadow-indigo-500/20 shrink-0 self-center"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="player-image-file"
                        onChange={(e) => handleImageUpload(e, setFotoUrl)}
                        className="hidden"
                      />
                      <label
                        htmlFor="player-image-file"
                        className="flex items-center justify-center gap-2 w-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 hover:border-indigo-400 text-neutral-200 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                      >
                        <Upload className="w-4 h-4 text-indigo-450 text-indigo-400" />
                        Seleccionar de mi dispositivo
                      </label>
                    </div>
                    <p className="text-[10px] text-neutral-500 text-center">o pegue dirección URL:</p>
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-900 border border-neutral-805 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Adjust Panel - admins/coaches can alter raw figures */}
              <div className="border-t border-neutral-850 pt-3.5 space-y-3 font-sans">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest font-sports-condensed">Historial de Rendimiento</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-450 mb-1 font-sports-condensed tracking-wider">PJ</label>
                    <input
                      type="number"
                      min="0"
                      value={partidosJugados}
                      onChange={(e) => setPartidosJugados(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-450 mb-1 font-sports-condensed tracking-wider">Goles</label>
                    <input
                      type="number"
                      min="0"
                      value={goles}
                      onChange={(e) => setGoles(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center font-bold text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-450 mb-1 font-sports-condensed tracking-wider">Asistencias</label>
                    <input
                      type="number"
                      min="0"
                      value={asistencias}
                      onChange={(e) => setAsistencias(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center font-bold text-indigo-450"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-indigo-550/5 bg-indigo-600/5 p-3 rounded-xl border border-indigo-500/10">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-emerald-500 mb-1 font-sports-condensed tracking-wide">T. Verde</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaVerde}
                      onChange={(e) => setTarjetaVerde(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-amber-500 mb-1 font-sports-condensed tracking-wide">T. Amarilla</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaAmarilla}
                      onChange={(e) => setTarjetaAmarilla(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-rose-500 mb-1 font-sports-condensed tracking-wide">T. Roja</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaRoja}
                      onChange={(e) => setTarjetaRoja(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Box actions */}
              <div className="border-t border-neutral-850 pt-4 flex items-center justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlayer(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DT Edit Modal Overlay */}
      {isEditingDt && (
        <div id="dt-edit-modal" className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-sports-condensed uppercase tracking-wider">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Editar Ficha de Director Técnico
              </h3>
              <button
                onClick={() => setIsEditingDt(false)}
                className="text-neutral-400 hover:text-white bg-neutral-850 px-3 py-1 text-xs rounded transition font-black font-sports-condensed uppercase tracking-wide"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveDt} className="p-6 space-y-4 text-left font-sans">
              <div>
                <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider mb-1.5 font-sports-condensed">Nombre del DT</label>
                <input
                  type="text"
                  value={dtFormName}
                  onChange={(e) => setDtFormName(e.target.value)}
                  placeholder="Ej. Sebastián"
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* DT Photo Upload */}
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-3 font-sans">
                <label className="block text-[10px] uppercase font-black text-neutral-400 tracking-wider font-sports-condensed">Foto de Perfil del DT</label>
                <div className="flex flex-col items-stretch gap-3">
                  {dtFormFotoUrl && (
                    <img
                      src={dtFormFotoUrl}
                      alt="Vista previa DT"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-455 border-indigo-500 shadow shadow-indigo-500/20 shrink-0 self-center"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="dt-image-file"
                        onChange={(e) => handleImageUpload(e, setDtFormFotoUrl)}
                        className="hidden"
                      />
                      <label
                        htmlFor="dt-image-file"
                        className="flex items-center justify-center gap-2 w-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 hover:border-indigo-400 text-neutral-200 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                      >
                        <Upload className="w-4 h-4 text-indigo-400" />
                        Cargar Foto del Dispositivo
                      </label>
                    </div>
                    <p className="text-[9px] text-neutral-500 text-center font-sans">o pegue dirección URL:</p>
                    <input
                      type="url"
                      value={dtFormFotoUrl}
                      onChange={(e) => setDtFormFotoUrl(e.target.value)}
                      placeholder="Pegar dirección URL de foto..."
                      className="w-full bg-neutral-900 border border-neutral-805 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-850 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingDt(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Roster Positions Sections */}
      <div className="space-y-12">
        {activePositions.map((pos) => {
          const playersInPosition = baseFilteredPlayers.filter(p => p.posicion === pos);
          
          if (playersInPosition.length === 0) return null;

          return (
            <div key={pos} className="space-y-5">
              {/* Position Header Banner */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-left">
                <span className="w-3 h-7 rounded-sm bg-emerald-500 shadow-glow shadow-emerald-450/40"></span>
                <h3 className="text-xl font-black font-sports-condensed text-white uppercase tracking-widest flex items-center gap-2">
                  {positionLabels[pos].toUpperCase()}
                  <span className="text-[11px] bg-black/35 border border-white/10 text-emerald-300 font-black px-2.5 py-0.5 rounded-full font-sans">
                    {playersInPosition.length}
                  </span>
                </h3>
              </div>

              {/* Roster Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {playersInPosition.map((player) => {
                  return (
                    <div
                      key={player.id}
                      className="bg-club-gradient-elements border border-white/10 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/30 hover:-translate-y-0.5 transition duration-355 overflow-hidden group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Photo Profile with shirt badge */}
                        <div className="relative shrink-0">
                          <img
                            src={player.fotoUrl}
                            alt={`${player.nombre} ${player.apellido}`}
                            referrerPolicy="no-referrer"
                            className="w-18 h-18 rounded-2xl object-cover border-2 border-white/10 group-hover:border-emerald-500/40 transition duration-200"
                          />
                          <div className="absolute -bottom-1.5 -right-1.5 bg-black/60 border border-white/10 text-emerald-300 font-extrabold rounded-lg text-[10px] w-6 h-6 flex items-center justify-center shadow-lg font-sports-condensed">
                            {player.numeroCamiseta && player.numeroCamiseta > 0 ? `#${player.numeroCamiseta}` : 'S/N'}
                          </div>
                        </div>

                        {/* Name and position */}
                        <div className="text-left space-y-1">
                          <h3 className="font-extrabold font-sports-condensed text-white group-hover:text-emerald-300 transition-colors tracking-wide text-lg text-left">
                            {player.apellido.toUpperCase()}, {player.nombre}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25 uppercase tracking-wide">
                              {player.posicion}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scoreboard block (games, goals, cards) */}
                      <div className="grid grid-cols-3 gap-2 bg-black/25 p-2.5 rounded-xl border border-white/10 mt-4 text-center">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-indigo-400 font-black font-sports-condensed">PJ</span>
                          <strong className="text-sm font-mono font-black text-indigo-100">{player.partidosJugados}</strong>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-emerald-400 font-black font-sports-condensed">Goles</span>
                          <strong className="text-sm font-mono font-black text-emerald-450">{player.goles}</strong>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-black font-sports-condensed">Asist</span>
                          <strong className="text-sm font-mono font-black text-indigo-200">{player.asistencias}</strong>
                        </div>
                      </div>

                      {/* Disciplinary cards banner */}
                      <div className="flex items-center justify-between border-t border-white/5 mt-3 pt-3">
                        <div className="flex items-center gap-2">
                          {/* Cards counter icons */}
                          <div className="flex items-center gap-1" title="Tarjetas recibidas">
                            <div className="w-3 h-4 bg-emerald-500 rounded-sm" title="Tarjeta Verde" />
                            <span className="text-[10px] font-mono text-indigo-200/55 font-bold mr-2">{player.tarjetaVerde}</span>

                            <div className="w-3 h-4 bg-amber-500 rounded-sm" title="Tarjeta Amarilla" />
                            <span className="text-[10px] font-mono text-indigo-200/55 font-bold mr-2">{player.tarjetaAmarilla}</span>

                            <div className="w-3 h-4 bg-rose-600 rounded-sm" title="Tarjeta Roja" />
                            <span className="text-[10px] font-mono text-indigo-200/55 font-bold">{player.tarjetaRoja}</span>
                          </div>

                          {player.tarjetaRoja > 0 && (
                            <span className="text-[8px] bg-rose-600/15 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" /> Suspendida
                            </span>
                          )}
                        </div>

                        {/* Actions context menu */}
                        <div className="flex items-center gap-1 pt-1">
                          {(userRole === 'admin' || userRole === 'coach') && (
                            <button
                              onClick={() => handleStartEdit(player)}
                              className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white transition text-[10px] font-bold flex items-center gap-1 cursor-pointer font-sans"
                            >
                              <Edit2 className="w-3 h-3 text-indigo-200" /> Editar
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="p-1 rounded bg-rose-650/10 text-rose-400 hover:bg-rose-650 hover:text-white transition cursor-pointer"
                              title="Baja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty Search Warning */}
        {baseFilteredPlayers.length === 0 && (
          <div className="text-center py-12 bg-club-gradient-elements border border-white/10 rounded-2xl">
            <Users className="w-10 h-10 text-indigo-200/40 mx-auto mb-2" />
            <p className="text-indigo-200 font-medium text-xs">No se encontraron jugadoras que coincidan con la búsqueda.</p>
          </div>
        )}

        {/* Cuerpo Técnico / DT section header & card (rendered at the end) */}
        {(!search.trim() || dtName.toLowerCase().includes(search.toLowerCase()) || 'dt'.includes(search.toLowerCase()) || 'coach'.includes(search.toLowerCase())) && positionFilter === 'Todos' && (
          <div className="space-y-5 pt-4">
            {/* Staff Section Divider */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-left">
              <span className="w-3 h-7 rounded-sm bg-emerald-500 shadow-glow shadow-emerald-450/40"></span>
              <h3 className="text-xl font-black font-sports-condensed text-white uppercase tracking-widest">
                CUERPO TÉCNICO
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-club-gradient-elements border border-white/10 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/30 hover:-translate-y-0.5 transition duration-350 overflow-hidden group">
                <div className="absolute top-0 right-0 bg-emerald-500/15 text-emerald-300 font-extrabold text-[8px] px-2.5 py-1 rounded-bl-xl uppercase tracking-wider font-sports-condensed border-l border-b border-white/5">
                  Staff Oficial
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={dtFotoUrl}
                      alt={dtName}
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-white/10 group-hover:border-emerald-500/40 transition"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 font-extrabold rounded-md text-[8px] px-1.5 py-0.5 shadow-md font-sports-condensed">
                      DT
                    </div>
                  </div>
                  
                  <div className="text-left space-y-1">
                    <h4 className="font-extrabold font-sports-condensed text-white group-hover:text-emerald-350 transition-colors tracking-wide text-xl uppercase">
                      {dtName}
                    </h4>
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest font-sans">
                      Director Técnico (DT)
                    </p>
                    <p className="text-[10px] text-indigo-150 font-sans">División {selectedCategory}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3.5">
                  <span className="text-[10px] text-indigo-200/50 font-mono">Coordinador Principal</span>
                  
                  {/* Actions context menu for DT */}
                  {(userRole === 'admin' || userRole === 'coach') && (
                    <button
                      onClick={handleStartEditDt}
                      className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white transition text-[10px] font-bold flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <Edit2 className="w-3 h-3 text-indigo-200" /> Editar Foto/Nombre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
