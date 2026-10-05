import React, { useState, useMemo } from 'react';
import {
  DepartmentId,
  HospitalId,
  MedicalCadre,
  MedicalStaff,
  ShiftSlot,
  ShiftType,
} from '../types/medical';
import { DEPARTMENTS, CURRENT_WEEK_DATES } from '../data/mockData';
import {
  Calendar,
  Filter,
  Search,
  Clock,
  Sparkles,
  Home,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  UserCheck,
  Shield,
  Plus,
  X,
  Stethoscope,
  Scissors,
  Activity,
  HeartPulse,
  Baby,
  Users,
} from 'lucide-react';

interface RosterMatrixProps {
  hospitalId: HospitalId;
  shifts: ShiftSlot[];
  staffList: MedicalStaff[];
  onUpdateShift: (updatedShift: ShiftSlot) => void;
  onAddShift: (newShift: ShiftSlot) => void;
  onDeleteShift: (shiftId: string) => void;
  onRequestSwap: (shift: ShiftSlot) => void;
  onTriggerEmergencyForShift: (shift: ShiftSlot) => void;
}

export const RosterMatrix: React.FC<RosterMatrixProps> = ({
  hospitalId,
  shifts,
  staffList,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  onRequestSwap,
  onTriggerEmergencyForShift,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingShift, setEditingShift] = useState<ShiftSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New shift form state
  const [newShiftDate, setNewShiftDate] = useState(CURRENT_WEEK_DATES[0]);
  const [newShiftDept, setNewShiftDept] = useState<DepartmentId>('accident_emergency');
  const [newShiftType, setNewShiftType] = useState<ShiftType>('Morning');
  const [newShiftStaffId, setNewShiftStaffId] = useState('');
  const [newShiftRole, setNewShiftRole] = useState('');

  // Map staff by ID
  const staffMap = useMemo(() => {
    const map = new Map<string, MedicalStaff>();
    staffList.forEach((s) => map.set(s.id, s));
    return map;
  }, [staffList]);

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (s.hospitalId !== hospitalId) return false;
      if (selectedDept !== 'all' && s.departmentId !== selectedDept) return false;
      if (selectedDate !== 'all' && s.date !== selectedDate) return false;
      if (selectedShiftType !== 'all' && s.shiftType !== selectedShiftType) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const staff = staffMap.get(s.staffId);
        const staffName = staff?.name.toLowerCase() || '';
        const cadre = staff?.cadre.toLowerCase() || '';
        const role = s.roleDescription.toLowerCase();
        if (!staffName.includes(query) && !cadre.includes(query) && !role.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [shifts, hospitalId, selectedDept, selectedDate, selectedShiftType, searchQuery, staffMap]);

  // Group shifts by date, then department
  const groupedShifts = useMemo(() => {
    const datesToGroup = selectedDate !== 'all' ? [selectedDate] : CURRENT_WEEK_DATES;
    const groups: { date: string; depts: { deptId: DepartmentId; shifts: ShiftSlot[] }[] }[] = [];

    datesToGroup.forEach((d) => {
      const deptsArray: { deptId: DepartmentId; shifts: ShiftSlot[] }[] = [];
      const deptsToList = selectedDept !== 'all' ? [selectedDept] : DEPARTMENTS.map((dep) => dep.id);

      deptsToList.forEach((depId) => {
        const matching = filteredShifts.filter((s) => s.date === d && s.departmentId === depId);
        if (matching.length > 0) {
          deptsArray.push({ deptId: depId, shifts: matching });
        }
      });

      if (deptsArray.length > 0) {
        groups.push({ date: d, depts: deptsArray });
      }
    });

    return groups;
  }, [filteredShifts, selectedDate, selectedDept]);

  const getShiftBadgeStyle = (type: ShiftType) => {
    switch (type) {
      case 'Morning':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Afternoon':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Call_Night':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/20';
      case 'Standby':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Post_Call_Rest':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Off_Duty':
      case 'Annual_Leave':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getDeptIcon = (id: DepartmentId) => {
    switch (id) {
      case 'accident_emergency':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'obstetrics_gynaecology':
        return <HeartPulse className="w-4 h-4 text-pink-400" />;
      case 'surgical_theater':
        return <Scissors className="w-4 h-4 text-indigo-400" />;
      case 'internal_medicine_icu':
        return <Stethoscope className="w-4 h-4 text-cyan-400" />;
      case 'paediatrics_cher':
        return <Baby className="w-4 h-4 text-amber-400" />;
      case 'general_outpatient':
        return <Users className="w-4 h-4 text-emerald-400" />;
      default:
        return <Stethoscope className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftStaffId) return;

    const staff = staffMap.get(newShiftStaffId);
    const times = {
      Morning: { start: '08:00', end: '14:00' },
      Afternoon: { start: '14:00', end: '20:00' },
      Call_Night: { start: '20:00', end: '08:00' },
      Standby: { start: '00:00', end: '23:59' },
      Post_Call_Rest: { start: '08:00', end: '20:00' },
      Off_Duty: { start: '00:00', end: '23:59' },
      Annual_Leave: { start: '00:00', end: '23:59' },
    }[newShiftType];

    const created: ShiftSlot = {
      id: `shift_${Date.now()}`,
      date: newShiftDate,
      departmentId: newShiftDept,
      hospitalId,
      shiftType: newShiftType,
      startTime: times.start,
      endTime: times.end,
      staffId: newShiftStaffId,
      roleDescription:
        newShiftRole || `${staff?.cadre} shift coverage in ${newShiftDept.replace('_', ' ')}`,
      isAiGenerated: false,
      status: 'Scheduled',
    };

    onAddShift(created);
    setShowAddModal(false);
    setNewShiftRole('');
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clinician by name, cadre (Consultant, Senior Reg...), or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Department */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Clinical Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900">
                    {d.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Full Week (Oct 5 - 11)</option>
                {CURRENT_WEEK_DATES.map((d) => {
                  const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <option key={d} value={d} className="bg-slate-900">
                      {dayName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Shift Type filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedShiftType}
                onChange={(e) => setSelectedShiftType(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Shift Slots</option>
                <option value="Morning" className="bg-slate-900">Morning (08:00 - 14:00)</option>
                <option value="Afternoon" className="bg-slate-900">Afternoon (14:00 - 20:00)</option>
                <option value="Call_Night" className="bg-slate-900">Call / Night Duty (20:00 - 08:00)</option>
                <option value="Post_Call_Rest" className="bg-slate-900">Post-Call Rest (MDCAN Off)</option>
                <option value="Standby" className="bg-slate-900">Standby Reserve</option>
              </select>
            </div>

            {/* Add Shift Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Shift</span>
            </button>
          </div>
        </div>

        {/* Shift Legend & Regional Quick Indicators */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-300">Shift Types:</span>
            <span className="px-2 py-0.5 rounded border bg-amber-500/15 text-amber-300 border-amber-500/30">
              Morning (8am-2pm)
            </span>
            <span className="px-2 py-0.5 rounded border bg-blue-500/15 text-blue-300 border-blue-500/30">
              Afternoon (2pm-8pm)
            </span>
            <span className="px-2 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/40">
              Night Call (8pm-8am)
            </span>
            <span className="px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
              Post-Call Rest (24h Mandatory)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Home className="w-3 h-3" /> On-Campus Doctors Quarters
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <MapPin className="w-3 h-3" /> Off-Campus Residence
            </span>
          </div>
        </div>
      </div>

      {/* Roster Timeline Grouped View */}
      {groupedShifts.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-300">No matching shifts found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, department filter, or click "Assign Shift" to schedule a clinician.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedShifts.map(({ date, depts }) => {
            const dateObj = new Date(date);
            const dateTitle = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const isSaturday = dateObj.getDay() === 6;

            return (
              <div
                key={date}
                className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Date Header */}
                <div className="bg-slate-800/90 px-5 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {dateObj.getDate()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {dateTitle}
                        {isSaturday && (
                          <span className="text-[10px] font-medium bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-600/40">
                            Sanitation Saturday (Restricted early transit)
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {depts.reduce((acc, d) => acc + d.shifts.length, 0)} Active Clinical Assignments
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {date}
                  </span>
                </div>

                {/* Departments within this day */}
                <div className="divide-y divide-slate-800/60 p-4 space-y-4">
                  {depts.map(({ deptId, shifts: deptShifts }) => {
                    const deptInfo = DEPARTMENTS.find((d) => d.id === deptId);

                    return (
                      <div key={deptId} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getDeptIcon(deptId)}
                            <h4 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                              {deptInfo?.name || deptId}
                            </h4>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {deptShifts.length} staff
                            </span>
                          </div>
                        </div>

                        {/* Shift cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {deptShifts.map((shift) => {
                            const staff = staffMap.get(shift.staffId);
                            const isNightCall = shift.shiftType === 'Call_Night';
                            const isPostCall = shift.shiftType === 'Post_Call_Rest';
                            const isOnCampus = staff?.residence.includes('On-Campus');
                            const isHighFatigue = (staff?.fatigueScore || 0) >= 70;

                            return (
                              <div
                                key={shift.id}
                                className={`rounded-xl p-3.5 border transition-all hover:border-slate-600 bg-slate-950/90 relative group ${
                                  isNightCall
                                    ? 'border-purple-500/40 ring-1 ring-purple-500/10'
                                    : isPostCall
                                    ? 'border-emerald-500/30 bg-emerald-950/20'
                                    : 'border-slate-800'
                                }`}
                              >
                                {/* Top Bar: Shift Type badge + Time */}
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getShiftBadgeStyle(
                                      shift.shiftType
                                    )}`}
                                  >
                                    {shift.shiftType.replace('_', ' ')}
                                  </span>

                                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>
                                      {shift.startTime} - {shift.endTime}
                                    </span>
                                  </div>
                                </div>

                                {/* Clinician Info */}
                                <div className="flex items-start gap-3">
                                  <img
                                    src={
                                      staff?.avatarUrl ||
                                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
                                    }
                                    alt={staff?.name || 'Doctor'}
                                    className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <h5 className="text-xs font-bold text-white truncate">
                                        {staff?.name || 'Assigned Clinician'}
                                      </h5>
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-medium">
                                      {staff?.cadre}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {staff?.qualifications.slice(0, 2).join(' • ')}
                                    </div>
                                  </div>
                                </div>

                                {/* Role Description */}
                                <div className="mt-2.5 text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                                  <span className="font-medium text-slate-400">Role: </span>
                                  {shift.roleDescription}
                                </div>

                                {/* Residence & Fatigue Telemetry */}
                                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                                  <div className="flex items-center gap-1 truncate">
                                    {isOnCampus ? (
                                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                        <Home className="w-3 h-3 shrink-0" />
                                        <span>On-Campus Quarters</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-slate-400">
                                        <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                                        <span>Off-Campus Transit</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isHighFatigue ? (
                                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                        <AlertCircle className="w-3 h-3" />
                                        Fatigue: {staff?.fatigueScore}%
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">
                                        Fatigue: {staff?.fatigueScore || 25}%
                                      </span>
                                    )}

                                    {shift.isAiGenerated && (
                                      <span title="Generated by Gemini AI Optimization Engine">
                                        <Sparkles className="w-3 h-3 text-emerald-400" />
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Interactive Action Buttons */}
                                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                                  <button
                                    onClick={() => onRequestSwap(shift)}
                                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                                    title="Initiate Peer-to-Peer Shift Swap"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    <span>Swap</span>
                                  </button>

                                  <button
                                    onClick={() => onTriggerEmergencyForShift(shift)}
                                    className="text-rose-400/80 hover:text-rose-300 flex items-center gap-1 transition"
                                    title="Report Sudden Absence / Trigger AI Code Red Rebalancer"
                                  >
                                    <Shield className="w-3 h-3" />
                                    <span>Report Issue</span>
                                  </button>

                                  <button
                                    onClick={() => setEditingShift(shift)}
                                    className="text-slate-400 hover:text-blue-400 transition"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Schedule New Clinical Shift
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Date
                </label>
                <select
                  value={newShiftDate}
                  onChange={(e) => setNewShiftDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CURRENT_WEEK_DATES.map((d) => (
                    <option key={d} value={d}>
                      {d} ({new Date(d).toLocaleDateString('en-US', { weekday: 'long' })})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newShiftDept}
                    onChange={(e) => setNewShiftDept(e.target.value as DepartmentId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    Shift Slot
                  </label>
                  <select
                    value={newShiftType}
                    onChange={(e) => setNewShiftType(e.target.value as ShiftType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Morning">Morning (08:00 - 14:00)</option>
                    <option value="Afternoon">Afternoon (14:00 - 20:00)</option>
                    <option value="Call_Night">Call Duty / Night (20:00 - 08:00)</option>
                    <option value="Post_Call_Rest">Post-Call Rest (Mandatory)</option>
                    <option value="Standby">Standby Reserve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Clinician
                </label>
                <select
                  value={newShiftStaffId}
                  onChange={(e) => setNewShiftStaffId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Qualified Doctor or Nurse --</option>
                  {staffList
                    .filter((s) => s.hospitalId === hospitalId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.cadre}) - Fatigue: {s.fatigueScore}% - {s.residence}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinical Role / Ward Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Resuscitation Floor & Major Ward Rounds"
                  value={newShiftRole}
                  onChange={(e) => setNewShiftRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Details Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Shift Assignment Details
              </h3>
              <button
                onClick={() => setEditingShift(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const staff = staffMap.get(editingShift.staffId);
              const dept = DEPARTMENTS.find((d) => d.id === editingShift.departmentId);

              return (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                    <img
                      src={
                        staff?.avatarUrl ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={staff?.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{staff?.name}</h4>
                      <p className="text-emerald-400 font-medium">{staff?.cadre}</p>
                      <p className="text-slate-400 text-[11px]">{staff?.mcnNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Date</span>
                      <p className="font-medium text-white">{editingShift.date}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Shift</span>
                      <p className="font-medium text-white">{editingShift.shiftType.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Hours</span>
                      <p className="font-medium text-white">{editingShift.startTime} - {editingShift.endTime}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Department</span>
                      <p className="font-medium text-white truncate">{dept?.shortName}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Role & Clinical Mandate
                    </span>
                    <p className="text-slate-300">{editingShift.roleDescription}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Residence / Call Room:</span>
                      <span className="text-white font-medium">{staff?.residence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Hotline:</span>
                      <span className="text-emerald-400 font-mono">{staff?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Fatigue Score:</span>
                      <span
                        className={
                          (staff?.fatigueScore || 0) > 60
                            ? 'text-rose-400 font-bold'
                            : 'text-emerald-400'
                        }
                      >
                        {staff?.fatigueScore}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onDeleteShift(editingShift.id);
                        setEditingShift(null);
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs font-medium"
                    >
                      Delete Shift
                    </button>

                    <button
                      onClick={() => setEditingShift(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
