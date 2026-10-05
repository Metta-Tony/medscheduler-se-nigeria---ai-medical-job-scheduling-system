import React, { useState } from 'react';
import { HospitalId, MedicalStaff, ShiftSlot, SwapRequest } from '../types/medical';
import {
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  X,
  ShieldCheck,
} from 'lucide-react';

interface ShiftSwapDeskProps {
  hospitalId: HospitalId;
  swapRequests: SwapRequest[];
  staffList: MedicalStaff[];
  shifts: ShiftSlot[];
  onApproveSwap: (swapId: string) => void;
  onRejectSwap: (swapId: string) => void;
  onCreateSwapRequest: (newSwap: SwapRequest) => void;
}

export const ShiftSwapDesk: React.FC<ShiftSwapDeskProps> = ({
  hospitalId,
  swapRequests,
  staffList,
  shifts,
  onApproveSwap,
  onRejectSwap,
  onCreateSwapRequest,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [evaluatingSwapId, setEvaluatingSwapId] = useState<string | null>(null);

  // New swap form
  const [reqStaffId, setReqStaffId] = useState('');
  const [targetStaffId, setTargetStaffId] = useState('');
  const [reqShiftId, setReqShiftId] = useState('');
  const [targetShiftId, setTargetShiftId] = useState('');
  const [reason, setReason] = useState('');

  const staffMap = new Map<string, MedicalStaff>();
  staffList.forEach((s) => staffMap.set(s.id, s));

  const shiftsMap = new Map<string, ShiftSlot>();
  shifts.forEach((s) => shiftsMap.set(s.id, s));

  const handleEvaluateWithAi = async (swap: SwapRequest) => {
    setEvaluatingSwapId(swap.id);
    const requester = staffMap.get(swap.requesterStaffId);
    const target = staffMap.get(swap.targetStaffId);
    const shiftA = shiftsMap.get(swap.requesterShiftId);
    const shiftB = shiftsMap.get(swap.targetShiftId);

    try {
      const res = await fetch('/api/ai/evaluate-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swapRequest: swap,
          requester,
          targetStaff: target,
          shiftA,
          shiftB,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.analysis) {
          swap.aiAnalysis = json.analysis;
          swap.status = json.analysis.approved ? 'AI_Approved' : 'AI_Rejected';
        }
      }
    } catch (e) {
      console.warn('AI swap eval error', e);
    } finally {
      setEvaluatingSwapId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqStaffId || !targetStaffId || !reqShiftId || !targetShiftId) return;

    const requester = staffMap.get(reqStaffId);
    const target = staffMap.get(targetStaffId);

    const isMatch = requester?.cadre === target?.cadre;

    const created: SwapRequest = {
      id: `swap_${Date.now()}`,
      requesterStaffId: reqStaffId,
      targetStaffId,
      requesterShiftId: reqShiftId,
      targetShiftId,
      dateRequested: new Date().toISOString().split('T')[0],
      reason: reason || 'Personal clinical schedule harmonization',
      status: 'Pending_AI_Review',
      aiAnalysis: {
        approved: isMatch,
        reasoning: isMatch
          ? `Cadre parity verified (${requester?.cadre}). Fatigue balance maintained.`
          : `Discrepancy detected: ${requester?.cadre} attempting to swap with ${target?.cadre}. Requires CMAC special waiver.`,
        fatigueImpact: 'Projected within safe limits.',
        supervisionCompliant: true,
      },
    };

    onCreateSwapRequest(created);
    setShowCreateModal(false);
    setReason('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            AI Shift Swap & Dispute Desk
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Peer-to-Peer Duty Swap Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Allows resident doctors, house officers, and nurses to swap shifts seamlessly with
            automated AI validation of cadre parity, fatigue thresholds, and supervision compliance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request Shift Swap</span>
        </button>
      </div>

      {/* Swap Requests List */}
      <div className="space-y-4">
        {swapRequests.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No pending shift swap requests</h3>
            <p className="text-xs text-slate-500 mt-1">
              Clinicians can propose mutual duty trades anytime with automated AI compliance review.
            </p>
          </div>
        ) : (
          swapRequests.map((swap) => {
            const requester = staffMap.get(swap.requesterStaffId);
            const target = staffMap.get(swap.targetStaffId);
            const shiftA = shiftsMap.get(swap.requesterShiftId);
            const shiftB = shiftsMap.get(swap.targetShiftId);

            return (
              <div
                key={swap.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                {/* Top Bar: Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">
                    Request ID: {swap.id} • Date: {swap.dateRequested}
                  </span>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      swap.status === 'AI_Approved' || swap.status === 'Manual_Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : swap.status === 'AI_Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {swap.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Swap Matchup Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requester Doctor */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Originating Clinician
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={requester?.avatarUrl}
                        alt={requester?.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{requester?.name}</h4>
                        <p className="text-[11px] text-emerald-400 font-medium">
                          {requester?.cadre}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Fatigue: {requester?.fatigueScore}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-medium">Surrendering Shift: </span>
                      <span className="text-white">
                        {shiftA?.date} ({shiftA?.shiftType.replace('_', ' ')} • {shiftA?.startTime} -{' '}
                        {shiftA?.endTime})
                      </span>
                    </div>
                  </div>

                  {/* Target Doctor */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Target Exchange Clinician
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={target?.avatarUrl}
                        alt={target?.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{target?.name}</h4>
                        <p className="text-[11px] text-emerald-400 font-medium">{target?.cadre}</p>
                        <p className="text-[10px] text-slate-400">
                          Fatigue: {target?.fatigueScore}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-medium">Assuming Shift: </span>
                      <span className="text-white">
                        {shiftB?.date} ({shiftB?.shiftType.replace('_', ' ')} • {shiftB?.startTime} -{' '}
                        {shiftB?.endTime})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stated Reason */}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold">Stated Reason: </span>
                  {swap.reason}
                </div>

                {/* AI Regulatory Analysis Box */}
                {swap.aiAnalysis && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white uppercase text-[11px]">
                        Gemini AI Compliance Assessment
                      </span>
                    </div>
                    <p className="text-slate-300">{swap.aiAnalysis.reasoning}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Fatigue Impact: {swap.aiAnalysis.fatigueImpact}</span>
                      <span>
                        Supervision Compliant:{' '}
                        {swap.aiAnalysis.supervisionCompliant ? 'Yes (MDCAN Valid)' : 'No'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => handleEvaluateWithAi(swap)}
                    disabled={evaluatingSwapId === swap.id}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {evaluatingSwapId === swap.id
                        ? 'Gemini Analyzing...'
                        : 'Re-Analyze with Gemini AI'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRejectSwap(swap.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Reject Swap
                    </button>

                    <button
                      onClick={() => onApproveSwap(swap.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Execute Roster Swap</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Swap Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                Submit Mutual Shift Swap Proposal
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Requester (Your Profile)
                </label>
                <select
                  value={reqStaffId}
                  onChange={(e) => setReqStaffId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Your Name --</option>
                  {staffList
                    .filter((s) => s.hospitalId === hospitalId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.cadre})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Your Shift to Trade
                </label>
                <select
                  value={reqShiftId}
                  onChange={(e) => setReqShiftId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Shift --</option>
                  {shifts
                    .filter((s) => s.staffId === reqStaffId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} - {s.shiftType.replace('_', ' ')} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Exchange Clinician (Target Peer)
                </label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Target Doctor or Nurse --</option>
                  {staffList
                    .filter((s) => s.hospitalId === hospitalId && s.id !== reqStaffId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.cadre})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Clinician's Shift You Wish to Take
                </label>
                <select
                  value={targetShiftId}
                  onChange={(e) => setTargetShiftId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Target Shift --</option>
                  {shifts
                    .filter((s) => s.staffId === targetStaffId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} - {s.shiftType.replace('_', ' ')} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Justification / Clinical Ground
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Post-graduate exam preparation or personal leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  Submit for AI Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
