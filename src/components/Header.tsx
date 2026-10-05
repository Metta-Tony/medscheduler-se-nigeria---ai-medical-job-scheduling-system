import React from 'react';
import { Hospital, HospitalId } from '../types/medical';
import { HOSPITALS } from '../data/mockData';
import {
  Building2,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Users,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  selectedHospitalId: HospitalId;
  onSelectHospital: (id: HospitalId) => void;
  activeShiftsCount: number;
  activeIncidentsCount: number;
  highFatigueCount: number;
  isAiGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedHospitalId,
  onSelectHospital,
  activeShiftsCount,
  activeIncidentsCount,
  highFatigueCount,
  isAiGenerating,
}) => {
  const currentHospital = HOSPITALS.find((h) => h.id === selectedHospitalId) || HOSPITALS[0];

  // Current simulated date/time formatted in WAT (West Africa Time)
  const currentDateWAT = 'Monday, 5 Oct 2026';
  const currentTimeWAT = '09:30 WAT (GMT+1)';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Regional Crest & Hospital Selector Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <span className="text-xl font-black tracking-wider text-white">🇳🇬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  MedScheduler <span className="text-emerald-400 font-extrabold text-sm uppercase px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40">SE-Nigeria</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Federal & State Tertiary Hospital Clinical Workforce & Shift Optimization System
              </p>
            </div>
          </div>

          {/* Hospital Switcher & WAT Time */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <label htmlFor="hospital-select" className="sr-only">Select Hospital</label>
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <select
                  id="hospital-select"
                  value={selectedHospitalId}
                  onChange={(e) => onSelectHospital(e.target.value as HospitalId)}
                  className="bg-transparent font-medium text-white focus:outline-none cursor-pointer pr-4"
                >
                  {HOSPITALS.map((h) => (
                    <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                      {h.shortName} ({h.state} State)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/50 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTimeWAT}</span>
              <span className="text-slate-500">•</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDateWAT}</span>
            </div>
          </div>
        </div>

        {/* Hospital Sub-banner: CMD, CMAC, Specialty focus */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {currentHospital.name}
            </span>
            <span><strong className="text-slate-300">CMD:</strong> {currentHospital.cmdName}</span>
            <span><strong className="text-slate-300">CMAC:</strong> {currentHospital.cmacName}</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-emerald-300/90">{currentHospital.specialtyFocus}</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-300" title="Active shifts for current week">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeShiftsCount} Active Shifts</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
                highFatigueCount > 0 ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50' : 'text-slate-400'
              }`}
              title="Doctors or nurses exceeding safe fatigue threshold"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{highFatigueCount} Fatigue Warnings</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
                activeIncidentsCount > 0 ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 animate-pulse' : 'text-slate-400'
              }`}
              title="Active emergency disruptions requiring AI shift rebalancing"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{activeIncidentsCount} Code Red Alerts</span>
            </div>

            {isAiGenerating && (
              <span className="flex items-center gap-1 text-emerald-400 animate-pulse text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                AI Optimizing Roster...
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
