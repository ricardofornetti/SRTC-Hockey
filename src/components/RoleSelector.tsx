/**
 * Login exclusivamente vía Google Sign-In (Firebase Authentication).
 * NO agregar email/contraseña ni registro de cuentas: las cuentas autorizadas
 * se gestionan únicamente mediante la lista ADMIN_EMAILS (src/firebase.ts) y
 * el proveedor "Google" + los dominios autorizados configurados en
 * Firebase Console > Authentication.
 *
 * El dropdown y el modal se montan con un Portal de React directamente en
 * document.body para que nunca queden cortados por el sidebar u otros
 * contenedores con overflow/transform, sin importar desde qué parte del
 * layout se renderice este componente.
 */
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Shield, ChevronDown, LogIn, LogOut, X, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { auth, ADMIN_EMAILS } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface RoleSelectorProps {
  currentRole: UserRole;
  currentUserEmail: string;
  showToast: (title: string, body: string, type: 'success' | 'info' | 'error') => void;
}

export default function RoleSelector({ currentRole, currentUserEmail, showToast }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isLoggedAsAdmin = currentRole === 'admin';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const signedInEmail = result.user.email;

      if (!signedInEmail || !ADMIN_EMAILS.includes(signedInEmail.toLowerCase())) {
        await signOut(auth);
        setErrorMessage('Esta cuenta de Google no tiene permisos de administrador. Contactá al club si creés que es un error.');
        setIsLoading(false);
        return;
      }

      showToast('Sesión Iniciada', 'Has accedido exitosamente como Administrador.', 'success');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Google login error:', error);

      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        // El usuario cerró la ventana de Google: no es un error real, no mostramos nada.
      } else if (error?.code === 'auth/unauthorized-domain') {
        setErrorMessage('Este sitio no está autorizado para iniciar sesión todavía. Contactá al administrador del sistema.');
      } else if (error?.code === 'auth/popup-blocked') {
        setErrorMessage('El navegador bloqueó la ventana de Google. Habilitá las ventanas emergentes para este sitio e intentá de nuevo.');
      } else {
        setErrorMessage('Ocurrió un error al iniciar sesión. Por favor, intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Sesión Cerrada', 'Has salido del modo administrador.', 'info');
      setIsOpen(false);
    } catch (error) {
      showToast('Error', 'No se pudo cerrar la sesión.', 'error');
    }
  };

  // Posición del dropdown calculada en base al botón disparador, para que el
  // Portal (montado en document.body) lo ubique exactamente debajo del botón.
  const dropdownStyle = (() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return { top: 60, right: 16 };
    return {
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    };
  })();

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
            className="fixed z-[91] w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in duration-100"
            style={dropdownStyle}
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
                  <p className="font-mono text-neutral-200 text-xs truncate mt-0.5" title={currentUserEmail}>
                    {currentUserEmail}
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
              <div>
                <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                  Los simpatizantes tienen acceso de solo lectura. El personal del staff técnico debe iniciar sesión con su cuenta de Google autorizada para poder crear y modificar datos.
                </p>

                {errorMessage && (
                  <div className="p-2.5 mb-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-neutral-100 disabled:opacity-60 text-neutral-800 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-xs shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4" />
                  )}
                  {isLoading ? 'Conectando...' : 'Ingresar con Google'}
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
