/**
 * Login mediante contraseña local con sincronización y fallback Firebase Auth.
 */
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Shield, ChevronDown, LogIn, LogOut, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { auth, ADMIN_EMAILS } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface RoleSelectorProps {
  currentRole: UserRole;
  currentUserEmail: string;
  showToast: (title: string, body: string, type: 'success' | 'info' | 'error') => void;
}

const DROPDOWN_WIDTH = 288; // w-72
const VIEWPORT_MARGIN = 12;

export default function RoleSelector({ currentRole, currentUserEmail, showToast }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isLoggedAsAdmin = currentRole === 'admin';

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setErrorMessage(null);

    // 1. Validar la clave localmente tal como solicitó el usuario
    if (password !== 'sanrafaeltenisclub2026') {
      setErrorMessage('Contraseña incorrecta. Por favor, intentá de nuevo.');
      setIsLoading(false);
      return;
    }

    // Guardar admin localmente de forma persistente para evitar bloqueos
    localStorage.setItem('srtc_local_admin', 'true');
    window.dispatchEvent(new Event('srtc_auth_changed'));

    // 2. Intentar autenticar con Firebase usando el email administrativo predefinido
    try {
      const email = 'fornettiricardo@gmail.com';
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        console.warn('SignIn failed, trying to register the email...', signInError);
        // Si el usuario no existe en Firebase Auth, lo registramos automáticamente para que pueda sincronizar
        if (
          signInError?.code === 'auth/user-not-found' || 
          signInError?.code === 'auth/invalid-credential' ||
          signInError?.code === 'auth/wrong-password'
        ) {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (createError: any) {
            console.error('Registration failed:', createError);
          }
        }
      }
      
      showToast('Sesión Iniciada', 'Has accedido exitosamente como Administrador.', 'success');
      setPassword('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Firebase Auth error, entering as offline admin:', error);
      showToast('Sesión Iniciada', 'Has accedido como Administrador local.', 'success');
      setPassword('');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('srtc_local_admin');
      window.dispatchEvent(new Event('srtc_auth_changed'));
      await signOut(auth);
      showToast('Sesión Cerrada', 'Has salido del modo administrador.', 'info');
      setIsOpen(false);
    } catch (error) {
      showToast('Error', 'No se pudo cerrar la sesión.', 'error');
    }
  };

  const getDropdownStyle = (): React.CSSProperties => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return { top: 60, left: 16 };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right - DROPDOWN_WIDTH;
    if (left < VIEWPORT_MARGIN) {
      left = Math.min(rect.left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN);
    }
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN));

    const estimatedHeight = 260;
    let top = rect.bottom + 8;
    if (top + estimatedHeight > viewportHeight - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, rect.top - estimatedHeight - 8);
    }

    return { top, left, width: DROPDOWN_WIDTH };
  };

  return (
    <div id="role-selector-container" className="text-xs text-neutral-350 select-none">
      <button
        ref={triggerRef}
        id="role-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-[11px] text-neutral-200 border border-neutral-750 hover:border-neutral-700 transition duration-150 cursor-pointer font-bold shadow-sm"
      >
        <Shield className={`w-3.5 h-3.5 ${isLoggedAsAdmin ? 'text-amber-500' : 'text-neutral-400'}`} />
        <span>Perfil: {isLoggedAsAdmin ? 'Administrador' : 'Visitante'}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="role-dropdown-menu"
            className="fixed z-[91] bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in duration-100"
            style={getDropdownStyle()}
          >
            <div className="border-b border-neutral-800 pb-2.5 mb-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-neutral-200 text-sm">Control de Acceso</p>
                {isLoggedAsAdmin && (
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AUTENTICADO</span>
                  </div>
                )}
              </div>
            </div>

            {isLoggedAsAdmin ? (
              <div>
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 mb-3">
                  <p className="text-[10px] text-neutral-400">Administrador activo:</p>
                  <p className="font-mono text-neutral-200 text-xs truncate mt-0.5" title={currentUserEmail || 'fornettiricardo@gmail.com'}>
                    {currentUserEmail || 'fornettiricardo@gmail.com'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión (Salir)
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Para ingresar cambios en el fixture, plantel y estadísticas, introducí la clave de administración.
                </p>

                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Clave del club"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-150 text-xs focus:outline-none focus:border-amber-500/50 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-xs shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  {isLoading ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>
            )}
          </div>
        </>
      ,
        document.body
      )}
    </div>
  );
}
