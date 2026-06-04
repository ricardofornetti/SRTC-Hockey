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
      if (data && data.length > 0) setStandings(data);
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
    { id: 'galeria', label: 'Fotos', icon: ImageIcon },
  ];

  return (
    <div id="app-root-container" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 1. Control de Rol / Simulación de Entorno */}
      <RoleSelector 
        currentRole={userRole} 
        onChangeRole={handleRoleChange} 
        currentUserEmail="fornettiricardo@gmail.com" 
      />

      {/* 2. Header de la Aplicación */}
      <header id="main-header" className="bg-neutral-900 border-b border-neutral-850 px-5 py-5 md:py-6 shadow-xl relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Logo y Nombre del Club */}
          <div className="flex items-center gap-4.5 select-none cursor-pointer group" onClick={() => setActiveTab('inicio')}>
            {/* Highly prominent and glowing official club logo card */}
            <div className="w-16 h-16 shrink-0 p-1.5 bg-gradient-to-tr from-neutral-900 to-neutral-800 border-2 border-neutral-750 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:border-indigo-400/60 transition-all duration-300 hover:scale-105">
              <SrtcLogo className="w-13 h-13" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-sports-condensed font-black text-white tracking-widest uppercase group-hover:text-indigo-400 transition-colors duration-300">
                  SAN RAFAEL TENIS CLUB
                </h1>
                <span className="self-start sm:self-auto text-[10px] bg-indigo-400/15 text-indigo-400 border border-indigo-400/25 font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-sports-condensed shadow-inner">
                  HOCKEY CLUB
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-bold leading-normal mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-glow shadow-indigo-400/55"></span>
                <span className="font-sports-condensed uppercase tracking-wider text-[11px]">Sitio Oficial de Hockey • Mendoza</span>
              </p>
            </div>
          </div>

          {/* Persistent Category Switcher in Header for High Visibility */}
          <div className="flex flex-col items-center md:items-end gap-1 px-2 py-1.5 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider font-sports-condensed">
              Categoría / División Activa
            </span>
            <div className="flex flex-wrap items-center gap-0.5 bg-neutral-950 p-0.5 rounded-lg border border-neutral-850">
              {(['7ma', '6ta', '5ta', 'Intermedia', 'Primera'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer font-sports-condensed ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* 3. Navigation Bar (Desktop Sticky top sub-header) */}
      <nav id="desktop-tab-navigation" className="hidden lg:block bg-neutral-900 border-b border-zinc-900 sticky top-[33px] z-30 select-none backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center gap-2">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-neutral-850 text-white border-neutral-750 shadow-sm'
                    : 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. Main Tab View Area */}
      <main id="app-viewport" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 mb-24 lg:mb-12">
        {renderTabContent()}
      </main>

      {/* 5. Mobile Tab Bar (Bottom bar sticky) */}
      <footer id="mobile-tab-navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-2 flex items-center justify-around z-45 shadow-2xl">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-150 cursor-pointer ${
                isActive ? 'text-indigo-400 shrink-0' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] font-black tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </footer>

      {/* 6. Dynamic Toast Banner Panel */}
      {toast && (
        <div 
          id="toast-notification-panel" 
          className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:w-96 bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-2xl flex gap-3 items-start animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 transform"
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
