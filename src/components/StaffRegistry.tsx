import React, { useState, useMemo } from 'react';
import {
  DepartmentId,
  HospitalId,
  MedicalCadre,
  MedicalStaff,
} from '../types/medical';
import { DEPARTMENTS, HOSPITALS } from '../data/mockData';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Home,
  MapPin,
  Award,
  Sparkles,
  X,
  Stethoscope,
  Building,
} from 'lucide-react';

interface StaffRegistryProps {
  hospitalId: HospitalId;
  staffList: MedicalStaff[];
  onAddStaff: (newStaff: MedicalStaff) => void;
}

export const StaffRegistry: React.FC<StaffRegistryProps> = ({
  hospitalId,
  staffList,
  onAddStaff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCadre, setSelectedCadre] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newCadre, setNewCadre] = useState<MedicalCadre>('Registrar');
  const [newDept, setNewDept] = useState<DepartmentId>('accident_emergency');
  const [newMcn, setNewMcn] = useState('');
  const [newPhone, setNewPhone] = useState('+234 ');
  const [newEmail, setNewEmail] = useState('');
  const [newResidence, setNewResidence] = useState<any>('Doctors Quarters (On-Campus)');
  const [newQualifications, setNewQualifications] = useState('MBBS, BLS');
  const [newSkills, setNewSkills] = useState('Emergency Triage, Cannulation');

  const hospital = HOSPITALS.find((h) => h.id === hospitalId) || HOSPITALS[0];

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (s.hospitalId !== hospitalId) return false;
      if (selectedCadre !== 'all' && s.cadre !== selectedCadre) return false;
      if (selectedDept !== 'all' && s.departmentId !== selectedDept) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchMcn = s.mcnNumber.toLowerCase().includes(query);
        const matchQual = s.qualifications.some((q) => q.toLowerCase().includes(query));
        const matchSkills = s.specialSkills.some((sk) => sk.toLowerCase().includes(query));
        if (!matchName && !matchMcn && !matchQual && !matchSkills) return false;
      }
      return true;
    });
  }, [staffList, hospitalId, selectedCadre, selectedDept, searchQuery]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: MedicalStaff = {
      id: `staff_${Date.now()}`,
      name: newName,
      cadre: newCadre,
      departmentId: newDept,
      hospitalId,
      qualifications: newQualifications.split(',').map((q) => q.trim()),
      mcnNumber: newMcn || `MDCN/${Math.floor(10000 + Math.random() * 90000)}`,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/[^a-z]/g, '')}@${hospital.shortName.toLowerCase().replace(/[^a-z]/g, '')}.edu.ng`,
      avatarUrl:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      residence: newResidence,
      weeklyMaxHours: 48,
      currentWeeklyHours: 24,
      fatigueScore: 20,
      consecutiveCallNights: 0,
      specialSkills: newSkills.split(',').map((s) => s.trim()),
      isActive: true,
    };

    onAddStaff(created);
    setShowAddModal(false);
    setNewName('');
    setNewMcn('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Medical Workforce & Credential Directory
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Clinical Personnel Registry & Licensing Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Directory of certified consultants, resident doctors, house officers, and nursing
            officers registered under MDCN and NMCN for {hospital.name}.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Clinician</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, MDCN license number, qualifications (FWACS, FMCOG)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedCadre}
              onChange={(e) => setSelectedCadre(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Cadres</option>
              <option value="Consultant">Consultant</option>
              <option value="Senior Registrar">Senior Registrar</option>
              <option value="Registrar">Registrar</option>
              <option value="House Officer">House Officer</option>
              <option value="Chief Nursing Officer">Chief Nursing Officer</option>
              <option value="Senior Nursing Officer">Senior Nursing Officer</option>
              <option value="Nursing Officer">Nursing Officer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => {
          const dept = DEPARTMENTS.find((d) => d.id === staff.departmentId);
          const isOnCampus = staff.residence.includes('On-Campus');

          return (
            <div
              key={staff.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Photo + Name + Cadre */}
                <div className="flex items-start gap-3">
                  <img
                    src={staff.avatarUrl}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{staff.name}</h4>
                    <p className="text-xs font-semibold text-emerald-400">{staff.cadre}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {staff.mcnNumber}
                    </span>
                  </div>
                </div>

                {/* Department badge */}
                <div className="text-[11px] font-medium text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <span>{dept?.name || staff.departmentId}</span>
                  <span className="text-emerald-400 text-[10px] font-mono">Active</span>
                </div>

                {/* Qualifications */}
                <div className="text-xs text-slate-400">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Qualifications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {staff.qualifications.map((q, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Clinical Skills */}
                <div className="text-xs text-slate-400">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Special Competencies
                  </span>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {staff.specialSkills.join(', ')}
                  </p>
                </div>
              </div>

              {/* Footer: Contacts & Residence */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{staff.residence}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-mono text-emerald-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {staff.phone}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    Fatigue: {staff.fatigueScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Clinician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Register Healthcare Practitioner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Full Name (with Prefix)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ngozi Ezechukwu"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Medical Cadre</label>
                  <select
                    value={newCadre}
                    onChange={(e) => setNewCadre(e.target.value as MedicalCadre)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Consultant">Consultant</option>
                    <option value="Senior Registrar">Senior Registrar</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Medical Officer">Medical Officer</option>
                    <option value="House Officer">House Officer</option>
                    <option value="Chief Nursing Officer">Chief Nursing Officer</option>
                    <option value="Senior Nursing Officer">Senior Nursing Officer</option>
                    <option value="Nursing Officer">Nursing Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as DepartmentId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    MDCN / NMCN Reg Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MDCN/79241"
                    value={newMcn}
                    onChange={(e) => setNewMcn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+234 803 ..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Residential Quarters
                </label>
                <select
                  value={newResidence}
                  onChange={(e) => setNewResidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Doctors Quarters (On-Campus)">
                    Doctors Quarters (On-Campus - 5 min walk)
                  </option>
                  <option value="Off-Campus (Enugu Urban)">
                    Off-Campus (Enugu Urban / Independence Layout)
                  </option>
                  <option value="Off-Campus (Nnewi)">Off-Campus (Nnewi Urban)</option>
                  <option value="Off-Campus (Umuahia)">Off-Campus (Umuahia)</option>
                  <option value="Off-Campus (Abakaliki)">Off-Campus (Abakaliki)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Qualifications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="MBBS (UNN), FWACS, ATLS"
                  value={newQualifications}
                  onChange={(e) => setNewQualifications(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Special Competencies / Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. Major Trauma, Cesarean Section, POCUS"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  Add Clinician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
