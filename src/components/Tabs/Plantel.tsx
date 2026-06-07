/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, ShieldAlert, Save, Upload, ChevronLeft, Camera, CameraOff } from 'lucide-react';
import { Player, UserRole, Category } from '../../types';
import { saveDocument } from '../../firebase';

interface PlantelProps {
  players: Player[];
  userRole: UserRole;
  selectedCategory: Category;
  onUpdatePlayers: (updatedPlayers: Player[]) => void;
  onTabChange: (tab: string) => void;
}

export default function Plantel({ players, userRole, selectedCategory, onUpdatePlayers, onTabChange }: PlantelProps) {
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

  // Ayudante de Campo (AC) Editable Information States (Persisted in localStorage per Category)
  const [acName, setAcName] = useState(() => {
    return localStorage.getItem(`srtc_ac_name_${selectedCategory}`) || 'Mauricio Reynoso';
  });
  const [acFotoUrl, setAcFotoUrl] = useState(() => {
    return localStorage.getItem(`srtc_ac_foto_${selectedCategory}`) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
  });
  const [isEditingAc, setIsEditingAc] = useState(false);
  const [acFormName, setAcFormName] = useState('');
  const [acFormFotoUrl, setAcFormFotoUrl] = useState('');

  // Listen for dynamic updates (like database synchronization of DTs and ACs)
  useEffect(() => {
    const loadDtInfo = () => {
      setDtName(localStorage.getItem(`srtc_dt_name_${selectedCategory}`) || 'Sebastian');
      setDtFotoUrl(localStorage.getItem(`srtc_dt_foto_${selectedCategory}`) || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150');
    };
    const loadAcInfo = () => {
      setAcName(localStorage.getItem(`srtc_ac_name_${selectedCategory}`) || 'Mauricio Reynoso');
      setAcFotoUrl(localStorage.getItem(`srtc_ac_foto_${selectedCategory}`) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150');
    };
    loadDtInfo();
    loadAcInfo();

    window.addEventListener('srtc_dt_updated', loadDtInfo);
    window.addEventListener('srtc_ac_updated', loadAcInfo);
    return () => {
      window.removeEventListener('srtc_dt_updated', loadDtInfo);
      window.removeEventListener('srtc_ac_updated', loadAcInfo);
    };
  }, [selectedCategory]);

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

  // Live Camera states and helpers
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async (mode: 'user' | 'environment' = cameraFacingMode) => {
    setCameraError(null);
    setIsUsingCamera(true);
    
    // Stop any existing stream first
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      // Auto assign the stream to the video element shortly after render
      setTimeout(() => {
        const videoElement = document.getElementById('player-camera-preview') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 200);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("No se pudo acceder a la cámara. Revisa los permisos.");
      setIsUsingCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsUsingCamera(false);
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (isUsingCamera) {
      startCamera(nextMode);
    }
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('player-camera-preview') as HTMLVideoElement;
    if (!videoElement) return;

    try {
      const canvas = document.createElement('canvas');
      const width = videoElement.videoWidth || 640;
      const height = videoElement.videoHeight || 480;
      
      // We want a beautiful compressed thumb
      const MAX_DIM = 200;
      let targetWidth = width;
      let targetHeight = height;
      
      if (width > height) {
        if (width > MAX_DIM) {
          targetHeight = Math.round(height * (MAX_DIM / width));
          targetWidth = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          targetWidth = Math.round(width * (MAX_DIM / height));
          targetHeight = MAX_DIM;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (cameraFacingMode === 'user') {
          ctx.translate(targetWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setFotoUrl(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error("Error capturing camera frame:", err);
    }
  };

  // Read local file as Base64 helper with canvas compression to keep files tiny (< 20KB) for Firestore
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension of 200px is perfect for roster thumbnails
          const MAX_DIM = 200;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG with 0.75 quality (highly optimized size)
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
            callback(compressedUrl);
          } else {
            callback(reader.result as string);
          }
        };
        img.src = reader.result;
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
        destacada: false,
        baseGoles: Number(goles),
        baseAsistencias: Number(asistencias),
        basePartidosJugados: Number(partidosJugados),
        baseTarjetaVerde: Number(tarjetaVerde),
        baseTarjetaAmarilla: Number(tarjetaAmarilla),
        baseTarjetaRoja: Number(tarjetaRoja)
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
            baseGoles: Number(goles),
            baseAsistencias: Number(asistencias),
            basePartidosJugados: Number(partidosJugados),
            baseTarjetaVerde: Number(tarjetaVerde),
            baseTarjetaAmarilla: Number(tarjetaAmarilla),
            baseTarjetaRoja: Number(tarjetaRoja)
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

  const handleSaveDt = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = dtFormName.trim() || 'Sebastian';
    const finalFoto = dtFormFotoUrl.trim() || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150';
    setDtName(finalName);
    setDtFotoUrl(finalFoto);
    localStorage.setItem(`srtc_dt_name_${selectedCategory}`, finalName);
    localStorage.setItem(`srtc_dt_foto_${selectedCategory}`, finalFoto);
    setIsEditingDt(false);

    // Sync DT configuration to Firestore
    try {
      await saveDocument('settings', `dt_config_${selectedCategory}`, {
        id: `dt_config_${selectedCategory}`,
        name: finalName,
        fotoUrl: finalFoto
      });
    } catch (err) {
      console.error('Error syncing DT info to Firestore:', err);
    }
  };

  const handleStartEditAc = () => {
    setAcFormName(acName);
    setAcFormFotoUrl(acFotoUrl);
    setIsEditingAc(true);
  };

  const handleSaveAc = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = acFormName.trim() || 'Mauricio Reynoso';
    const finalFoto = acFormFotoUrl.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    setAcName(finalName);
    setAcFotoUrl(finalFoto);
    localStorage.setItem(`srtc_ac_name_${selectedCategory}`, finalName);
    localStorage.setItem(`srtc_ac_foto_${selectedCategory}`, finalFoto);
    setIsEditingAc(false);

    // Sync AC configuration to Firestore
    try {
      await saveDocument('settings', `ac_config_${selectedCategory}`, {
        id: `ac_config_${selectedCategory}`,
        name: finalName,
        fotoUrl: finalFoto
      });
    } catch (err) {
      console.error('Error syncing AC info to Firestore:', err);
    }
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
    <div id="roster-tab" className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-club-gradient-elements p-3.5 rounded-2xl border border-white/10 shadow-lg flex items-center w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar py-0.5 font-sports-condensed">
          {/* Volver */}
          <button
            onClick={() => onTabChange('inicio')}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 hover:text-white transition rounded-xl text-xs font-sports-condensed uppercase tracking-wider font-extrabold cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
            Volver
          </button>

          {/* Separador vertical */}
          <span className="h-6 w-px bg-white/10 shrink-0 mx-1"></span>

          {/* Position tabs */}
          {(['Todos', 'Arquera', 'Defensora', 'Volante', 'Delantera'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-lg border uppercase tracking-wider cursor-pointer shrink-0 transition-all duration-200 ${
                positionFilter === pos
                  ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-md'
                  : 'bg-white/5 border-white/15 text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {pos === 'Todos' ? 'Todas' : pos === 'Arquera' ? 'Arqueras' : pos === 'Defensora' ? 'Defensoras' : pos === 'Volante' ? 'Volantes' : 'Delanteras'}
            </button>
          ))}

          {/* Separador visual si hay admin buttons */}
          {(userRole === 'admin' || userRole === 'coach') && (
            <>
              <span className="h-6 w-px bg-white/10 shrink-0 mx-1"></span>
              <button
                onClick={handleStartCreate}
                className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 px-3.5 py-1.5 rounded-lg text-xs font-black font-sports-condensed uppercase tracking-wider cursor-pointer shrink-0 transition shadow-md shadow-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Jugadora
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Form Modal Overlay */}
      {(isCreating || editingPlayer) && (
        <div id="player-edit-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full h-full">
          <div className="bg-[#121c38] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
            <div className="bg-[#0c1228] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-sports-condensed uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" />
                {isCreating ? 'Agregar Nueva Jugadora' : `Ficha de ${editingPlayer?.nombre} ${editingPlayer?.apellido}`}
              </h3>
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setIsCreating(false);
                }}
                className="text-white hover:text-emerald-350 bg-white/10 hover:bg-white/15 px-3 py-1 text-xs rounded transition font-black font-sports-condensed uppercase tracking-wide cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Guillermina"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Apellido</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Alvarez Luppo"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Nº de Camiseta (0 para S/N)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={numeroCamiseta}
                    onChange={(e) => setNumeroCamiseta(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Posición</label>
                  <select
                    value={posicion}
                    onChange={(e) => setPosicion(e.target.value as any)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Arquera" className="bg-[#121c38] text-white">Arquera</option>
                    <option value="Defensora" className="bg-[#121c38] text-white">Defensora</option>
                    <option value="Volante" className="bg-[#121c38] text-white">Volante (Mediocampista)</option>
                    <option value="Delantera" className="bg-[#121c38] text-white">Delantera</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Image Uploader */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/10 space-y-3 font-sans">
                <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider font-sports-condensed">Foto de Jugadora</label>
                
                {isUsingCamera ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/80 border border-white/15 flex items-center justify-center">
                      <video
                        id="player-camera-preview"
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? '-scale-x-100' : ''}`}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-[9px] text-white/90 px-2 py-0.5 rounded uppercase font-black tracking-widest font-sports-condensed">
                        {cameraFacingMode === 'user' ? 'Frontal' : 'Trasera'}
                      </div>
                    </div>
                    {cameraError && (
                      <p className="text-[10px] text-rose-400 font-medium text-center">{cameraError}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[11px] font-black font-sports-condensed uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <Camera className="w-3.5 h-3.5" /> Capturar
                      </button>
                      <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-[11px] font-black font-sports-condensed uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Girar
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-black font-sports-condensed uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {fotoUrl && (
                      <img
                        src={fotoUrl}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow shadow-emerald-500/20 shrink-0 self-center"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="player-image-file"
                            onChange={(e) => handleImageUpload(e, setFotoUrl)}
                            className="hidden"
                          />
                          <label
                            htmlFor="player-image-file"
                            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500 text-white text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition text-center"
                          >
                            <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                            Subir de Galería
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="flex items-center justify-center gap-2 w-full bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-400 text-emerald-405 text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition text-center"
                        >
                          <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                          Tomar con Cámara
                        </button>
                      </div>
                      
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-2 text-[9px] text-white/30 uppercase tracking-widest font-mono">o pegar URL</span>
                        <div className="flex-grow border-t border-white/5"></div>
                      </div>

                      <input
                        type="url"
                        value={fotoUrl}
                        onChange={(e) => setFotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 rounded-lg p-2 text-xs text-white focus:outline-none font-mono transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Adjust Panel - admins/coaches can alter raw figures */}
              <div className="border-t border-white/10 pt-3.5 space-y-3 font-sans">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest font-sports-condensed">Historial de Rendimiento</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-white/80 mb-1 font-sports-condensed tracking-wider">PJ</label>
                    <input
                      type="number"
                      min="0"
                      value={partidosJugados}
                      onChange={(e) => setPartidosJugados(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-white/80 mb-1 font-sports-condensed tracking-wider">Goles</label>
                    <input
                      type="number"
                      min="0"
                      value={goles}
                      onChange={(e) => setGoles(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-white/80 mb-1 font-sports-condensed tracking-wider">Asistencias</label>
                    <input
                      type="number"
                      min="0"
                      value={asistencias}
                      onChange={(e) => setAsistencias(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-center font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-emerald-500 mb-1 font-sports-condensed tracking-wide">T. Verde</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaVerde}
                      onChange={(e) => setTarjetaVerde(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-amber-500 mb-1 font-sports-condensed tracking-wide">T. Amarilla</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaAmarilla}
                      onChange={(e) => setTarjetaAmarilla(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-rose-500 mb-1 font-sports-condensed tracking-wide">T. Roja</label>
                    <input
                      type="number"
                      min="0"
                      value={tarjetaRoja}
                      onChange={(e) => setTarjetaRoja(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Box actions */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlayer(null);
                    setIsCreating(false);
                    stopCamera();
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    stopCamera();
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
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
        <div id="dt-edit-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full h-full">
          <div className="bg-[#121c38] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
            <div className="bg-[#0c1228] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-sports-condensed uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" />
                Ficha de Director Técnico
              </h3>
              <button
                onClick={() => setIsEditingDt(false)}
                className="text-white hover:text-emerald-350 bg-white/10 hover:bg-white/15 px-3 py-1 text-xs rounded transition font-black font-sports-condensed uppercase tracking-wide cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveDt} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Nombre del DT</label>
                  <input
                    type="text"
                    value={dtFormName}
                    onChange={(e) => setDtFormName(e.target.value)}
                    placeholder="Ej. Sebastián"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                    required
                  />
                </div>
              </div>

              {/* DT Photo Upload */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/10 space-y-3 font-sans">
                <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider font-sports-condensed">Foto de Perfil del DT</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {dtFormFotoUrl && (
                    <img
                      src={dtFormFotoUrl}
                      alt="Vista previa DT"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow shadow-emerald-500/20 shrink-0 self-center"
                    />
                  )}
                  <div className="flex-1 space-y-2">
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
                        className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        Seleccionar de mi dispositivo
                      </label>
                    </div>
                    <p className="text-[10px] text-white/60 text-center">o pegue dirección URL:</p>
                    <input
                      type="url"
                      value={dtFormFotoUrl}
                      onChange={(e) => setDtFormFotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 rounded-lg p-2 text-xs text-white focus:outline-none font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => setIsEditingDt(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AC Edit Modal Overlay */}
      {isEditingAc && (
        <div id="ac-edit-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full h-full">
          <div className="bg-[#121c38] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
            <div className="bg-[#0c1228] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-sports-condensed uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" />
                Ficha de Ayudante de Campo
              </h3>
              <button
                onClick={() => setIsEditingAc(false)}
                className="text-white hover:text-emerald-350 bg-white/10 hover:bg-white/15 px-3 py-1 text-xs rounded transition font-black font-sports-condensed uppercase tracking-wide cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveAc} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider mb-1.5 font-sports-condensed">Nombre del Ayudante de Campo</label>
                  <input
                    type="text"
                    value={acFormName}
                    onChange={(e) => setAcFormName(e.target.value)}
                    placeholder="Ej. Mauricio Reynoso"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                    required
                  />
                </div>
              </div>

              {/* AC Photo Upload */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/10 space-y-3 font-sans">
                <label className="block text-[10px] uppercase font-black text-white/90 tracking-wider font-sports-condensed">Foto de Perfil del Ayudante</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {acFormFotoUrl && (
                    <img
                      src={acFormFotoUrl}
                      alt="Vista previa AC"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow shadow-emerald-500/20 shrink-0 self-center"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="ac-image-file"
                        onChange={(e) => handleImageUpload(e, setAcFormFotoUrl)}
                        className="hidden"
                      />
                      <label
                        htmlFor="ac-image-file"
                        className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        Seleccionar de mi dispositivo
                      </label>
                    </div>
                    <p className="text-[10px] text-white/60 text-center">o pegue dirección URL:</p>
                    <input
                      type="url"
                      value={acFormFotoUrl}
                      onChange={(e) => setAcFormFotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 rounded-lg p-2 text-xs text-white focus:outline-none font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => setIsEditingAc(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 text-xs font-black font-sports-condensed uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Ficha
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
                  <span className="text-[11px] bg-black/35 border border-white/10 text-white font-black px-2.5 py-0.5 rounded-full font-sans">
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
                            <span className="text-[9px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                              {player.posicion}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scoreboard block (games, goals, cards) */}
                      <div className="grid grid-cols-3 gap-2 bg-black/25 p-2.5 rounded-xl border border-white/10 mt-4 text-center">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/70 font-black font-sports-condensed">PJ</span>
                          <strong className="text-sm font-mono font-black text-white">{player.partidosJugados}</strong>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/70 font-black font-sports-condensed">Goles</span>
                          <strong className="text-sm font-mono font-black text-white">{player.goles}</strong>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/70 font-black font-sports-condensed">Asist</span>
                          <strong className="text-sm font-mono font-black text-white">{player.asistencias}</strong>
                        </div>
                      </div>

                      {/* Disciplinary cards banner */}
                      <div className="flex items-center justify-between border-t border-white/5 mt-3 pt-3">
                        <div className="flex items-center gap-2">
                          {/* Cards counter icons */}
                          <div className="flex items-center gap-1" title="Tarjetas recibidas">
                            <div className="w-3 h-4 bg-emerald-500 rounded-sm" title="Tarjeta Verde" />
                            <span className="text-[10px] font-mono text-white/90 font-bold mr-2">{player.tarjetaVerde}</span>

                            <div className="w-3 h-4 bg-amber-500 rounded-sm" title="Tarjeta Amarilla" />
                            <span className="text-[10px] font-mono text-white/90 font-bold mr-2">{player.tarjetaAmarilla}</span>

                            <div className="w-3 h-4 bg-rose-600 rounded-sm" title="Tarjeta Roja" />
                            <span className="text-[10px] font-mono text-white/90 font-bold">{player.tarjetaRoja}</span>
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
            <p className="text-white font-medium text-xs">No se encontraron jugadoras que coincidan con la búsqueda.</p>
          </div>
        )}

        {/* Cuerpo Técnico / DT & AC section header & card (rendered at the end) */}
        {(!search.trim() || 
          dtName.toLowerCase().includes(search.toLowerCase()) || 
          acName.toLowerCase().includes(search.toLowerCase()) || 
          'dt'.includes(search.toLowerCase()) || 
          'ayudante'.includes(search.toLowerCase()) || 
          'coach'.includes(search.toLowerCase())) && positionFilter === 'Todos' && (
          <div className="space-y-5 pt-4">
            {/* Staff Section Divider */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-left">
              <span className="w-3 h-7 rounded-sm bg-emerald-500 shadow-glow shadow-emerald-450/40"></span>
              <h3 className="text-xl font-black font-sports-condensed text-white uppercase tracking-widest">
                CUERPO TÉCNICO
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* DT Card */}
              {(!search.trim() || dtName.toLowerCase().includes(search.toLowerCase()) || 'dt'.includes(search.toLowerCase()) || 'coach'.includes(search.toLowerCase())) && (
                <div className="bg-club-gradient-elements border border-white/10 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/30 hover:-translate-y-0.5 transition duration-350 overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-emerald-500/15 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-bl-xl uppercase tracking-wider font-sports-condensed border-l border-b border-white/5">
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
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest font-sans">
                        Director Técnico (DT)
                      </p>
                      <p className="text-[10px] text-white/90 font-sans">División {selectedCategory}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3.5">
                    <span className="text-[10px] text-white/80 font-mono">Coordinador Principal</span>
                    
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
              )}

              {/* Ayudante de Campo (AC) Card */}
              {(!search.trim() || acName.toLowerCase().includes(search.toLowerCase()) || 'ayudante'.includes(search.toLowerCase()) || 'staff'.includes(search.toLowerCase())) && (
                <div className="bg-club-gradient-elements border border-white/10 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/30 hover:-translate-y-0.5 transition duration-350 overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-emerald-500/15 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-bl-xl uppercase tracking-wider font-sports-condensed border-l border-b border-white/5">
                    Staff Oficial
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={acFotoUrl}
                        alt={acName}
                        referrerPolicy="no-referrer"
                        className="w-18 h-18 rounded-2xl object-cover border-2 border-white/10 group-hover:border-emerald-500/40 transition"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-teal-500 text-[#0c1228] font-extrabold rounded-md text-[8px] px-1.5 py-0.5 shadow-md font-sports-condensed">
                        AC
                      </div>
                    </div>
                    
                    <div className="text-left space-y-1">
                      <h4 className="font-extrabold font-sports-condensed text-white group-hover:text-emerald-350 transition-colors tracking-wide text-xl uppercase">
                        {acName}
                      </h4>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest font-sans">
                        Ayudante de Campo
                      </p>
                      <p className="text-[10px] text-white/90 font-sans">División {selectedCategory}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3.5">
                    <span className="text-[10px] text-white/80 font-mono">Asistente Técnico</span>
                    
                    {/* Actions context menu for AC */}
                    {(userRole === 'admin' || userRole === 'coach') && (
                      <button
                        onClick={handleStartEditAc}
                        className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white transition text-[10px] font-bold flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Edit2 className="w-3 h-3 text-indigo-200" /> Editar Foto/Nombre
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
