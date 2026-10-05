import React, { useState, useMemo, useEffect } from 'react';
import {
  HospitalId,
  MedicalStaff,
  ShiftSlot,
  EmergencyIncident,
  SwapRequest,
  AiOptimizationResult,
  DepartmentId,
} from './types/medical';
import {
  HOSPITALS,
  DEPARTMENTS,
  INITIAL_STAFF,
  INITIAL_SCHEDULE,
  INITIAL_EMERGENCY_INCIDENTS,
  INITIAL_SWAP_REQUESTS,
} from './data/mockData';
import { calculateFatigueScore } from './utils/schedulerEngine';
import { Header } from './components/Header';
import { NavigationTabs, NavTabId } from './components/NavigationTabs';
import { RosterMatrix } from './components/RosterMatrix';
import { AiSchedulerModal } from './components/AiSchedulerModal';
import { EmergencyReallocationCenter } from './components/EmergencyReallocationCenter';
import { FatigueRadar } from './components/FatigueRadar';
import { StaffRegistry } from './components/StaffRegistry';
import { ShiftSwapDesk } from './components/ShiftSwapDesk';
import { NaturalLanguageDispatcher } from './components/NaturalLanguageDispatcher';
import { RosterPrintModal } from './components/RosterPrintModal';
import { AboutProcedures } from './components/AboutProcedures';
import { CheckCircle2, AlertCircle, X, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<HospitalId>('unth_enugu');
  const [activeTab, setActiveTab] = useState<NavTabId>('roster');

  const [shifts, setShifts] = useState<ShiftSlot[]>(INITIAL_SCHEDULE);
  const [staffList, setStaffList] = useState<MedicalStaff[]>(INITIAL_STAFF);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(INITIAL_EMERGENCY_INCIDENTS);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(INITIAL_SWAP_REQUESTS);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'alert' | 'info';
  } | null>(null);

  // Show toast utility
  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Re-calculate live fatigue for staff when shifts change
  useEffect(() => {
    setStaffList((prev) =>
      prev.map((staff) => {
        const updatedScore = calculateFatigueScore(staff, shifts);
        return {
          ...staff,
          fatigueScore: updatedScore,
        };
      })
    );
  }, [shifts]);

  // Derived metrics for header
  const currentHospitalShifts = useMemo(
    () => shifts.filter((s) => s.hospitalId === selectedHospitalId),
    [shifts, selectedHospitalId]
  );

  const activeIncidents = useMemo(
    () => incidents.filter((i) => i.hospitalId === selectedHospitalId && i.status === 'Active'),
    [incidents, selectedHospitalId]
  );

  const highFatigueCount = useMemo(
    () =>
      staffList.filter(
        (s) => s.hospitalId === selectedHospitalId && s.isActive && s.fatigueScore >= 70
      ).length,
    [staffList, selectedHospitalId]
  );

  const pendingSwapsCount = useMemo(
    () => swapRequests.filter((sw) => sw.status === 'Pending_AI_Review').length,
    [swapRequests]
  );

  // Actions
  const handleUpdateShift = (updated: ShiftSlot) => {
    setShifts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Shift updated for ${updated.roleDescription}.`, 'info');
  };

  const handleAddShift = (newShift: ShiftSlot) => {
    setShifts((prev) => [newShift, ...prev]);
    showToast(`New shift scheduled for ${newShift.date}.`, 'success');
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    showToast('Shift removed from roster.', 'info');
  };

  const handleApplyNewSchedule = (result: AiOptimizationResult) => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setShifts((prev) => [
        ...prev.filter((s) => s.hospitalId !== selectedHospitalId),
        ...result.schedule,
      ]);
      setIsAiGenerating(false);
      setActiveTab('roster');
      showToast(
        `AI Roster applied successfully! ${result.schedule.length} clinical shifts synchronized.`,
        'success'
      );
    }, 400);
  };

  const handleApplyEmergencyReassignment = (
    incidentId: string,
    replacement: {
      staffId: string;
      originalStaffId?: string;
      targetShiftType: any;
    }
  ) => {
    const replacingStaff = staffList.find((s) => s.id === replacement.staffId);

    // If an existing shift is affected, swap it
    if (replacement.originalStaffId) {
      setShifts((prev) =>
        prev.map((s) => {
          if (s.id === replacement.originalStaffId) {
            return {
              ...s,
              staffId: replacement.staffId,
              status: 'Emergency_Reassigned',
              notes: `Emergency replacement executed: Reassigned to ${replacingStaff?.name}.`,
            };
          }
          return s;
        })
      );
    } else {
      // Create new emergency shift
      const emergencyShift: ShiftSlot = {
        id: `shift_emer_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        departmentId: 'accident_emergency',
        hospitalId: selectedHospitalId,
        shiftType: replacement.targetShiftType || 'Call_Night',
        startTime: '20:00',
        endTime: '08:00',
        staffId: replacement.staffId,
        roleDescription: `Emergency Rapid Deployment: ${replacingStaff?.cadre} On-Call Lead`,
        isAiGenerated: true,
        status: 'Emergency_Reassigned',
        notes: 'Mobilized via AI Code Red Rapid Dispatch Protocol.',
      };
      setShifts((prev) => [emergencyShift, ...prev]);
    }

    // Mark incident as resolved
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'Resolved' } : inc))
    );

    showToast(
      `Code Red Rebalance Executed: ${replacingStaff?.name} deployed for emergency duty.`,
      'success'
    );
  };

  const handleApproveSwap = (swapId: string) => {
    const swap = swapRequests.find((s) => s.id === swapId);
    if (!swap) return;

    // Swap the staffIds on the shifts
    setShifts((prev) =>
      prev.map((shift) => {
        if (shift.id === swap.requesterShiftId) {
          return { ...shift, staffId: swap.targetStaffId, status: 'Swapped' };
        }
        if (shift.id === swap.targetShiftId) {
          return { ...shift, staffId: swap.requesterStaffId, status: 'Swapped' };
        }
        return shift;
      })
    );

    setSwapRequests((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: 'AI_Approved' } : s))
    );

    showToast('Shift swap approved & executed! Live duty matrix updated.', 'success');
  };

  const handleRejectSwap = (swapId: string) => {
    setSwapRequests((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: 'AI_Rejected' } : s))
    );
    showToast('Shift swap request declined.', 'info');
  };

  const handleRelieveStaff = (staffId: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    // Find upcoming shift for this staff and substitute or convert to post-call rest
    const upcomingShift = shifts.find(
      (s) => s.staffId === staffId && (s.shiftType === 'Call_Night' || s.shiftType === 'Morning')
    );

    if (upcomingShift) {
      // Find a rested candidate with same cadre
      const restedCandidate = staffList.find(
        (s) =>
          s.hospitalId === selectedHospitalId &&
          s.id !== staffId &&
          s.cadre === staff.cadre &&
          s.fatigueScore < 45
      );

      if (restedCandidate) {
        setShifts((prev) =>
          prev.map((s) =>
            s.id === upcomingShift.id
              ? {
                  ...s,
                  staffId: restedCandidate.id,
                  notes: `AI Relief Action: Relieved ${staff.name} (fatigue: ${staff.fatigueScore}%) -> assigned ${restedCandidate.name}.`,
                }
              : s
          )
        );
        showToast(
          `AI Fatigue Relief: Replaced ${staff.name} with ${restedCandidate.name} to avoid burnout.`,
          'success'
        );
      } else {
        // Change shift to post call rest
        setShifts((prev) =>
          prev.map((s) =>
            s.id === upcomingShift.id
              ? {
                  ...s,
                  shiftType: 'Post_Call_Rest',
                  roleDescription: 'Mandatory Fatigue Decompression Rest',
                  notes: 'Granted emergency rest per NARD safety policy.',
                }
              : s
          )
        );
        showToast(
          `Mandatory fatigue rest granted to ${staff.name}. Scheduled duty cleared.`,
          'info'
        );
      }
    } else {
      showToast(`No high-intensity shift found for ${staff.name}. Staff is currently resting.`, 'info');
    }
  };

  const handleExecuteCommand = (commandResult: any) => {
    showToast(`AI Command Executed: ${commandResult.summary}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        selectedHospitalId={selectedHospitalId}
        onSelectHospital={setSelectedHospitalId}
        activeShiftsCount={currentHospitalShifts.length}
        activeIncidentsCount={activeIncidents.length}
        highFatigueCount={highFatigueCount}
        isAiGenerating={isAiGenerating}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        emergencyCount={activeIncidents.length}
        fatigueCount={highFatigueCount}
        pendingSwapsCount={pendingSwapsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'roster' && (
          <RosterMatrix
            hospitalId={selectedHospitalId}
            shifts={shifts}
            staffList={staffList}
            onUpdateShift={handleUpdateShift}
            onAddShift={handleAddShift}
            onDeleteShift={handleDeleteShift}
            onRequestSwap={(shift) => {
              setActiveTab('swaps');
            }}
            onTriggerEmergencyForShift={(shift) => {
              setActiveTab('emergency');
            }}
          />
        )}

        {activeTab === 'generator' && (
          <AiSchedulerModal
            hospitalId={selectedHospitalId}
            staffList={staffList}
            currentShifts={shifts}
            onApplyNewSchedule={handleApplyNewSchedule}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyReallocationCenter
            hospitalId={selectedHospitalId}
            incidents={incidents}
            staffList={staffList}
            currentShifts={shifts}
            onApplyEmergencyReassignment={handleApplyEmergencyReassignment}
            onCreateIncident={(newInc) => {
              setIncidents((prev) => [newInc, ...prev]);
              showToast(`Emergency incident registered: ${newInc.title}`, 'alert');
            }}
          />
        )}

        {activeTab === 'fatigue' && (
          <FatigueRadar
            hospitalId={selectedHospitalId}
            staffList={staffList}
            shifts={shifts}
            onRelieveStaff={handleRelieveStaff}
          />
        )}

        {activeTab === 'staff' && (
          <StaffRegistry
            hospitalId={selectedHospitalId}
            staffList={staffList}
            onAddStaff={(newSt) => {
              setStaffList((prev) => [newSt, ...prev]);
              showToast(`Registered ${newSt.name} (${newSt.cadre}).`, 'success');
            }}
          />
        )}

        {activeTab === 'swaps' && (
          <ShiftSwapDesk
            hospitalId={selectedHospitalId}
            swapRequests={swapRequests}
            staffList={staffList}
            shifts={shifts}
            onApproveSwap={handleApproveSwap}
            onRejectSwap={handleRejectSwap}
            onCreateSwapRequest={(newSw) => {
              setSwapRequests((prev) => [newSw, ...prev]);
              showToast('Shift swap request submitted for AI review.', 'info');
            }}
          />
        )}

        {activeTab === 'dispatcher' && (
          <NaturalLanguageDispatcher
            hospitalId={selectedHospitalId}
            staffList={staffList}
            shifts={shifts}
            onExecuteCommand={handleExecuteCommand}
          />
        )}

        {activeTab === 'audit' && (
          <RosterPrintModal
            hospitalId={selectedHospitalId}
            shifts={shifts}
            staffList={staffList}
          />
        )}

        {activeTab === 'about' && (
          <AboutProcedures
            selectedHospitalId={selectedHospitalId}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : toastMessage.type === 'alert'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                : 'bg-slate-900/90 text-blue-200 border-blue-500/50'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}

            <span>{toastMessage.text}</span>

            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p>
              MedScheduler SE-Nigeria • Computerized Medical Job Scheduling System (AI Optimized)
            </p>
            <button
              onClick={() => setActiveTab('about')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Step-by-Step SOP</span>
            </button>
          </div>
          <p className="flex items-center gap-2">
            <span>Enugu • Anambra • Abia • Ebonyi • Imo</span>
            <span>•</span>
            <span className="text-emerald-400">MDCAN & NARD Compliant</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
