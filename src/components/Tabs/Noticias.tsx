/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Newspaper, ChevronRight, Plus, Trash2, Calendar, User, Save, Link, Share2, Send } from 'lucide-react';
import { NewsItem, UserRole } from '../../types';

interface NoticiasProps {
  news: NewsItem[];
  userRole: UserRole;
  onUpdateNews: (updatedNews: NewsItem[]) => void;
  onShare: (title: string, text: string) => void;
}

export default function Noticias({ news, userRole, onUpdateNews, onShare }: NoticiasProps) {
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [autor, setAutor] = useState('Comisión de Hockey');
  const [esConvocatoria, setEsConvocatoria] = useState(false);

  const handleStartCreate = () => {
    setIsCreating(true);
    setActiveArticle(null);
    setTitulo('');
    setContenido('');
    setImagenUrl('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800');
    setAutor(userRole === 'admin' ? 'CD San Rafael Tenis Club' : 'Cuerpo Técnico');
    setEsConvocatoria(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    const newArticle: NewsItem = {
      id: 'news_' + Date.now(),
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      imagenUrl: imagenUrl.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
      fecha: new Date().toISOString().split('T')[0],
      autor: autor,
      esConvocatoria: esConvocatoria
    };

    const updated = [newArticle, ...news];
    onUpdateNews(updated);
    setIsCreating(false);
  };

  const handleDelete = (articleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('¿Es seguro que desea de eliminar esta publicación permanentemente?')) {
      const updated = news.filter(n => n.id !== articleId);
      onUpdateNews(updated);
      if (activeArticle && activeArticle.id === articleId) {
        setActiveArticle(null);
      }
    }
  };

  const handleShareArticle = (item: NewsItem, event: React.MouseEvent) => {
    event.stopPropagation();
    const shareText = `*${item.titulo}* 🏑\nPublicado por ${item.autor} el ${item.fecha}\n\n"${item.contenido.slice(0, 100)}..."\n\nLeé la nota completa en la nueva WebApp oficial del Club San Rafael Tenis Club Hockey!`;
    onShare(item.titulo, shareText);
  };

  return (
    <div id="noticias-tab" className="space-y-6 text-left">
      {/* Upper action bar */}
      <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow">
        <div>
          <h2 className="font-extrabold text-white text-sm flex items-center gap-1.5">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            Novedades y Comunicados
          </h2>
          <p className="text-[11px] text-neutral-400">Información oficial, noticias y convocatorias urgentes del club.</p>
        </div>

        {/* Create action */}
        {(userRole === 'admin') && (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Publicar Noticia
          </button>
        )}
      </div>

      {/* Grid: Form Editor, Large active view, or regular scroll stack */}
      {isCreating ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg max-w-xl mx-auto">
          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-4">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Publicar Articulo Oficial</span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-neutral-400 hover:text-white text-xs bg-neutral-850 px-2 py-0.5 rounded font-bold"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs text-neutral-300">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-450 mb-1">Título de la Publicación</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. ¡Triunfazo de la Séptima!"
                className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-450 mb-1">Autor de la Nota</label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-450 mb-1">Tipo de Nota</label>
                <select
                  value={esConvocatoria ? 'true' : 'false'}
                  onChange={(e) => setEsConvocatoria(e.target.value === 'true')}
                  className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg text-xs text-white"
                >
                  <option value="false">Noticia General / Resultado</option>
                  <option value="true">Comunicado / Convocatoria</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-450 mb-1">URL de la Imagen Ilustrativa (Unsplash)</label>
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="Copiar enlace de foto de hockey"
                className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2 text-[10px] text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-450 mb-1">Contenido de la Noticia</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escriba aquí los párrafos informativos de la publicación..."
                rows={6}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white font-sans leading-relaxed focus:outline-none"
                required
              />
            </div>

            <div className="pt-3 border-t border-neutral-850 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-500 font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Publicar Nota
              </button>
            </div>
          </form>
        </div>
      ) : activeArticle ? (
        /* Full article details layout */
        <div id="active-article-view" className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative h-64 sm:h-80 w-full">
            <img 
              src={activeArticle.imagenUrl} 
              alt={activeArticle.titulo} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
            
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 left-4 bg-neutral-950/85 hover:bg-neutral-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300 cursor-pointer"
            >
              ← Volver al listado
            </button>

            <div className="absolute bottom-4 left-5 right-5 text-left space-y-2">
              {activeArticle.esConvocatoria && (
                <span className="bg-indigo-600/90 text-white text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest border border-indigo-400/20">
                  ⚠️ COMUNICADO DE CONVOCATORIA
                </span>
              )}
              <h1 className="font-black text-white text-lg sm:text-2xl leading-tight tracking-tight">
                {activeArticle.titulo}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6 text-left">
            {/* Metadata bar */}
            <div className="flex items-center gap-4 text-xs text-neutral-400 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Fecha: <strong className="text-neutral-200">{activeArticle.fecha}</strong></span>
              </div>
              <span className="text-neutral-700">|</span>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>Autor: <strong className="text-neutral-200">{activeArticle.autor}</strong></span>
              </div>
            </div>

            {/* Paragraph body */}
            <p className="text-neutral-300 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {activeArticle.contenido}
            </p>

            {/* Social card buttons */}
            <div className="pt-4 border-t border-neutral-850 flex items-center justify-between">
              <button
                onClick={(e) => handleShareArticle(activeArticle, e)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 hover:bg-neutral-850 text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-400" /> Compartir Nota
              </button>

              <button
                onClick={() => setActiveArticle(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
              >
                Volver al Listado
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Regular timeline scroll stack of news */
        <div id="news-stack" className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col sm:flex-row shadow-lg cursor-pointer group"
            >
              {/* Thumbnail block image */}
              <div className="relative w-full sm:w-52 h-44 sm:h-auto shrink-0 overflow-hidden">
                <img 
                  src={item.imagenUrl} 
                  alt={item.titulo} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                />
                <div className="absolute top-2 left-2 bg-neutral-950/80 text-[9px] text-neutral-300 font-bold px-2 py-0.5 rounded-full border border-neutral-800">
                  {item.fecha}
                </div>
              </div>

              {/* Text content details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {item.esConvocatoria && (
                      <span className="bg-indigo-600/25 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">
                        CONVOCATORIA
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-400 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                    {item.contenido}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold border-t border-neutral-850/40 pt-2 flex-wrap gap-2">
                  <span className="uppercase">Por: {item.autor}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShareArticle(item, e)}
                      className="p-1 px-2.5 rounded bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white transition cursor-pointer"
                      title="Compartir Noticia"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        title="Eliminar Publicación"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      Leer artículo completo <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
