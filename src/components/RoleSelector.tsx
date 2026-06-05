/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, User, Users, ChevronDown, Check, LogIn, LogOut, Database, Wifi } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  currentUserEmail: string;
}

export default function RoleSelector({ currentRole, onChangeRole, currentUserEmail }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    {
      id: 'public' as UserRole,
      label: 'Usuario Público',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badgeColor: 'bg-emerald-500 text-white',
      desc: 'Acceso de solo lectura para familias, jugadoras y simpatizantes.',
    },
    {
      id: 'admin' as UserRole,
      label: 'Administrador Web',
      icon: Shield,
      color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badgeColor: 'bg-rose-600 text-white',
      desc: 'Control integral de partidos, jugadoras, noticias, configuración del club y bases de datos.',
    }
  ];

  const activeRoleConfig = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <div id="role-selector-container" className="bg-neutral-900/40 backdrop-blur-sm border-b border-neutral-850 text-xs text-neutral-300 select-none z-50 relative shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end items-center">
        <div className="relative">
          <button
            id="role-dropdown-trigger"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-850 hover:bg-neutral-800 text-[11px] text-neutral-250 border border-neutral-750 hover:border-neutral-700 transition duration-150 cursor-pointer font-bold shadow-sm"
          >
            <activeRoleConfig.icon className="w-3.5 h-3.5 text-neutral-450" />
            <span>{activeRoleConfig.label}</span>
            <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsOpen(false)} 
                />
                <div 
                  id="role-dropdown-menu" 
                  className="absolute right-0 mt-2 w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 p-3 flex flex-col gap-2 scale-100 origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="border-b border-neutral-800 pb-2 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-neutral-200">Control de Acceso</p>
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>FIREBASE ONLINE</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5" title={currentUserEmail}>
                      Sesión activa: <span className="font-mono text-neutral-300">{currentUserEmail}</span>
                    </p>
                  </div>

                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = currentRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onChangeRole(role.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition duration-200 cursor-pointer flex gap-2 items-start ${
                          isSelected 
                            ? 'bg-neutral-800/80 border border-neutral-700' 
                            : 'hover:bg-neutral-900 border border-transparent'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md mt-0.5 ${isSelected ? 'bg-neutral-700' : 'bg-neutral-800'}`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-100 text-xs">{role.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                            {role.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  <div className="bg-neutral-900 p-2 rounded-lg text-[10px] text-neutral-400 text-center">
                    Los permisos cambian instantáneamente en todas las secciones.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
}
