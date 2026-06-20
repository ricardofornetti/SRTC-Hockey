import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Shield, User, ChevronDown, Check, LogIn, LogOut, X, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { auth, ADMIN_EMAILS } from '../firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

interface RoleSelectorProps {
  currentRole: UserRole;
  currentUserEmail: string;
  showToast: (title: string, body: string, type: 'success' | 'info' | 'error') => void;
}

export default function RoleSelector({ currentRole, currentUserEmail, showToast }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  
  // Login input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const targetEmail = email.trim();

    // Safety check that the email is authorized before attempting auth
    if (!ADMIN_EMAILS.includes(targetEmail)) {
      setErrorMessage('Este correo electrónico no está autorizado para acceder como administrador.');
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, targetEmail, password);
        showToast('Cuenta Creada', 'Tu cuenta de Administrador ha sido registrada y has iniciado sesión.', 'success');
      } else {
        await signInWithEmailAndPassword(auth, targetEmail, password);
        showToast('Sesión Iniciada', 'Has accedido exitosamente como Administrador.', 'success');
      }
      setIsLoginModalOpen(false);
      setEmail('');
      setPassword('');
      setIsRegistering(false);
    } catch (error: any) {
      console.error('Login error:', error);
      // Clean and user-friendly Spanish error messages
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setErrorMessage('Correo electrónico o contraseña incorrectos. Por favor, intenta de nuevo o regístrate si es tu primera vez.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este correo ya está registrado. Por favor, selecciona "Iniciar Sesión" para ingresar.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('La contraseña es demasiado corta. Debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('La cuenta está temporalmente bloqueada debido a demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setErrorMessage('Ocurrió un error al procesar el acceso. Por favor, intenta de nuevo.');
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

  const isLoggedAsAdmin = currentRole === 'admin';

  return (
    <div id="role-selector-container" className="bg-neutral-900/60 backdrop-blur-md border-b border-neutral-800 text-xs text-neutral-350 select-none z-50 relative shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end items-center">
        <div className="relative">
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
                className="fixed inset-0 z-[60]" 
                onClick={() => setIsOpen(false)} 
              />
              <div 
                id="role-dropdown-menu" 
                className="fixed z-[61] w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 scale-100 origin-top-right transition-all animate-in fade-in duration-100"
                style={{
                  top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 8 : 60,
                  right: triggerRef.current ? window.innerWidth - triggerRef.current.getBoundingClientRect().right : 16,
                }}
              >
                <div className="border-b border-neutral-800 pb-2.5 mb-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutral-200 text-sm">Control de Acceso</p>
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AUTENTICADO</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
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
                        Los simpatizantes tienen acceso de solo lectura. El personal del staff técnico debe iniciar sesión para poder crear y modificar datos.
                      </p>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="w-full bg-neutral-500 hover:bg-neutral-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer text-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Acceso Staff (Iniciar Sesión)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-neutral-500" />
                <h3 className="text-base font-bold text-white">
                  {isRegistering ? 'Registro de Staff' : 'Inicio de Sesión — Staff'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setErrorMessage(null);
                  setIsRegistering(false);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Pestañas: Login vs Registro */}
            <div className="flex border-b border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-center font-bold border-b-2 transition ${
                  !isRegistering
                    ? 'border-neutral-200 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-center font-bold border-b-2 transition ${
                  isRegistering
                    ? 'border-neutral-200 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Crear / Registrar Cuenta
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium">Correo Electrónico (Registrado en Staff)</label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-medium font-sans">
                  {isRegistering ? 'Elige una Contraseña' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {isRegistering && (
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Nota: Al registrarte, un administrador de la plataforma ya debe haber habilitado tu correo en el sistema (por ejemplo: <strong className="text-indigo-300">fornettiricardo@gmail.com</strong>).
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-500 hover:bg-neutral-600 disabled:bg-neutral-700 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer mt-2 h-9 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRegistering ? 'Haciendo Registro...' : 'Iniciando sesión...'}</span>
                  </>
                ) : (
                  <span>{isRegistering ? 'Registrar y Acceder' : 'Iniciar Sesión'}</span>
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
