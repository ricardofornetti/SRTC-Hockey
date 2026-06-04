/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Image, Eye, Trash2, Plus, Save, Calendar, Link, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem, Match, UserRole } from '../../types';

interface GaleriaProps {
  gallery: GalleryItem[];
  matches: Match[];
  userRole: UserRole;
  onUpdateGallery: (updatedGallery: GalleryItem[]) => void;
}

export default function Galeria({ gallery, matches, userRole, onUpdateGallery }: GaleriaProps) {
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Navigate to previous/next photos safely
  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activePhoto || gallery.length <= 1) return;
    const currentIndex = gallery.findIndex(g => g.id === activePhoto.id);
    const newIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;
    setActivePhoto(gallery[newIndex]);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activePhoto || gallery.length <= 1) return;
    const currentIndex = gallery.findIndex(g => g.id === activePhoto.id);
    const newIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
    setActivePhoto(gallery[newIndex]);
  };

  // Keyboard navigation support for photos representation (Escape, Left, Right Arrow)
  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhoto(null);
      } else if (e.key === 'ArrowLeft' && gallery.length > 1) {
        // Retrieve current active image
        const currentIndex = gallery.findIndex(g => g.id === activePhoto.id);
        const newIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;
        setActivePhoto(gallery[newIndex]);
      } else if (e.key === 'ArrowRight' && gallery.length > 1) {
        const currentIndex = gallery.findIndex(g => g.id === activePhoto.id);
        const newIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
        setActivePhoto(gallery[newIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto?.id, gallery.length]);

  // Form Fields
  const [titulo, setTitulo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [torneo, setTorneo] = useState('');
  const [partidoRelacionado, setPartidoRelacionado] = useState('');

  // Drag & drop upload state and logic
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagenUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  const handleStartCreate = () => {
    setIsCreating(true);
    setTitulo('');
    setImagenUrl('https://images.unsplash.com/photo-1543326137-f3642b957686?auto=format&fit=crop&q=80&w=600');
    setTorneo('');
    setPartidoRelacionado('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagenUrl.trim()) return;

    const newItem: GalleryItem = {
      id: 'gal_' + Date.now(),
      titulo: titulo.trim(),
      imagenUrl: imagenUrl.trim(),
      fecha: new Date().toISOString().split('T')[0],
      torneo: torneo.trim()
    };

    if (partidoRelacionado) {
      newItem.partidoRelacionado = partidoRelacionado;
    }

    onUpdateGallery([...gallery, newItem]);
    setIsCreating(false);
  };

  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const handleDeleteClick = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setPhotoToDelete(itemId);
  };

  const handleConfirmDelete = () => {
    if (photoToDelete) {
      onUpdateGallery(gallery.filter(g => g.id !== photoToDelete));
      setPhotoToDelete(null);
    }
  };

  return (
    <div id="gallery-tab" className="space-y-6 text-left">
      <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow">
        <div>
          <h2 className="font-extrabold text-neutral-100 text-sm flex items-center gap-1.5 font-sans">
            <Image className="w-5 h-5 text-indigo-400" />
            Galería
          </h2>
          <p className="text-[11px] text-neutral-400">Capturas, festejos y entrenamientos de la Séptima división.</p>
        </div>

        {/* Create link */}
        {(userRole === 'admin' || userRole === 'coach') && (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Subir Foto
          </button>
        )}
      </div>

      {/* Editor Upload Panel overlay */}
      {isCreating && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Registrar nueva foto</span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-neutral-400 hover:text-white text-xs bg-neutral-850 px-2 py-0.5 rounded font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Título de la Foto (Opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Festejo del Clásico de 7ma (Opcional)"
                className="w-full bg-neutral-950 border border-neutral-850 p-2 text-xs text-neutral-100 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Torneo / Evento (Opcional)</label>
                <input
                  type="text"
                  value={torneo}
                  onChange={(e) => setTorneo(e.target.value)}
                  placeholder="Ej. Torneo Apertura"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2 text-xs text-neutral-100 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Partido Vinculado (Opcional)</label>
                <select
                  value={partidoRelacionado}
                  onChange={(e) => setPartidoRelacionado(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 p-2 text-xs text-neutral-100 rounded-lg focus:outline-none"
                >
                  <option value="">Ninguno / General</option>
                  {matches.filter(m => m.estado === 'Finalizado').map(m => (
                    <option key={m.id} value={m.id}>vs {m.rival} ({m.fecha})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-neutral-400">Cargar Archivo de Foto</label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition ${
                  dragActive 
                    ? 'border-rose-500 bg-rose-500/10' 
                    : imagenUrl 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-750'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file"
                  id="photo-file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {imagenUrl && imagenUrl.startsWith('data:image/') ? (
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <img 
                      src={imagenUrl} 
                      alt="Vista previa de cargada" 
                      className="max-h-24 object-contain rounded-lg border border-neutral-800 shadow"
                    />
                    <p className="text-[10px] text-emerald-400 font-bold">✓ Archivo cargado correctamente</p>
                    <label 
                      htmlFor="photo-file-upload" 
                      className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1 rounded-lg cursor-pointer font-bold transition duration-150"
                    >
                      Seleccionar otro archivo
                    </label>
                  </div>
                ) : (
                  <label 
                    htmlFor="photo-file-upload" 
                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2"
                  >
                    <Upload className={`w-8 h-8 mb-2 ${dragActive ? 'text-rose-400 animate-bounce' : 'text-neutral-500'}`} />
                    <p className="font-bold text-neutral-300 text-[11px]">Arrastra tu imagen aquí o haz click para explorarla</p>
                    <p className="text-[9px] text-neutral-500 mt-1">Soporta PNG, JPEG, WEBP</p>
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">O alternativamente, pegar URL de Imagen</label>
              <input
                type="url"
                value={imagenUrl.startsWith('data:') ? '' : imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="Pegar enlace url directo de foto..."
                className="w-full bg-neutral-950 border border-neutral-850 p-2 text-xs text-neutral-100 rounded-lg font-mono focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-neutral-850 flex items-center justify-end gap-2 text-right">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 font-bold rounded-lg text-white shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Registrar Foto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media interactive grid */}
      <div id="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {gallery.map((photo) => {
          // Find match related details
          const matchedMatch = matches.find(m => m.id === photo.partidoRelacionado);
          
          return (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition shadow-lg cursor-pointer group relative"
            >
              <div className="relative h-48 w-full overflow-hidden block">
                <img 
                  src={photo.imagenUrl} 
                  alt={photo.titulo} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                {/* Float overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent p-4 flex flex-col justify-end text-left opacity-90 group-hover:opacity-100 transition duration-150">
                  {photo.torneo && photo.torneo.toLowerCase() !== 'general' && (
                    <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full border border-red-500/10 w-fit mb-1.5 uppercase tracking-wide">
                      {photo.torneo}
                    </span>
                  )}
                  {photo.titulo && photo.titulo.toLowerCase() !== 'foto' && (
                    <h3 className="font-extrabold text-white text-xs truncate">
                      {photo.titulo}
                    </h3>
                  )}
                  <div className="flex items-center justify-between mt-1 text-[9px] text-neutral-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" /> {photo.fecha}
                    </span>

                    {matchedMatch && (
                      <span className="text-rose-400 font-bold" title="Partido cargado">
                        vs {matchedMatch.rival} ({matchedMatch.golesPropios} - {matchedMatch.golesRival})
                      </span>
                    )}
                  </div>
                </div>

                {/* Trash delete selector - available with beautiful custom confirmation */}
                <button
                  onClick={(e) => handleDeleteClick(photo.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-950/80 hover:bg-rose-600 text-neutral-300 hover:text-white transition cursor-pointer z-10"
                  title="Remover de la galería"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox photo viewer overlay */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/95 flex flex-col justify-center items-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          {/* Single Close Button with X */}
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-250 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg cursor-pointer z-50"
            title="Cerrar Visualización"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navegación - Anterior */}
          {gallery.length > 1 && (
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-indigo-400 border border-neutral-800 transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer z-40 flex items-center justify-center"
              title="Imagen Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Navegación - Siguiente */}
          {gallery.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-indigo-400 border border-neutral-800 transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer z-40 flex items-center justify-center"
              title="Siguiente Imagen"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div 
            className="w-full max-w-4xl max-h-[70vh] flex flex-col items-center justify-center relative p-3 mt-8 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.imagenUrl}
              alt={activePhoto.titulo}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[70vh] object-contain rounded-xl border border-neutral-800 shadow-2xl"
            />
          </div>

          <div className="text-center space-y-3 mt-4 p-4 max-w-lg select-none" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2">
              {activePhoto.torneo && activePhoto.torneo.toLowerCase() !== 'general' && (
                <span className="text-[10px] uppercase font-bold bg-indigo-600 text-white px-3.5 py-0.5 rounded-full border border-indigo-400/20">
                  {activePhoto.torneo}
                </span>
              )}
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                {activePhoto.fecha}
              </span>
            </div>
            
            {activePhoto.titulo && activePhoto.titulo.toLowerCase() !== 'foto' && (
              <h2 className="text-lg font-black text-white leading-tight">{activePhoto.titulo}</h2>
            )}
            
            {activePhoto.partidoRelacionado && (
              <p className="text-xs text-rose-400 font-bold">
                Asociado: vs {matches.find(m => m.id === activePhoto.partidoRelacionado)?.rival}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {photoToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPhotoToDelete(null)}
        >
          <div 
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-black text-neutral-100 uppercase tracking-wider">¿Eliminar esta foto?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">¿Estás seguro de que deseas eliminar esta imagen de la galería definitivamente? Esta acción no se puede deshacer.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2 px-4 bg-neutral-800 text-neutral-200 hover:bg-neutral-750 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
