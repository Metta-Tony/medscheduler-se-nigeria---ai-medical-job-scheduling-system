import React from 'react';
import { HospitalId, MedicalStaff, ShiftSlot } from '../types/medical';
import {
  Gauge,
  AlertTriangle,
  HeartCrack,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Zap,
} from 'lucide-react';

interface FatigueRadarProps {
  hospitalId: HospitalId;
  staffList: MedicalStaff[];
  shifts: ShiftSlot[];
  onRelieveStaff: (staffId: string) => void;
}

export const FatigueRadar: React.FC<FatigueRadarProps> = ({
  hospitalId,
  staffList,
  shifts,
  onRelieveStaff,
}) => {
  const hospitalStaff = staffList.filter((s) => s.hospitalId === hospitalId && s.isActive);

  // Group by fatigue severity
  const highRisk = hospitalStaff.filter((s) => s.fatigueScore >= 70);
  const moderateRisk = hospitalStaff.filter((s) => s.fatigueScore >= 40 && s.fatigueScore < 70);
  const safeStaff = hospitalStaff.filter((s) => s.fatigueScore < 40);

  const avgFatigue =
    hospitalStaff.length > 0
      ? Math.round(hospitalStaff.reduce((acc, s) => acc + s.fatigueScore, 0) / hospitalStaff.length)
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Clinical Fatigue & Burnout Telemetry Radar
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Workforce Exhaustion Monitoring & Intraoperative Risk Prevention
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Prevents fatal medical and surgical errors by continuously assessing continuous call duty
              hours, consecutive night duties, and post-call rest compliance in line with MDCAN &
              NARD safety mandates.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Hospital Average Fatigue
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                className={`text-2xl font-black ${
                  avgFatigue > 60
                    ? 'text-rose-400'
                    : avgFatigue > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {avgFatigue}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {avgFatigue > 60 ? 'HIGH RISK' : avgFatigue > 40 ? 'MODERATE' : 'OPTIMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">
              Critical Burnout Risk (&gt;70%)
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{highRisk.length} Doctors/Nurses</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">High probability of clinical error</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
              Approaching Threshold (40-69%)
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{moderateRisk.length} Clinicians</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Monitor next call allocation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
              Rest & Safe Fleet (&lt;40%)
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{safeStaff.length} Clinicians</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Available for standby or emergency</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Staff Telemetry Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Active Clinical Personnel Telemetry
          </h3>
          <span className="text-xs text-slate-400">
            Total active roster: {hospitalStaff.length} personnel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Clinician</th>
                <th className="py-3 px-4">Cadre & Dept</th>
                <th className="py-3 px-4">Weekly Logged</th>
                <th className="py-3 px-4">Consecutive Nights</th>
                <th className="py-3 px-4">Fatigue Index</th>
                <th className="py-3 px-4 text-right">Relief Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hospitalStaff.map((staff) => {
                const isCritical = staff.fatigueScore >= 70;
                const isModerate = staff.fatigueScore >= 40 && staff.fatigueScore < 70;

                return (
                  <tr key={staff.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.avatarUrl}
                          alt={staff.name}
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {staff.name}
                            {isCritical && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{staff.residence}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-emerald-400 block">{staff.cadre}</span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {staff.departmentId.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-white">
                        {staff.currentWeeklyHours} / {staff.weeklyMaxHours} hrs
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            staff.currentWeeklyHours > 48 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (staff.currentWeeklyHours / staff.weeklyMaxHours) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {staff.consecutiveCallNights > 1 ? (
                        <span className="text-rose-400 font-bold">
                          {staff.consecutiveCallNights} Nights (Violation)
                        </span>
                      ) : (
                        <span className="text-slate-300">{staff.consecutiveCallNights} Night</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical
                                ? 'bg-rose-500'
                                : isModerate
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${staff.fatigueScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            isCritical
                              ? 'text-rose-400'
                              : isModerate
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {staff.fatigueScore}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isCritical ? (
                        <button
                          onClick={() => onRelieveStaff(staff.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-2.5 py-1.5 rounded-lg shadow text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3 h-3 text-rose-200" />
                          <span>AI Relief Swap</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
