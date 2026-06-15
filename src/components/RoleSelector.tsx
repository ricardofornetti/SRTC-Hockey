/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Users, LogIn, LogOut, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  currentRole: UserRole;
  currentUserEmail: string | null;
  authLoading: boolean;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function RoleSelector({ currentRole, currentUserEmail, authLoading, onSignIn, onSignOut }: RoleSelectorProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentRole === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSignIn(email, password);
      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="role-selector-container" className="bg-neutral-950/60 backdrop-blur-sm border-b border-white/5 text-xs text-neutral-300 select-none z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end items-center gap-2">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrador</span>
              {currentUserEmail && (
                <span className="hidden sm:inline text-rose-200/70 font-mono text-[10px] ml-1 truncate max-w-[160px]" title={currentUserEmail}>
                  · {currentUserEmail}
                </span>
              )}
            </div>
            <button
              onClick={() => onSignOut()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-[11px] font-bold text-neutral-300 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Visitante</span>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-[11px] font-bold text-neutral-300 transition cursor-pointer"
              title="Acceso de Staff"
              disabled={authLoading}
            >
              {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Acceso Staff</span>
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {isLoginOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-[61] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute top-3 right-3 text-neutral-500 hover:text-white transition cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-white text-sm">Acceso de Staff</h3>
                </div>
                <p className="text-[11px] text-neutral-400 mb-4">
                  Ingresá con el email y contraseña del cuerpo técnico/administración para habilitar la edición.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                      placeholder="••••••••"
                    />
                  </div>

                  {error && (
                    <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-2.5 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-xs py-2 rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                    Iniciar sesión
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
