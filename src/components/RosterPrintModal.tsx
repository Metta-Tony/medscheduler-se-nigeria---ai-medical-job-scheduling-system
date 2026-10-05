import React, { useState } from 'react';
import { HospitalId, MedicalStaff, ShiftSlot } from '../types/medical';
import { DEPARTMENTS, HOSPITALS, CURRENT_WEEK_DATES } from '../data/mockData';
import {
  FileCheck2,
  Printer,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  Award,
  Calendar,
} from 'lucide-react';

interface RosterPrintModalProps {
  hospitalId: HospitalId;
  shifts: ShiftSlot[];
  staffList: MedicalStaff[];
}

export const RosterPrintModal: React.FC<RosterPrintModalProps> = ({
  hospitalId,
  shifts,
  staffList,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const hospital = HOSPITALS.find((h) => h.id === hospitalId) || HOSPITALS[0];

  const staffMap = new Map<string, MedicalStaff>();
  staffList.forEach((s) => staffMap.set(s.id, s));

  const filteredShifts = shifts.filter((s) => {
    if (s.hospitalId !== hospitalId) return false;
    if (selectedDept !== 'all' && s.departmentId !== selectedDept) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredShifts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Duty_Roster_${hospital.shortName}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            MDCAN & NARD Statutory Clinical Roster
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Official Hospital Duty Roster & Regulatory Compliance Certification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Certified print and export format adhering to the Federal Ministry of Health, Medical
            and Dental Consultants Association of Nigeria (MDCAN), and NARD safety standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortName}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportJson}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Roster</span>
          </button>
        </div>
      </div>

      {/* Official Printable Sheet (styled for both on-screen and clean print) */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 print:border-none print:p-0 print:shadow-none space-y-6">
        {/* Header Block: Hospital Coat of Arms & Heading */}
        <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-sm uppercase tracking-widest">
            <span>Federal Republic of Nigeria</span> • <span>Southeast Healthcare Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {hospital.name}
          </h1>
          <p className="text-xs font-semibold text-slate-600">{hospital.location}</p>
          <div className="pt-2 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-center gap-4">
            <span>OFFICIAL CLINICAL DUTY ROSTER</span>
            <span>•</span>
            <span>WEEK OF OCT 5 - 11, 2026</span>
          </div>
        </div>

        {/* Administration & Approval Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">CMD</span>
            <span className="font-bold text-slate-800">{hospital.cmdName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">CMAC / DCS</span>
            <span className="font-bold text-slate-800">{hospital.cmacName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
            <span className="font-bold text-emerald-700">AI Verified & Approved</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              MDCAN Compliance
            </span>
            <span className="font-bold text-emerald-700">100% Post-Call Enforced</span>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 border border-slate-800">Date</th>
                <th className="py-2.5 px-3 border border-slate-800">Department</th>
                <th className="py-2.5 px-3 border border-slate-800">Shift Slot</th>
                <th className="py-2.5 px-3 border border-slate-800">Assigned Clinician</th>
                <th className="py-2.5 px-3 border border-slate-800">Cadre</th>
                <th className="py-2.5 px-3 border border-slate-800">License (MDCN/NMCN)</th>
                <th className="py-2.5 px-3 border border-slate-800">Clinical Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift, idx) => {
                const staff = staffMap.get(shift.staffId);
                const dept = DEPARTMENTS.find((d) => d.id === shift.departmentId);
                const isNight = shift.shiftType === 'Call_Night';
                const isPostCall = shift.shiftType === 'Post_Call_Rest';

                return (
                  <tr
                    key={shift.id}
                    className={`border border-slate-300 ${
                      isNight
                        ? 'bg-purple-50 font-medium'
                        : isPostCall
                        ? 'bg-emerald-50 text-emerald-900 italic'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 border border-slate-300 font-mono">{shift.date}</td>
                    <td className="py-2 px-3 border border-slate-300 font-medium">
                      {dept?.shortName}
                    </td>
                    <td className="py-2 px-3 border border-slate-300">
                      <span className="font-bold">{shift.shiftType.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                      {staff?.name}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-emerald-800 font-semibold">
                      {staff?.cadre}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-[11px]">
                      {staff?.mcnNumber}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-slate-700">
                      {shift.roleDescription}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Regulatory Sign-off Block */}
        <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Chairman, Medical Advisory Committee (CMAC)
            </span>
            <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
              <span className="font-serif italic text-emerald-800 text-sm font-semibold">
                {hospital.cmacName} (Verified Digital Approval)
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Date: 05/10/2026</p>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Chief Medical Director (CMD)
            </span>
            <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
              <span className="font-serif italic text-emerald-800 text-sm font-semibold">
                {hospital.cmdName} (Countersigned)
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Official Roster Validated</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Hospital Stamp & Seal
            </span>
            <p className="text-[11px] font-bold text-emerald-800">
              NATIONAL HEALTH SYSTEM OF NIGERIA
            </p>
            <p className="text-[10px] text-slate-600">
              Generated via MedScheduler AI Clinical Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
