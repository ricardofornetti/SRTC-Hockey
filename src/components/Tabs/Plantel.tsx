/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Calendar, Award, Trash2, ShieldAlert, Check, Save } from 'lucide-react';
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

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [numeroCamiseta, setNumeroCamiseta] = useState(1);
  const [posicion, setPosicion] = useState<'Arquera' | 'Defensora' | 'Volante' | 'Delantera'>('Volante');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [partidosJugados, setPartidosJugados] = useState(0);
  const [goles, setGoles] = useState(0);
  const [asistencias, setAsistencias] = useState(0);
  const [tarjetaVerde, setTarjetaVerde] = useState(0);
  const [tarjetaAmarilla, setTarjetaAmarilla] = useState(0);
  const [tarjetaRoja, setTarjetaRoja] = useState(0);
  const [destacada, setDestacada] = useState(false);

  // Filter and search
  const baseFilteredPlayers = players
    .filter(p => p.categoria === selectedCategory)
    .filter(p => {
      const fullname = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchSearch = fullname.includes(search.toLowerCase()) || p.numeroCamiseta.toString() === search;
      const matchPos = positionFilter === 'Todos' ? true : p.posicion === positionFilter;
      return matchSearch && matchPos;
    });

  const positionWeights: Record<string, number> = {
    'Arquera': 1,
    'Defensora': 2,
    'Volante': 3,
    'Delantera': 4,
  };

  const filteredPlayers = [...baseFilteredPlayers].sort((a, b) => {
    const weightA = positionWeights[a.posicion] || 99;
    const weightB = positionWeights[b.posicion] || 99;
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return a.numeroCamiseta - b.numeroCamiseta;
  });

  const handleStartEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsCreating(false);
    setNombre(player.nombre);
    setApellido(player.apellido);
    setNumeroCamiseta(player.numeroCamiseta);
    setPosicion(player.posicion);
    setFechaNacimiento(player.fechaNacimiento);
    setFotoUrl(player.fotoUrl);
    setPartidosJugados(player.partidosJugados);
    setGoles(player.goles);
    setAsistencias(player.asistencias);
    setTarjetaVerde(player.tarjetaVerde);
    setTarjetaAmarilla(player.tarjetaAmarilla);
    setTarjetaRoja(player.tarjetaRoja);
    setDestacada(player.destacada || false);
  };

  const handleStartCreate = () => {
    setEditingPlayer(null);
    setIsCreating(true);
    setNombre('');
    setApellido('');
    setNumeroCamiseta(players.length > 0 ? Math.max(...players.map(p => p.numeroCamiseta)) + 1 : 1);
    setPosicion('Volante');
    setFechaNacimiento('2012-06-01');
    setFotoUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');
    setPartidosJugados(0);
    setGoles(0);
    setAsistencias(0);
    setTarjetaVerde(0);
    setTarjetaAmarilla(0);
    setTarjetaRoja(0);
    setDestacada(false);
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
            tarjetaRoja: Number(tarjetaRoja),
            destacada: false
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

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div id="roster-tab" className="space-y-6">
      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-md">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o nº..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 text-xs text-white pl-9 pr-4 py-2 rounded-lg border border-neutral-800 focus:outline-none focus:border-indigo-600 transition"
          />
        </div>

        {/* Position pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {(['Todos', 'Arquera', 'Defensora', 'Volante', 'Delantera'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1 text-xs font-bold rounded-full border cursor-pointer shrink-0 transition ${
                positionFilter === pos
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-neutral-800 border-neutral-750 text-neutral-400 hover:text-neutral-200'
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
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" /> Agregar Jugadora
          </button>
        )}
      </div>

      {/* Profile Form Modal Overlay */}
      {(isCreating || editingPlayer) && (
        <div id="player-edit-modal" className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                {isCreating ? 'Agregar Nueva Jugadora' : `Ficha de ${editingPlayer?.nombre} ${editingPlayer?.apellido}`}
              </h3>
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setIsCreating(false);
                }}
                className="text-neutral-400 hover:text-white bg-neutral-850 px-2.5 py-1 text-xs rounded transition font-bold"
              >
                Cerrar
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Martina"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. González"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Nº de Camiseta</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={numeroCamiseta}
                    onChange={(e) => setNumeroCamiseta(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Posición</label>
                  <select
                    value={posicion}
                    onChange={(e) => setPosicion(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Arquera" className="bg-neutral-950">Arquera</option>
                    <option value="Defensora" className="bg-neutral-950">Defensora</option>
                    <option value="Volante" className="bg-neutral-950">Volante</option>
                    <option value="Delantera" className="bg-neutral-950">Delantera</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">URL de Foto de Perfil (Opcional)</label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="Pegar dirección de imagen url..."
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>



              {/* Stats Adjust Panel - admins/coaches can alter raw figures */}
              <div className="border-t border-neutral-850 pt-3.5 space-y-3">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">Historial de Rendimiento</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-550 mb-1 text-neutral-450">PJ</label>
                    <input
                      type="number"
                      min="0"
                      value={partidosJugados}
                      onChange={(e) => setPartidosJugados(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-550 mb-1 text-neutral-450">Goles</label>
                    <input
                      type="number"
                      min="0"
                      value={goles}
                      onChange={(e) => setGoles(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center font-bold text-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-550 mb-1 text-neutral-450">Asistencias</label>
                    <input
                      type="number"
                      min="0"
                      value={asistencias}
                      onChange={(e) => setAsistencias(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded p-2 text-xs text-white text-center font-bold text-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-emerald-500 mb-1">Tarjeta Verde</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaVerde}
                      onChange={(e) => setTarjetaVerde(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-amber-500 mb-1">Tarjeta Amarilla</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaAmarilla}
                      onChange={(e) => setTarjetaAmarilla(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-rose-500 mb-1">Tarjeta Roja</label>
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
              <div className="border-t border-neutral-850 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlayer(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Cards Grid */}
      <div id="roster-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            return (
              <div
                key={player.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-rose-500/40 transition duration-300 overflow-hidden group"
              >
                <div className="flex items-start gap-4">
                  {/* Photo Profile with shirt badge */}
                  <div className="relative shrink-0">
                    <img
                      src={player.fotoUrl}
                      alt={`${player.nombre} ${player.apellido}`}
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-neutral-800 group-hover:border-rose-500/50 transition duration-200"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-neutral-950 border border-neutral-800 text-neutral-100 font-black rounded-lg text-[10px] w-6 h-6 flex items-center justify-center shadow-lg">
                      #{player.numeroCamiseta}
                    </div>
                  </div>

                  {/* Name and position */}
                  <div className="text-left space-y-1">
                    <h3 className="font-black text-rose-200 text-[15px] group-hover:text-amber-400 transition-colors tracking-wide">
                      {player.apellido.toUpperCase()}, {player.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15 uppercase tracking-wide">
                        {player.posicion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scoreboard block (games, goals, cards) */}
                <div className="grid grid-cols-3 gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850 mt-4 text-center">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-neutral-550 font-bold text-neutral-450">PJD</span>
                    <strong className="text-sm font-mono font-black text-neutral-200">{player.partidosJugados}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-green-500 font-bold">Goles</span>
                    <strong className="text-sm font-mono font-black text-green-400">{player.goles}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Asist</span>
                    <strong className="text-sm font-mono font-black text-indigo-300">{player.asistencias}</strong>
                  </div>
                </div>

                {/* Disciplinary cards banner */}
                <div className="flex items-center justify-between border-t border-neutral-850 mt-3 pt-3">
                  <div className="flex items-center gap-2">
                    {/* Cards counter icons */}
                    <div className="flex items-center gap-1" title="Tarjetas recibidas">
                      <div className="w-3 h-4 bg-green-500 rounded-sm" title="Tarjeta Verde" />
                      <span className="text-[10px] font-mono text-neutral-450 font-bold mr-2 text-neutral-400">{player.tarjetaVerde}</span>

                      <div className="w-3 h-4 bg-amber-500 rounded-sm" title="Tarjeta Amarilla" />
                      <span className="text-[10px] font-mono text-neutral-450 font-bold mr-2 text-neutral-400">{player.tarjetaAmarilla}</span>

                      <div className="w-3 h-4 bg-rose-600 rounded-sm" title="Tarjeta Roja" />
                      <span className="text-[10px] font-mono text-neutral-450 font-bold text-neutral-400">{player.tarjetaRoja}</span>
                    </div>

                    {player.tarjetaRoja > 0 && (
                      <span className="text-[8px] bg-red-600/15 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> Suspendida
                      </span>
                    )}
                  </div>

                  {/* Actions context menu */}
                  <div className="flex items-center gap-1 pt-1">
                    {(userRole === 'admin' || userRole === 'coach') && (
                      <button
                        onClick={() => handleStartEdit(player)}
                        className="p-1 px-2.5 rounded bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-neutral-400" /> Editar
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(player.id)}
                        className="p-1 rounded bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        title="Baja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-neutral-900 border border-neutral-800 rounded-2xl col-span-full">
            <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400 font-medium text-xs">No se encontraron jugadoras en esta categoría.</p>
          </div>
        )}

        {/* Cuerpo Técnico / DT rendered inline at the very end of the sorted lists */}
        {(!search.trim() || 'sebastian'.includes(search.toLowerCase()) || 'dt'.includes(search.toLowerCase()) || 'coach'.includes(search.toLowerCase())) && positionFilter === 'Todos' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-indigo-500/40 transition duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 bg-indigo-600/15 text-indigo-400 font-extrabold text-[8px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Staff
            </div>
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"
                  alt="Sebastián"
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-neutral-800"
                />
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white font-extrabold rounded-md text-[8px] px-1.5 py-0.5 shadow-md">
                  DT
                </div>
              </div>
              <div className="text-left space-y-1">
                <h4 className="font-black text-rose-200 text-[15px] tracking-wide uppercase">
                  Sebastian
                </h4>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Director Técnico (DT)
                </p>
                <p className="text-[9px] text-neutral-500">Categoría {selectedCategory}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-neutral-850 mt-3 pt-3">
              <span className="text-[10px] text-neutral-400 font-mono">Coordinador Principal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
