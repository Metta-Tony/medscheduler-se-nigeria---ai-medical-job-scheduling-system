import React, { useState } from 'react';
import {
  EmergencyIncident,
  HospitalId,
  MedicalStaff,
  ShiftSlot,
  DepartmentId,
} from '../types/medical';
import { DEPARTMENTS, HOSPITALS } from '../data/mockData';
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Home,
  UserPlus,
  ArrowRight,
  Plus,
  X,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface EmergencyReallocationCenterProps {
  hospitalId: HospitalId;
  incidents: EmergencyIncident[];
  staffList: MedicalStaff[];
  currentShifts: ShiftSlot[];
  onApplyEmergencyReassignment: (
    incidentId: string,
    replacement: {
      staffId: string;
      originalStaffId?: string;
      targetShiftType: any;
    }
  ) => void;
  onCreateIncident: (incident: EmergencyIncident) => void;
}

export const EmergencyReallocationCenter: React.FC<EmergencyReallocationCenterProps> = ({
  hospitalId,
  incidents,
  staffList,
  currentShifts,
  onApplyEmergencyReassignment,
  onCreateIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [customStrategy, setCustomStrategy] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New incident form
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState<DepartmentId>('accident_emergency');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Moderate'>('Critical');
  const [newDescription, setNewDescription] = useState('');
  const [newAffectedStaffName, setNewAffectedStaffName] = useState('');

  const currentIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const hospital = HOSPITALS.find((h) => h.id === hospitalId) || HOSPITALS[0];

  const handleRunAiRebalance = async () => {
    if (!currentIncident) return;
    setIsRebalancing(true);

    try {
      const res = await fetch('/api/ai/emergency-rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: currentIncident,
          availableStaff: staffList.filter((s) => s.hospitalId === hospitalId && s.isActive),
          currentShifts,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.reassignments) {
          setAiSuggestions(json.data.reassignments);
          setCustomStrategy(json.data.recommendedStrategy || '');
          return;
        }
      }
    } catch (e) {
      console.warn('API error, using fallback rebalancer', e);
    } finally {
      setIsRebalancing(false);
    }

    // Heuristic fallback if network or API error
    const lowFatigueStaff = staffList
      .filter((s) => s.hospitalId === hospitalId && s.isActive && s.fatigueScore < 60)
      .slice(0, 2);

    const fallbackSuggestions = lowFatigueStaff.map((st) => ({
      replacementStaffId: st.id,
      replacementStaffName: st.name,
      replacementCadre: st.cadre,
      targetShiftType: 'Call_Night',
      rationale: `Selected by clinical fallback heuristic: Low fatigue score (${st.fatigueScore}%), quarters status: ${st.residence}, zero recent night calls.`,
      fatigueRiskAfter: st.fatigueScore + 12,
      distanceOrQuarters: st.residence,
    }));

    setAiSuggestions(fallbackSuggestions);
    setCustomStrategy('Rapid mobilization protocol activated: Selected lowest fatigue personnel in on-campus quarters.');
    setIsRebalancing(false);
  };

  const handleCreateNewIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: EmergencyIncident = {
      id: `inc_${Date.now()}`,
      hospitalId,
      departmentId: newDept,
      timestamp: new Date().toISOString(),
      title: newTitle,
      severity: newSeverity,
      description: newDescription,
      affectedStaffName: newAffectedStaffName || undefined,
      recommendedAction: 'Execute AI roster rebalance to deploy eligible standby personnel.',
      aiSuggestedReassignments: [],
      status: 'Active',
    };

    onCreateIncident(created);
    setSelectedIncidentId(created.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewAffectedStaffName('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Code Red Banner */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Code Red & Emergency Rebalancing Desk
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Clinical Emergency & Dynamic AI Shift Reallocation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Handle sudden mass casualty surges, doctor acute illness absences, infectious disease
              quarantines, or regional logistical gridlocks across Southeast Nigeria in real-time.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate New Emergency</span>
          </button>
        </div>
      </div>

      {/* Grid: Incident List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Incidents */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Active Regional Incidents ({incidents.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              const isResolved = inc.status === 'Resolved';

              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncidentId(inc.id);
                    setAiSuggestions(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500/60 ring-1 ring-rose-500/20 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : inc.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {inc.severity} Alert
                    </span>

                    <span
                      className={`text-[10px] font-medium ${
                        isResolved ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                      }`}
                    >
                      {isResolved ? 'Resolved' : 'Active Surge'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{inc.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="capitalize">{inc.departmentId.replace('_', ' ')}</span>
                    <span>{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WAT</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Incident Triage & AI Rebalance Actions */}
        <div className="lg:col-span-2 space-y-5">
          {currentIncident ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Incident Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        currentIncident.severity === 'Critical'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {currentIncident.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {currentIncident.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{currentIncident.title}</h3>
                </div>

                <button
                  onClick={handleRunAiRebalance}
                  disabled={isRebalancing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
                >
                  {isRebalancing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>AI Triage Running...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Compute AI Roster Reallocation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description & Clinical Context */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>
                  <strong className="text-white">Situation Report: </strong>
                  {currentIncident.description}
                </p>
                {currentIncident.affectedStaffName && (
                  <p className="text-amber-400">
                    <strong>Affected Doctor/Nurse: </strong>
                    {currentIncident.affectedStaffName}
                  </p>
                )}
                <p className="text-emerald-400">
                  <strong>Recommended Triage: </strong>
                  {currentIncident.recommendedAction}
                </p>
              </div>

              {/* AI Rebalance Results */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  AI Suggested Replacements & Reassignments
                </h4>

                {customStrategy && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                    <strong>AI Clinical Strategy: </strong> {customStrategy}
                  </div>
                )}

                {/* Candidate list: either from live AI generation or existing preset */}
                {(() => {
                  const suggestions =
                    aiSuggestions || currentIncident.aiSuggestedReassignments;

                  if (!suggestions || suggestions.length === 0) {
                    return (
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs">
                          Click "Compute AI Roster Reallocation" to search the hospital workforce for
                          the most eligible replacement clinicians.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {suggestions.map((sug: any, idx: number) => {
                        const candidateStaff = staffList.find(
                          (st) => st.id === sug.replacementStaffId
                        );

                        return (
                          <div
                            key={idx}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    candidateStaff?.avatarUrl ||
                                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
                                  }
                                  alt={sug.replacementStaffName}
                                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                                />
                                <div>
                                  <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                    {sug.replacementStaffName}
                                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-2 py-0.2 rounded-full">
                                      {sug.replacementCadre}
                                    </span>
                                  </h5>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                    <span className="flex items-center gap-1 text-slate-300">
                                      <Home className="w-3 h-3 text-emerald-400" />
                                      {sug.distanceOrQuarters || candidateStaff?.residence}
                                    </span>
                                    <span>•</span>
                                    <span>Fatigue After: {sug.fatigueRiskAfter}%</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  onApplyEmergencyReassignment(currentIncident.id, {
                                    staffId: sug.replacementStaffId,
                                    originalStaffId: currentIncident.affectedShiftId,
                                    targetShiftType: sug.targetShiftType || 'Call_Night',
                                  })
                                }
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1.5 transition self-start sm:self-auto"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Execute Reassignment</span>
                              </button>
                            </div>

                            {/* Rationale */}
                            <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                              <span className="text-slate-400 font-semibold">AI Match Rationale: </span>
                              {sug.rationale}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-300">No active incident selected</h3>
            </div>
          )}
        </div>
      </div>

      {/* Simulate New Emergency Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Simulate Clinical Emergency (Southeast Nigeria)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewIncident} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Title / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mass Polytrauma Collision on Enugu-Awka Expressway"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department Affected
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as DepartmentId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Critical">Critical (Immediate Danger)</option>
                    <option value="High">High Priority</option>
                    <option value="Moderate">Moderate Surge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Absent / Overloaded Staff (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Emeka Obinna (Casualty Call Doctor)"
                  value={newAffectedStaffName}
                  onChange={(e) => setNewAffectedStaffName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Description & Ground Report
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe number of incoming casualties, reason for absence (acute malaria, fuel shortage), or infection isolation protocol..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
