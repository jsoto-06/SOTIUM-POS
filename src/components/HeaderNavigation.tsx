import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Employee } from '../types/pos';
import { GlobalSearchBar } from './navigation/GlobalSearchBar';
import {
  Sun,
  Moon,
  Clock,
  Key,
  Flame,
} from 'lucide-react';

export const HeaderNavigation: React.FC = () => {
  const { activeEmployee, employees, setActiveEmployee, activeCashSession } = usePOS();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [selectedPinEmp, setSelectedPinEmp] = useState<Employee | null>(null);
  const [pinError, setPinError] = useState<string>('');

  const handlePinSubmit = () => {
    if (selectedPinEmp && enteredPin === selectedPinEmp.pin) {
      setActiveEmployee(selectedPinEmp);
      setShowPinModal(false);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError('PIN incorrecto');
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 shrink-0 z-40">
      {/* Top Banner Status Bar with Global Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-2 bg-slate-950 text-xs border-b border-slate-800 gap-3">
        {/* Brand & System Badges */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-black tracking-wide text-amber-400 text-sm">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">SOTIUM POS</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400">VeriFactu OK</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 hidden sm:inline">Ley Antifraude</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <GlobalSearchBar className="w-full md:w-96" />

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-4 text-slate-300">
          <div className="hidden lg:flex items-center space-x-1 font-mono text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Turno: {activeCashSession.openedAt.substring(11, 16)}h</span>
          </div>

          <button
            onClick={() => setShowPinModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg transition-all border border-slate-700 shadow-sm"
            title="Cambiar usuario/PIN"
          >
            <img src={activeEmployee.photoUrl} alt={activeEmployee.name} className="w-5 h-5 rounded-full object-cover border border-amber-400" />
            <span className="font-semibold text-amber-300 text-xs">{activeEmployee.name}</span>
            <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
              {activeEmployee.role}
            </span>
          </button>

          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark');
              setIsDarkMode(!isDarkMode);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Cambiar Tema (Claro / Oscuro)"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Employee PIN Switcher Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-amber-400">
              <Key className="w-5 h-5" />
              <span>Cambio de Empleado (PIN)</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4">Seleccione su usuario e introduzca el código PIN:</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedPinEmp(emp)}
                  className={`flex items-center space-x-3 p-2.5 rounded-xl border text-left transition-all ${
                    selectedPinEmp?.id === emp.id
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <img src={emp.photoUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                  <div>
                    <div className="text-xs font-semibold">{emp.name}</div>
                    <div className="text-[10px] text-amber-400 font-mono">{emp.role}</div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPinEmp && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  PIN de {selectedPinEmp.name} (Demo PIN: {selectedPinEmp.pin})
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="****"
                  className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono text-center text-xl tracking-widest py-2 rounded-xl focus:outline-none focus:border-amber-500"
                />
                {pinError && <p className="text-xs text-red-400 font-semibold text-center">{pinError}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setEnteredPin('');
                  setPinError('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handlePinSubmit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
              >
                Acceder
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
